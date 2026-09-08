"use strict";

const STORAGE = {
  selections: "doshaSelections",
  language: "doshaLanguage",
  section: "doshaSection",
  started: "doshaStarted"
};
const sectionIds = ["physical", "functional", "psychological"];
const doshas = ["vata", "pitta", "kapha"];
let currentLang = localStorage.getItem(STORAGE.language) || "vi";
let currentView = "quiz";
let currentSection = Number(localStorage.getItem(STORAGE.section) || 0);
let started = localStorage.getItem(STORAGE.started) === "true";
let isSharedView = false;
let selections = { name: "", prakruti: {}, vikruti: {} };

const t = {
  en: {
    header: "Ayurvedic Dosha Quiz",
    introTitle: "Discover Your Ayurvedic Constitution",
    introCopy: "A quiet moment of observation to understand your natural constitution and what may be changing now.",
    prakrutiCopy: "Your natural constitution and the relatively stable tendencies you have experienced throughout life.",
    vikrutiCopy: "Changes or imbalances that are showing themselves at the present time.",
    meta: "31 questions · approximately 8–10 minutes",
    name: "Your name (optional)", start: "Start the Quiz",
    sections: ["A. Physical", "B. Body functions", "C. Psychological"],
    sectionNames: ["Physical Characteristics", "Physical Functional Characteristics", "Psychological Characteristics"],
    part: "Section", questions: "in this section", overall: "overall",
    long: "Long-term tendency", longHelp: "Choose one description that best represents you historically.",
    current: "Current imbalance", currentHelp: "Select only if this characteristic is currently present or increased. Optional; select again to clear.",
    previous: "Previous", continue: "Continue", results: "View results",
    unanswered: n => `You still have ${n} unanswered long-term tendency question${n === 1 ? "" : "s"}.`,
    jump: "Go to first unanswered", resultsTitle: "Your Ayurvedic profile",
    namedTitle: name => `${name}'s Ayurvedic Profile`, natural: "Natural constitution — Prakruti",
    imbalance: "Current imbalance — Vikruti", rank: "Rank", primary: "Primary", secondary: "Secondary", tertiary: "Tertiary", tied: "Tied",
    noVikruti: "No current imbalance selected", noVikrutiBody: "You did not select any characteristics as a current imbalance.",
    copy: "Copy link", copied: "Link copied", share: "Share", sharedCopy: "Link copied", print: "Print", reset: "Retake quiz",
    shareError: "We couldn't create a sharing link. Please try again.", sharedLoadError: "This shared profile could not be loaded. You can still take the quiz yourself.",
    viewQuiz: "Dosha Quiz", viewForm: "Intake Form", shared: "You are viewing a shared Dosha profile.",
    takeOwn: "Take the quiz yourself", notDiagnosis: "This educational reflection is not a medical diagnosis.",
    vataInfo: "Air & Space — the energy of movement. In balance, Vata supports creativity, vitality and adaptability. Out of balance, it may show as anxiety, dryness, irregular digestion or restlessness.",
    pittaInfo: "Fire & Water — the energy of transformation. In balance, Pitta supports intelligence, courage and strong digestion. Out of balance, it may show as irritability, excess heat, inflammation or burnout.",
    kaphaInfo: "Earth & Water — the energy of structure and stability. In balance, Kapha supports calmness, compassion and endurance. Out of balance, it may show as heaviness, lethargy, attachment or congestion."
  },
  vi: {
    header: "Bài trắc nghiệm Ayurveda", introTitle: "Khám phá thể trạng Ayurveda của bạn",
    introCopy: "Một khoảng lặng để quan sát thể trạng tự nhiên của bạn và những gì có thể đang thay đổi ở hiện tại.",
    prakrutiCopy: "Thể trạng tự nhiên và những khuynh hướng tương đối ổn định của bạn từ trước đến nay.",
    vikrutiCopy: "Những thay đổi hoặc mất cân bằng đang biểu hiện ở thời điểm hiện tại.",
    meta: "Bài trắc nghiệm gồm 31 câu · khoảng 8–10 phút", name: "Tên của bạn (không bắt buộc)", start: "Bắt đầu bài trắc nghiệm",
    sections: ["A. Thể chất", "B. Chức năng cơ thể", "C. Tâm lý"],
    sectionNames: ["Đặc điểm thể chất", "Đặc điểm chức năng cơ thể", "Đặc điểm tâm lý"],
    part: "Phần", questions: "câu trong phần này", overall: "tổng cộng",
    long: "Khuynh hướng lâu dài", longHelp: "Chọn 1 đáp án mô tả bạn từ trước đến nay.",
    current: "Mất cân bằng hiện tại", currentHelp: "Chỉ đánh dấu nếu đặc điểm này đang xuất hiện hoặc tăng lên hiện nay. Không bắt buộc; chọn lại để bỏ.",
    previous: "Quay lại", continue: "Tiếp tục", results: "Xem kết quả",
    unanswered: n => `Bạn còn ${n} câu chưa chọn ở phần Khuynh hướng lâu dài.`, jump: "Đến câu đầu tiên",
    resultsTitle: "Hồ sơ thể trạng Ayurveda", namedTitle: name => `Hồ sơ Ayurveda của ${name}`,
    natural: "Thể trạng tự nhiên — Prakruti", imbalance: "Mất cân bằng hiện tại — Vikruti",
    rank: "Xếp hạng", primary: "Chính", secondary: "Phụ", tertiary: "Thứ ba", tied: "Đồng hạng",
    noVikruti: "Chưa ghi nhận mất cân bằng hiện tại", noVikrutiBody: "Bạn chưa chọn đặc điểm nào ở phần Mất cân bằng hiện tại.",
    copy: "Sao chép liên kết", copied: "Đã sao chép liên kết", share: "Chia sẻ", sharedCopy: "Đã sao chép liên kết", print: "In hồ sơ", reset: "Làm lại",
    shareError: "Không thể tạo liên kết chia sẻ. Vui lòng thử lại.", sharedLoadError: "Không thể tải hồ sơ được chia sẻ này. Bạn vẫn có thể làm bài trắc nghiệm của mình.", viewQuiz: "Bài trắc nghiệm", viewForm: "Hồ sơ y tế",
    shared: "Bạn đang xem một hồ sơ thể trạng được chia sẻ.", takeOwn: "Làm bài trắc nghiệm của tôi",
    notDiagnosis: "Nội dung mang tính giáo dục, không phải chẩn đoán y khoa.",
    vataInfo: "Khí & Không gian — năng lượng của chuyển động. Khi cân bằng, Vata hỗ trợ sự sáng tạo, sức sống và khả năng thích nghi. Khi mất cân bằng, có thể biểu hiện lo âu, khô ráp, tiêu hóa thất thường hoặc bồn chồn.",
    pittaInfo: "Lửa & Nước — năng lượng của chuyển hóa. Khi cân bằng, Pitta hỗ trợ trí tuệ, lòng can đảm và tiêu hóa khỏe. Khi mất cân bằng, có thể biểu hiện cáu kỉnh, dư nhiệt, viêm hoặc kiệt sức.",
    kaphaInfo: "Đất & Nước — năng lượng của cấu trúc và ổn định. Khi cân bằng, Kapha hỗ trợ sự điềm tĩnh, lòng từ bi và sức bền. Khi mất cân bằng, có thể biểu hiện nặng nề, trì trệ, bám chấp hoặc tắc nghẽn."
  }
};

