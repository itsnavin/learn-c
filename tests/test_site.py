"""Browser checks; compile every full C lesson example if gcc is available."""
import functools
import http.server
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
import unittest
from urllib.parse import unquote, urljoin, urlparse

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class WebsiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(QuietHandler, directory=str(ROOT))
        )
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = os.environ.get("SITE_URL", f"http://127.0.0.1:{cls.server.server_port}/")
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1280, "height": 900})
        self.route_local_assets(self.context)
        self.page = self.context.new_page()
        self.errors = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        response = self.page.goto(self.url)
        self.assertEqual(response.status, 200)
        self.page.wait_for_selector("#questions form")

    def route_local_assets(self, context):
        # Optional file-backed HTTP responses for hosts that block loopback traffic.
        if os.environ.get("LOCAL_ASSETS") != "1":
            return

        def serve(route):
            path = unquote(urlparse(route.request.url).path).lstrip("/") or "index.html"
            file = (ROOT / path).resolve()
            if not file.is_relative_to(ROOT) or not file.is_file():
                route.fulfill(status=404, body="Not found")
                return
            mime = {".html": "text/html", ".css": "text/css",
                    ".js": "text/javascript", ".c": "text/plain",
                    ".py": "text/plain"}.get(file.suffix, "text/plain")
            route.fulfill(status=200, content_type=mime, body=file.read_bytes())

        context.route(self.url + "**", serve)

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [], "Browser JavaScript errors")

    def test_curriculum_and_every_quiz_choice(self):
        curriculum = self.page.evaluate("lessons")
        self.assertEqual(len(curriculum), 25)
        self.assertEqual(len({lesson["id"] for lesson in curriculum}), len(curriculum))
        self.assertEqual(self.page.locator(".lesson-link").count(), len(curriculum))
        for lesson in curriculum:
            self.assertTrue(lesson["summary"])
            self.assertGreater(len(lesson["body"]), 400)
            self.page.goto(self.url + "#" + lesson["id"])
            self.assertEqual(self.page.locator("#lesson h2").inner_text(), lesson["title"])
            for index, question in enumerate(lesson["quiz"]):
                self.assertIn(question["answer"], range(len(question["options"])))
                self.assertTrue(question["explanation"])
                form = self.page.locator("#questions form").nth(index)
                for option in range(len(question["options"])):
                    form.locator("input").nth(option).check()
                    form.get_by_role("button", name="Check answer").click()
                    feedback = form.get_by_role("status")
                    self.assertIn(question["explanation"], feedback.inner_text())
                    self.assertEqual("wrong" in (feedback.get_attribute("class") or ""),
                                     option != question["answer"])
                self.assertTrue(form.locator("input").first.get_attribute("required") is not None)

    def test_navigation_progress_reload_and_reset(self):
        self.page.get_by_role("button", name="Mark lesson complete").click()
        self.assertIn("1 of 25", self.page.locator("#progress-text").inner_text())
        self.page.reload()
        self.assertTrue(self.page.get_by_role("button", name="Completed").is_disabled())
        self.page.get_by_role("link", name="Next lesson").click()
        self.assertTrue(self.page.url.endswith("#variables"))
        self.page.get_by_role("link", name="Previous", exact=True).click()
        self.assertTrue(self.page.url.endswith("#welcome"))
        self.page.on("dialog", lambda dialog: dialog.accept())
        self.page.get_by_role("button", name="Reset saved progress").click()
        self.assertIn("0 of 25", self.page.locator("#progress-text").inner_text())
        self.assertTrue(self.page.get_by_role("button", name="Mark lesson complete").is_enabled())

    def test_search_unknown_route_and_no_injection(self):
        self.page.locator("#search").fill("pointer")
        self.assertGreater(self.page.locator(".lesson-link").count(), 0)
        self.assertLess(self.page.locator(".lesson-link").count(), 25)
        self.page.locator("#search").fill("nothing-will-match-this")
        self.assertTrue(self.page.locator("#no-results").is_visible())
        self.page.goto(self.url + '#%3Cimg%20src=x%20onerror=alert(1)%3E')
        self.assertEqual(self.page.locator("#lesson h2").inner_text(), "Lesson not found")
        self.assertEqual(self.page.locator("#lesson img").count(), 0)
        self.page.locator("#lesson a").click()
        expect(self.page.locator("#lesson h2")).to_have_text("Your first C program")

    def test_local_links_and_downloads(self):
        links = self.page.evaluate("""() => {
          const doc = document.createElement('div');
          doc.innerHTML = lessons.map(l => l.body).join('');
          return [...doc.querySelectorAll('a')].map(a => a.getAttribute('href'));
        }""")
        for link in set(links):
            if not urlparse(link).scheme and not link.startswith("#"):
                if os.environ.get("LOCAL_ASSETS") == "1":
                    self.assertTrue((ROOT / link).is_file(), link)
                    self.assertTrue((ROOT / link).read_bytes(), link)
                else:
                    response = self.context.request.get(urljoin(self.url, link))
                    self.assertEqual(response.status, 200, link)
                    self.assertTrue(response.body(), link)

    def test_responsive_mobile_and_desktop(self):
        output = ROOT / "test-results"
        output.mkdir(exist_ok=True)
        for width in (390, 1280):
            self.page.set_viewport_size({"width": width, "height": 900})
            for lesson in ("welcome", "binary", "hello-module", "character-write"):
                self.page.goto(self.url + "#" + lesson)
                expect(self.page.locator(".lesson-link[aria-current=page]")).to_have_attribute(
                    "href", "#" + lesson)
                self.assertTrue(self.page.evaluate(
                    "document.documentElement.scrollWidth <= window.innerWidth"
                ), f"Horizontal overflow at {width}px in {lesson}")
            self.page.screenshot(path=str(output / f"site-{width}.png"), full_page=True)
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.assertFalse(self.page.locator("#navigation").is_visible())
        menu = self.page.locator("#menu-toggle")
        menu.click()
        self.assertEqual(menu.get_attribute("aria-expanded"), "true")
        self.page.locator('.lesson-link[href="#pointers"]').click()
        expect(self.page.locator("#navigation")).to_be_hidden()
        self.assertEqual(menu.get_attribute("aria-expanded"), "false")
        self.assertEqual(self.page.evaluate("document.activeElement.id"), "lesson")

    def test_corrupt_and_unavailable_storage(self):
        self.page.evaluate("localStorage.setItem('c-to-devices-progress-v1', 'broken')")
        self.page.reload()
        self.assertIn("could not be read", self.page.locator("#storage-status").inner_text())
        self.page.get_by_role("button", name="Mark lesson complete").click()
        self.assertEqual(self.page.locator("#storage-status").inner_text(), "")
        with self.browser.new_context() as context:
            self.route_local_assets(context)
            context.add_init_script("""Object.defineProperty(window, 'localStorage', {
              get() { throw new Error('Storage disabled'); }
            });""")
            page = context.new_page()
            page.goto(self.url)
            page.get_by_role("button", name="Mark lesson complete").click()
            self.assertIn("could not be saved", page.locator("#storage-status").inner_text())
            self.assertIn("1 of 25", page.locator("#progress-text").inner_text())

    def test_compile_complete_c_examples(self):
        compiler = shutil.which("gcc")
        if not compiler:
            if os.environ.get("REQUIRE_C") == "1":
                self.fail("gcc is required for CI")
            self.skipTest("gcc unavailable locally; CI compiles the examples on Linux")
        examples = self.page.evaluate("cExamples")
        self.assertEqual(len(examples), 17)
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            for index, example in enumerate(examples):
                source = folder / f"lesson-{index}.c"
                executable = folder / f"lesson-{index}"
                source.write_text(example["source"], encoding="utf-8")
                subprocess.run([compiler, "-std=c11", "-Wall", "-Wextra", "-Werror",
                                str(source), "-o", str(executable)], check=True,
                               capture_output=True, text=True)
                result = subprocess.run([str(executable)], check=True, capture_output=True,
                                        text=True, timeout=5)
                self.assertEqual(result.stdout, example["output"], f"Example {index}")
                self.assertEqual(result.stderr, "")


if __name__ == "__main__":
    unittest.main(verbosity=2)
