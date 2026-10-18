# C to Devices

A beginner-friendly, static C and Linux driver learning website. Short lessons use
sensor/device examples, followed by quizzes with corrective explanations.

**Website:** https://itsnavin.github.io/learn-c/

## Learn in small steps

The 25 lessons cover first programs, variables, `int`, `printf`, `double`,
formatting, arithmetic and integer division, `if/else`, `while`, `for`, functions,
arrays and bounds, pointers, structs, struct pointers, strings, `sizeof`,
`size_t`/`%zu`, updating original objects through pointers, NULL and lifetime
safety, binary place values, AND/OR and nonzero conditions.

The Linux track covers a safe VM, user/kernel space, module lifecycle, Kbuild,
logging, driver categories and subsystems, character-device reads/writes,
error handling, mutexes, buses and the next steps toward real sensors.
The separate [bit calculator](https://itsnavin.github.io/learn-bits/) is linked,
not modified.

Navigation supports deep links and search; completion is saved locally in the
browser and can be reset. No accounts, analytics, remote execution, build step,
or frontend dependencies. The site does **not** compile or execute C.

## Run the website locally

With Python 3 installed, run from the repository root:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/ (on Windows, use `py` instead of `python` if needed).
Serve over HTTP rather than opening `index.html` as a file, so browser storage
and downloads behave consistently.

## Validate

Python 3.10+ is needed for the development checks:

```sh
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
python -m unittest discover -s tests -v
```

On Linux, `gcc` also compiles all 17 complete C lesson examples with
`-std=c11 -Wall -Wextra -Werror` and checks their exact output. Without gcc, only
that check is skipped; CI requires it. Browser checks cover every quiz choice,
lesson routes, search, progress/reload/reset, missing and corrupt storage,
downloads, narrow/wide layout overflow, and mobile navigation. Screenshots go
to ignored `test-results/`.

If host security software blocks loopback HTTP, set `LOCAL_ASSETS=1` for the
browser suite to fulfill local asset requests from repository files. CI uses a
real local HTTP server. Set `SITE_URL` to test a published deployment instead.

CI runs those checks on Ubuntu 24.04 and builds both modules against installed
Linux **6.8** generic headers with warnings treated as errors. It deliberately
does not load modules on the shared runner. Passing compilation is not proof of
runtime or hardware safety; the VM smoke test is a separate check.

## Kernel labs: disposable VM only

Target: **Linux 6.8, x86-64, Ubuntu 24.04 original generic kernel**. Newer Ubuntu
installer/HWE kernels may differ: check `uname -r`, not just the distribution
name. Use matching headers and a restorable VM snapshot. Containers share the
host kernel and are not an equivalent kernel-lab boundary. Do not force-load
modules or disable host protections.

Inside the VM:

```sh
sudo apt update
sudo apt install build-essential linux-headers-$(uname -r)
cd labs/hello
make
sudo insmod hello.ko
sudo dmesg | tail -n 20
sudo rmmod hello
sudo dmesg | tail -n 20
make clean
```

The hello module logs its lifecycle. For the software-only character device:

```sh
cd ../sensor
make
sudo insmod learn_sensor.ko
sudo cat /dev/learn_sensor
printf '31000\n' | sudo tee /dev/learn_sensor
sudo cat /dev/learn_sensor
sudo python3 test_sensor.py
sudo rmmod learn_sensor
make clean
```

Expect initial `25000`, then `31000` (millidegrees Celsius). The node is root-only
(0600). Parsing and range errors are returned; one mutex protects shared state;
open files pin the module; unload deregisters it. Every read call gets a coherent
snapshot, not a guaranteed per-open snapshot across concurrent partial reads.
The VM smoke script checks boundaries, bad input, permissions, EOF, partial reads
and concurrent readers/writers. It updates the teaching reading; no real hardware
is involved. Close open files before normal unload.

If load fails, inspect the error and kernel logs. Header mismatch and Secure Boot
module-signing rules are common causes. Do not bypass errors with force loading.
Kernel APIs change: these examples use miscdevice to avoid manual cdev/class
boilerplate. In particular, `class_create` no longer takes `THIS_MODULE` on 6.8
(that change occurred in 6.4). Driver floating-point code is not ordinary
user-space C: use scaled integers and the relevant kernel subsystem.

## Publish with GitHub Pages

In repository **Settings → Pages → Build and deployment**, choose **GitHub
Actions**. Push to `main` (or run the workflow manually). The
`Validate and publish learning site` workflow publishes only after browser,
C-example, and kernel-module build checks pass. The deployment job uses the
`github-pages` environment and Pages/OIDC permissions.

The site uses relative asset/download URLs and hash-based lesson links so it
works under the `/learn-c/` project path. No external code execution service or
secret is needed.

## Edit the curriculum

Lessons and questions live in `lessons.js`; layout is in `index.html` and
`styles.css`; interactions are in `app.js`. Only repository-owned lesson HTML
is rendered as HTML. Each lesson has a stable id, track, summary, body and quiz.
Full standalone C programs use `program(source, expectedOutput)` so validation
compiles and checks them; partial kernel snippets are explicitly labeled and
the complete runnable module sources live in `labs/`.

Update the expected lesson/example counts in tests when intentionally adding
content. Keep explanations, downloads, and actual source in sync.