function esc(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
function normalizeSelections(value) {
  return { name: value?.name || "", prakruti: value?.prakruti || {}, vikruti: value?.vikruti || {} };
}
function loadLocalData() {
  try { selections = normalizeSelections(JSON.parse(localStorage.getItem(STORAGE.selections))); }
  catch (error) { console.warn("Stored quiz state could not be read", error); }
}
function saveLocalData() {
  if (isSharedView) return;
  localStorage.setItem(STORAGE.selections, JSON.stringify(selections));
  localStorage.setItem(STORAGE.language, currentLang);
  localStorage.setItem(STORAGE.section, String(currentSection));
}
function saveName() {
  selections.name = document.getElementById("user-name").value.trim();
  saveLocalData();
}
function setLang(lang) {
  const showingResults = Boolean(document.getElementById("results").innerHTML);
  currentLang = lang;
  document.documentElement.lang = lang;
  if (!isSharedView) localStorage.setItem(STORAGE.language, lang);
  renderChrome();
  if (showingResults) displayDashboard(getCurrentCounts(), isSharedView);
  else if (started) renderQuiz();
}
function renderChrome() {
  const x = t[currentLang];
  document.getElementById("header-title").textContent = x.header;
  document.getElementById("intro-title").textContent = x.introTitle;
  document.getElementById("intro-copy").textContent = x.introCopy;
  document.getElementById("prakruti-copy").textContent = x.prakrutiCopy;
  document.getElementById("vikruti-copy").textContent = x.vikrutiCopy;
  document.getElementById("quiz-meta").textContent = x.meta;
  document.getElementById("name-label").textContent = x.name;
  document.getElementById("user-name").value = selections.name;
  document.getElementById("start-btn").textContent = x.start;
  document.getElementById("btn-view-quiz").textContent = x.viewQuiz;
  document.getElementById("btn-view-form").textContent = x.viewForm;
  ["vi", "en"].forEach(lang => {
    const button = document.getElementById(`btn-${lang}`);
    button.classList.toggle("active", lang === currentLang);
    button.setAttribute("aria-pressed", String(lang === currentLang));
  });
  document.getElementById("btn-view-quiz").setAttribute("aria-pressed", String(currentView === "quiz"));
  document.getElementById("btn-view-form").setAttribute("aria-pressed", String(currentView === "form"));
}
function startQuiz() {
  saveName();
  started = true;
  localStorage.setItem(STORAGE.started, "true");
  document.getElementById("intro").hidden = true;
  document.getElementById("questionnaire").hidden = false;
  renderQuiz();
  window.scrollTo({ top: 70, behavior: "smooth" });
}
function switchView(view) {
  currentView = view;
  document.body.dataset.view = view;
  document.getElementById("quiz-view").style.display = view === "quiz" ? "block" : "none";
  document.getElementById("form-view").style.display = view === "form" ? "block" : "none";
  document.getElementById("btn-view-quiz").classList.toggle("active", view === "quiz");
  document.getElementById("btn-view-form").classList.toggle("active", view === "form");
  document.getElementById("btn-view-quiz").setAttribute("aria-pressed", String(view === "quiz"));
  document.getElementById("btn-view-form").setAttribute("aria-pressed", String(view === "form"));
  if (view === "form" && !document.getElementById("history-grid").children.length) renderHistory();
}
function renderHistory() {
  document.getElementById("history-grid").innerHTML = historyOptions.map((option, index) => `<div class="history-item"><span>${esc(option)}</span><div class="history-checks"><label><input type="checkbox" name="history-me-${index}"> Me</label><label><input type="checkbox" name="history-family-${index}"> Fam</label></div></div>`).join("");
}
function updateProgress() {
  const x = t[currentLang];
  const subset = questions.filter(question => question.section === sectionIds[currentSection]);
  const sectionAnswered = subset.filter(question => selections.prakruti[question.id]).length;
  const totalAnswered = questions.filter(question => selections.prakruti[question.id]).length;
  document.getElementById("answer-meta").textContent = `${sectionAnswered} / ${subset.length} ${x.questions} · ${totalAnswered} / 31 ${x.overall}`;
  document.getElementById("progress-bar").style.width = `${totalAnswered / questions.length * 100}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", totalAnswered);
  document.getElementById("section-tabs").querySelectorAll("button").forEach((button, index) => {
    button.disabled = index > currentSection && !sectionComplete(index - 1);
  });
}
function renderQuiz() {
  const x = t[currentLang];
  const subset = questions.filter(question => question.section === sectionIds[currentSection]);
  document.getElementById("intro").hidden = true;
  document.getElementById("questionnaire").hidden = false;
  document.getElementById("results").innerHTML = "";
  document.getElementById("long-label").textContent = x.long;
  document.getElementById("long-help").textContent = x.longHelp;
  document.getElementById("current-label").textContent = x.current;
  document.getElementById("current-help").textContent = x.currentHelp;
  document.getElementById("section-tabs").innerHTML = x.sections.map((label, index) => `<button type="button" class="${index === currentSection ? "active" : ""}" onclick="goSection(${index})">${label}</button>`).join("");
  document.getElementById("section-meta").textContent = `${x.part} ${String.fromCharCode(65 + currentSection)} / 3 · ${x.sectionNames[currentSection]}`;
  document.getElementById("quiz-content").innerHTML = subset.map(questionHTML).join("");
  document.getElementById("previous-btn").textContent = x.previous;
  document.getElementById("previous-btn").style.visibility = currentSection === 0 ? "hidden" : "visible";
  document.getElementById("continue-btn").textContent = currentSection === 2 ? x.results : x.continue;
  document.getElementById("validation").hidden = true;
  updateProgress();
}
function questionHTML(question) {
  const data = question[currentLang];
  const number = questions.findIndex(item => item.id === question.id) + 1;
  return `<article class="question-block" id="question-${question.id}"><div class="question-heading"><span class="question-number">${String(number).padStart(2, "0")}</span><h2>${esc(data.trait)}</h2></div><div class="options">${doshas.map(dosha => {
    const prakrutiSelected = selections.prakruti[question.id] === dosha;
    const vikrutiSelected = selections.vikruti[question.id] === dosha;
    return `<div class="option-row${prakrutiSelected ? " is-prakruti-selected" : ""}${vikrutiSelected ? " is-vikruti-selected" : ""}" data-option="${dosha}"><label class="description"><input class="prakruti-control" type="radio" name="prakruti-${question.id}" ${prakrutiSelected ? "checked" : ""} onchange="selectOption(this,'prakruti','${question.id}','${dosha}')" aria-label="${esc(`${t[currentLang].long}: ${data[dosha]}`)}"><i class="fake-radio" aria-hidden="true"></i><span>${esc(data[dosha])}</span></label><label class="current-control"><input type="checkbox" ${vikrutiSelected ? "checked" : ""} onchange="selectOption(this,'vikruti','${question.id}','${dosha}')" aria-label="${esc(`${t[currentLang].current}: ${data[dosha]}`)}"><span>${esc(t[currentLang].current)}</span></label></div>`;
  }).join("")}</div></article>`;
}
function selectOption(input, type, questionId, dosha) {
  const question = document.getElementById(`question-${questionId}`);
  const rows = [...question.querySelectorAll(".option-row")];
  if (type === "prakruti") {
    selections.prakruti[questionId] = dosha;
    rows.forEach(row => row.classList.toggle("is-prakruti-selected", row.dataset.option === dosha));
  } else {
    const clearing = selections.vikruti[questionId] === dosha;
    if (clearing) delete selections.vikruti[questionId];
    else selections.vikruti[questionId] = dosha;
    rows.forEach(row => {
      const selected = !clearing && row.dataset.option === dosha;
      row.classList.toggle("is-vikruti-selected", selected);
      row.querySelector(".current-control input").checked = selected;
    });
  }
  saveLocalData();
  updateProgress();
}
function sectionComplete(index) {
  return questions.filter(question => question.section === sectionIds[index]).every(question => selections.prakruti[question.id]);
}
function goSection(index) {
  if (index <= currentSection || sectionComplete(currentSection)) {
    currentSection = index;
    saveLocalData();
    renderQuiz();
    window.scrollTo({ top: 75, behavior: "smooth" });
  }
}
function previousSection() {
  if (currentSection) goSection(currentSection - 1);
}
function continueSection() {
  const missing = questions.filter(question => question.section === sectionIds[currentSection] && !selections.prakruti[question.id]);
  if (missing.length) {
    const box = document.getElementById("validation");
    box.innerHTML = `${esc(t[currentLang].unanswered(missing.length))}<button onclick="document.getElementById('question-${missing[0].id}').scrollIntoView({behavior:'smooth'})">${esc(t[currentLang].jump)}</button>`;
    box.hidden = false;
    return;
  }
  if (currentSection < 2) goSection(currentSection + 1);
  else calculateResults();
}
function getCurrentCounts() {
  const counts = { prakruti: { vata: 0, pitta: 0, kapha: 0 }, vikruti: { vata: 0, pitta: 0, kapha: 0 } };
  ["prakruti", "vikruti"].forEach(type => Object.values(selections[type]).forEach(dosha => {
    if (doshas.includes(dosha)) counts[type][dosha] += 1;
  }));
  return counts;
}
function calculateResults() {
  const missing = questions.filter(question => !selections.prakruti[question.id]);
  if (missing.length) {
    currentSection = sectionIds.indexOf(missing[0].section);
    renderQuiz();
    continueSection();
    return;
  }
  document.getElementById("questionnaire").hidden = true;
  displayDashboard(getCurrentCounts(), false);
  window.scrollTo({ top: 75, behavior: "smooth" });
}
function rankedGroups(scores) {
  const values = [...new Set(doshas.map(dosha => scores[dosha]))].sort((a, b) => b - a);
  return values.map(score => doshas.filter(dosha => scores[dosha] === score));
}
function resultPanel(type, title, scores) {
  const x = t[currentLang];
  const total = doshas.reduce((sum, dosha) => sum + scores[dosha], 0);
  if (type === "vikruti" && total === 0) return `<section class="result-box empty-result"><h2>${title}</h2><h3>${x.noVikruti}</h3><p>${x.noVikrutiBody}</p></section>`;
  const max = Math.max(...Object.values(scores), 1);
  const groups = rankedGroups(scores);
  return `<section class="result-box"><h2>${title}</h2>${doshas.map(dosha => `<div class="score-row ${dosha}"><span>${dosha[0].toUpperCase() + dosha.slice(1)}</span><span class="score-track"><i style="width:${scores[dosha] / max * 100}%"></i></span><b>${scores[dosha]}</b></div>`).join("")}<table class="ranking"><thead><tr><th>${x.rank}</th><th>Dosha</th></tr></thead><tbody>${groups.map((group, index) => `<tr><td>${[x.primary, x.secondary, x.tertiary][index] || x.tied}</td><td>${group.map(dosha => dosha[0].toUpperCase() + dosha.slice(1)).join(" + ")}${group.length > 1 ? ` <span class="tie-label">${x.tied}</span>` : ""}</td></tr>`).join("")}</tbody></table></section>`;
}
function displayDashboard(counts, shared) {
  const x = t[currentLang];
  const title = selections.name ? x.namedTitle(esc(selections.name)) : x.resultsTitle;
  document.getElementById("results").innerHTML = `<div class="results-shell"><header class="results-head"><p class="eyebrow">Twin Beans Farm · Ayurveda</p><h1>${title}</h1><p>${x.notDiagnosis}</p></header><div class="results-grid">${resultPanel("prakruti", x.natural, counts.prakruti)}${resultPanel("vikruti", x.imbalance, counts.vikruti)}</div><div class="action-feedback" id="action-feedback" role="status" aria-live="polite"></div><div class="action-buttons">${shared ? `<button class="primary-btn" onclick="takeOwnQuiz()">${x.takeOwn}</button>` : `<button id="copy-btn" class="action-btn" onclick="exportToText()">${x.copy}</button><button id="share-btn" class="action-btn" onclick="shareResults()">${x.share}</button>`}<button class="action-btn" onclick="window.print()">${x.print}</button>${shared ? "" : `<button class="action-btn" onclick="resetQuizData()">${x.reset}</button>`}</div><div class="dosha-info-grid">${doshas.map(dosha => `<article class="dosha-info-card ${dosha}"><h3>${dosha[0].toUpperCase() + dosha.slice(1)}</h3><p>${x[`${dosha}Info`]}</p></article>`).join("")}</div></div>`;
}
function showActionFeedback(message, isError = false) {
  const feedback = document.getElementById("action-feedback");
  feedback.textContent = message;
  feedback.classList.toggle("error", isError);
}
async function saveShared() {
  const response = await fetch("/.netlify/functions/saveQuiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(selections) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  return `${location.origin}${location.pathname}?id=${encodeURIComponent(result.id)}&l=${currentLang}`;
}
async function exportToText() {
  try {
    await navigator.clipboard.writeText(await saveShared());
    document.getElementById("copy-btn").textContent = t[currentLang].copied;
    showActionFeedback(t[currentLang].copied);
  } catch (error) {
    console.error("Unable to copy shared profile", error);
    showActionFeedback(t[currentLang].shareError, true);
  }
}
async function shareResults() {
  try {
    const url = await saveShared();
    if (navigator.share) await navigator.share({ title: selections.name ? t[currentLang].namedTitle(selections.name) : t[currentLang].resultsTitle, url });
    else {
      await navigator.clipboard.writeText(url);
      document.getElementById("share-btn").textContent = t[currentLang].sharedCopy;
      showActionFeedback(t[currentLang].sharedCopy);
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Unable to share profile", error);
      showActionFeedback(t[currentLang].shareError, true);
    }
  }
}
function takeOwnQuiz() {
  isSharedView = false;
  selections = { name: "", prakruti: {}, vikruti: {} };
  currentSection = 0;
  started = false;
  history.replaceState({}, document.title, location.pathname);
  renderChrome();
  document.getElementById("shared-banner").hidden = true;
  document.getElementById("results").innerHTML = "";
  document.getElementById("intro").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function resetQuizData() {
  selections = { name: "", prakruti: {}, vikruti: {} };
  currentSection = 0;
  started = false;
  isSharedView = false;
  Object.values(STORAGE).forEach(key => localStorage.removeItem(key));
  history.replaceState({}, document.title, location.pathname);
  renderChrome();
  document.getElementById("results").innerHTML = "";
  document.getElementById("questionnaire").hidden = true;
  document.getElementById("intro").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
async function init() {
  document.body.dataset.view = "quiz";
  loadLocalData();
  if (!Number.isInteger(currentSection) || currentSection < 0 || currentSection >= sectionIds.length) currentSection = 0;
  const params = new URLSearchParams(location.search);
  if (params.get("l") && t[params.get("l")]) currentLang = params.get("l");
  renderChrome();
  document.getElementById("user-name").addEventListener("input", saveName);
  if (params.has("id")) {
    try {
      const response = await fetch(`/.netlify/functions/getQuiz?id=${encodeURIComponent(params.get("id"))}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      selections = normalizeSelections(await response.json());
      isSharedView = true;
      started = true;
      document.getElementById("questionnaire").hidden = true;
      document.getElementById("intro").hidden = true;
      const banner = document.getElementById("shared-banner");
      banner.textContent = t[currentLang].shared;
      banner.hidden = false;
      renderChrome();
      displayDashboard(getCurrentCounts(), true);
      return;
    } catch (error) {
      console.error("Unable to load shared quiz", error);
      const banner = document.getElementById("shared-banner");
      banner.textContent = t[currentLang].sharedLoadError;
      banner.hidden = false;
    }
  }
  if (started) startQuiz();
}

init();
