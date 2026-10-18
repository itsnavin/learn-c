/* Lesson HTML is trusted, repository-owned curriculum, never user input. */
"use strict";
const storageKey = "c-to-devices-progress-v1";
let completed = new Set();
const storageStatus = document.getElementById("storage-status");
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (!Array.isArray(saved) || saved.some(id => typeof id !== "string")) {
    throw new Error("Invalid saved progress");
  }
  completed = new Set(saved.filter(id => lessons.some(lesson => lesson.id === id)));
} catch (error) {
  storageStatus.textContent = "Saved progress could not be read. You can still learn; progress starts fresh in this tab.";
}
const list = document.getElementById("lesson-list");
const article = document.getElementById("lesson");
const search = document.getElementById("search");
const navigation = document.getElementById("navigation");
const menu = document.getElementById("menu-toggle");
let current;

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...completed]));
    storageStatus.textContent = "";
  } catch (error) {
    storageStatus.textContent = "Progress could not be saved. It will last only in this tab.";
  }
}

function renderNavigation() {
  list.replaceChildren();
  let matches = 0;
  for (const track of ["C foundations", "Linux drivers"]) {
    const matching = lessons.filter(lesson => lesson.track === track &&
      `${lesson.title} ${lesson.summary} ${lesson.track}`.toLowerCase().includes(search.value.toLowerCase().trim()));
    if (!matching.length) continue;
    const heading = document.createElement("h2");
    heading.className = "track-title";
    heading.textContent = track;
    list.append(heading);
    for (const lesson of matching) {
      matches++;
      const link = document.createElement("a");
      link.className = "lesson-link";
      link.href = `#${lesson.id}`;
      if (lesson === current) link.setAttribute("aria-current", "page");
      const number = document.createElement("span");
      number.className = "lesson-number";
      number.textContent = completed.has(lesson.id) ? "✓" : String(lessons.indexOf(lesson) + 1).padStart(2, "0");
      const title = document.createElement("span");
      title.textContent = lesson.title;
      if (completed.has(lesson.id)) link.setAttribute("aria-label", `${lesson.title}, completed`);
      link.append(number, title);
      list.append(link);
    }
  }
  document.getElementById("no-results").hidden = matches !== 0;
  document.getElementById("progress-text").textContent = `${completed.size} of ${lessons.length} lessons completed`;
  const progress = document.getElementById("progress");
  progress.max = lessons.length;
  progress.value = completed.size;
}

function renderLesson(focus = true) {
  const id = location.hash.slice(1) || "welcome";
  current = lessons.find(lesson => lesson.id === id);
  if (!current) {
    article.innerHTML = '<h2>Lesson not found</h2><p>This link does not match a lesson. <a href="#welcome">Start with your first C program</a> or choose a lesson from the navigation.</p>';
    document.title = "Lesson not found - C to Devices";
    renderNavigation();
    if (focus) article.focus();
    return;
  }
  const index = lessons.indexOf(current);
  document.title = `${current.title} - C to Devices`;
  article.innerHTML = `<div class="lesson-meta">${current.track} / LESSON ${index + 1} / ${current.minutes} MIN</div>
    <h2>${current.title}</h2><p>${current.summary}</p>${current.body}
    <section class="quiz" aria-labelledby="quiz-title"><h3 id="quiz-title">Check your understanding</h3>
    <p>Choose an answer, then check it. A wrong answer is a chance to learn.</p><div id="questions"></div></section>
    <div class="lesson-actions"><button id="complete">Mark lesson complete</button>
    ${index > 0 ? `<a class="button secondary" href="#${lessons[index - 1].id}">Previous</a>` : ""}
    ${index < lessons.length - 1 ? `<a class="button secondary" href="#${lessons[index + 1].id}">Next lesson →</a>` : '<a class="button secondary" href="#welcome">Back to the beginning</a>'}
    <span class="complete-note">Completion is self-paced; revisit any lesson.</span></div>`;
  const questions = document.getElementById("questions");
  current.quiz.forEach((question, questionIndex) => {
    const form = document.createElement("form");
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = question.question;
    fieldset.append(legend);
    question.options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      label.className = "option";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `question-${questionIndex}`;
      radio.value = String(optionIndex);
      radio.required = true;
      const text = document.createElement("span");
      text.textContent = option;
      label.append(radio, text);
      fieldset.append(label);
    });
    const check = document.createElement("button");
    check.type = "submit";
    check.textContent = "Check answer";
    const feedback = document.createElement("p");
    feedback.setAttribute("role", "status");
    feedback.hidden = true;
    form.append(fieldset, check, feedback);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const selected = form.querySelector("input:checked");
      if (!selected) return;
      const correct = Number(selected.value) === question.answer;
      feedback.className = `feedback${correct ? "" : " wrong"}`;
      feedback.textContent = `${correct ? "Correct!" : `Not quite. The answer is: ${question.options[question.answer]}.`} ${question.explanation}`;
      feedback.hidden = false;
    });
    questions.append(form);
  });
  const complete = document.getElementById("complete");
  function updateComplete() {
    complete.textContent = completed.has(current.id) ? "Completed ✓" : "Mark lesson complete";
    complete.disabled = completed.has(current.id);
  }
  updateComplete();
  complete.addEventListener("click", () => {
    completed.add(current.id);
    saveProgress();
    updateComplete();
    renderNavigation();
  });
  renderNavigation();
  navigation.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
  if (focus) article.focus();
}
search.addEventListener("input", renderNavigation);
menu.addEventListener("click", () => {
  const open = navigation.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});
document.getElementById("reset-progress").addEventListener("click", () => {
  if (!window.confirm("Reset all completed lessons in this browser?")) return;
  completed.clear();
  saveProgress();
  renderLesson(false);
});
window.addEventListener("hashchange", () => renderLesson());
renderLesson(false);
