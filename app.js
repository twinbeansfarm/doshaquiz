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
    current: "Current imbalance", currentHelp: "Select only if this characteristic is currently present or increased. Optional; select again to clear.", optional: "Optional", noMenses: "No menstruation",
    previous: "Previous", continue: "Continue", results: "View results",
    unanswered: n => `You still have ${n} unanswered long-term tendency question${n === 1 ? "" : "s"}.`,
    jump: "Go to first unanswered", resultsTitle: "Your Ayurvedic profile",
    namedTitle: name => `${name}'s Ayurvedic Profile`, natural: "Natural constitution — Prakruti",
    imbalance: "Current imbalance — Vikruti", rank: "Rank", primary: "Primary", secondary: "Secondary", tertiary: "Tertiary", tied: "Tied",
    noVikruti: "No current imbalance selected", noVikrutiBody: "You did not select any characteristics as a current imbalance.",
    copy: "Copy link", copied: "Link copied", share: "Share", sharedCopy: "Link copied", print: "Print", reset: "Retake quiz",
    shareError: "We couldn't create a sharing link. Please try again.", sharedLoadError: "This shared profile could not be loaded. You can still take the quiz yourself.",
    viewQuiz: "Dosha Quiz", viewForm: "Intake Form", printIntake: "Print Intake Form", shared: "You are viewing a shared Dosha profile.", printDate: "Print date", language: "Language",
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
    current: "Mất cân bằng hiện tại", currentHelp: "Chỉ đánh dấu nếu đặc điểm này đang xuất hiện hoặc tăng lên hiện nay. Không bắt buộc; chọn lại để bỏ.", optional: "Không bắt buộc", noMenses: "Không có kinh nguyệt",
    previous: "Quay lại", continue: "Tiếp tục", results: "Xem kết quả",
    unanswered: n => `Bạn còn ${n} câu chưa chọn ở phần Khuynh hướng lâu dài.`, jump: "Đến câu đầu tiên",
    resultsTitle: "Hồ sơ thể trạng Ayurveda", namedTitle: name => `Hồ sơ Ayurveda của ${name}`,
    natural: "Thể trạng tự nhiên — Prakruti", imbalance: "Mất cân bằng hiện tại — Vikruti",
    rank: "Xếp hạng", primary: "Chính", secondary: "Phụ", tertiary: "Thứ ba", tied: "Đồng hạng",
    noVikruti: "Chưa ghi nhận mất cân bằng hiện tại", noVikrutiBody: "Bạn chưa chọn đặc điểm nào ở phần Mất cân bằng hiện tại.",
    copy: "Sao chép liên kết", copied: "Đã sao chép liên kết", share: "Chia sẻ", sharedCopy: "Đã sao chép liên kết", print: "In hồ sơ", reset: "Làm lại",
    shareError: "Không thể tạo liên kết chia sẻ. Vui lòng thử lại.", sharedLoadError: "Không thể tải hồ sơ được chia sẻ này. Bạn vẫn có thể làm bài trắc nghiệm của mình.", viewQuiz: "Bài trắc nghiệm", viewForm: "Hồ sơ y tế",
    shared: "Bạn đang xem một hồ sơ thể trạng được chia sẻ.", takeOwn: "Làm bài trắc nghiệm của tôi", printIntake: "In Hồ sơ y tế", printDate: "Ngày in", language: "Ngôn ngữ",
    notDiagnosis: "Nội dung mang tính giáo dục, không phải chẩn đoán y khoa.",
    vataInfo: "Khí & Không gian — năng lượng của chuyển động. Khi cân bằng, Vata hỗ trợ sự sáng tạo, sức sống và khả năng thích nghi. Khi mất cân bằng, có thể biểu hiện lo âu, khô ráp, tiêu hóa thất thường hoặc bồn chồn.",
    pittaInfo: "Lửa & Nước — năng lượng của chuyển hóa. Khi cân bằng, Pitta hỗ trợ trí tuệ, lòng can đảm và tiêu hóa khỏe. Khi mất cân bằng, có thể biểu hiện cáu kỉnh, dư nhiệt, viêm hoặc kiệt sức.",
    kaphaInfo: "Đất & Nước — năng lượng của cấu trúc và ổn định. Khi cân bằng, Kapha hỗ trợ sự điềm tĩnh, lòng từ bi và sức bền. Khi mất cân bằng, có thể biểu hiện nặng nề, trì trệ, bám chấp hoặc tắc nghẽn."
  }
};

const intakeVi = {
  "Health Information & History Intake":"Hồ sơ thông tin và tiền sử sức khỏe","Personal Details":"Thông tin cá nhân","Client Name":"Họ và tên","Daytime Phone":"Điện thoại liên hệ ban ngày","Address":"Địa chỉ","City, ST, Zip":"Thành phố, tỉnh/bang, mã bưu chính","Email":"Email","Cell":"Điện thoại di động","Age":"Tuổi","DOB":"Ngày sinh","Marital Status":"Tình trạng hôn nhân","Occupation":"Nghề nghiệp","Referred By":"Người giới thiệu","Family Physician":"Bác sĩ gia đình","Objectives":"Mục tiêu","Select the item below that reflects your main objective (one only). Please note that Ayurvedic Consultations do not include medical diagnosis and treatments. If you are concerned about a medical condition, you should see a medical doctor.":"Chọn một mục phản ánh mục tiêu chính của bạn. Tư vấn Ayurveda không bao gồm chẩn đoán hay điều trị y khoa. Nếu lo ngại về một tình trạng bệnh lý, bạn nên gặp bác sĩ.",
  "I want an alternative approach to allopathic medicine for managing illness and disease":"Tôi muốn một phương pháp bổ trợ cho y học hiện đại trong việc quản lý bệnh tật","I want to improve my general health and wellness and reduce my vulnerability to illness and disease":"Tôi muốn cải thiện sức khỏe tổng thể và giảm nguy cơ bệnh tật","I want to improve my lifestyle and dietary practices to improve my health":"Tôi muốn cải thiện lối sống và chế độ ăn để nâng cao sức khỏe","I want to change my habits and behavioral patterns to improve my relationships with others":"Tôi muốn thay đổi thói quen và hành vi để cải thiện các mối quan hệ","I want to manage stress, tension and worry to attain a more stable emotional nature":"Tôi muốn quản lý căng thẳng và lo âu để cảm xúc ổn định hơn","What do you want to achieve in terms of your health and wellness? Please also tell us your current concerns.":"Bạn muốn đạt được điều gì về sức khỏe và sự an lành? Vui lòng chia sẻ những mối quan tâm hiện tại.",
  "Medical History":"Tiền sử sức khỏe","Check appropriate boxes if you or your family members have a history of the following:":"Đánh dấu nếu bạn hoặc người thân có tiền sử các tình trạng sau:","Any Other Diseases Or Problems? (Illnesses, injuries, addictions, weight changes, surgeries, etc.)":"Bệnh hoặc vấn đề nào khác? (Bệnh tật, chấn thương, nghiện, thay đổi cân nặng, phẫu thuật, v.v.)","Current Health & Vitals":"Sức khỏe hiện tại và chỉ số cơ thể","Are you currently under a physician’s care?":"Hiện bạn có đang được bác sĩ theo dõi không?","Last Physical Exam Date":"Ngày khám sức khỏe gần nhất","Height":"Chiều cao","Weight":"Cân nặng","What prescription drugs are you taking (including birth control)?":"Bạn đang dùng thuốc kê đơn nào (bao gồm thuốc tránh thai)?","What non-prescriptions drugs, supplements, or recreational drugs are you taking (including alcohol, tobacco, caffeine)?":"Bạn đang dùng thuốc không kê đơn, thực phẩm bổ sung hoặc chất kích thích nào (bao gồm rượu, thuốc lá, caffeine)?","Diet & Elimination":"Chế độ ăn và bài tiết","Please write down all food you have eaten and drank for the last three days, with timing.":"Vui lòng ghi lại toàn bộ thức ăn, đồ uống và thời điểm sử dụng trong ba ngày gần đây.","When and how often do you eliminate? What does your poop look like (color, shape, quantity, odor)?":"Bạn đi tiêu khi nào và bao lâu một lần? Phân có màu sắc, hình dạng, lượng và mùi như thế nào?","Required Photos":"Ảnh cần cung cấp","Please email the following photos before your first appointment (at least 48 hours prior), and at least once a year afterwards. You can send separate photos, or save all together in a google drive link.":"Vui lòng gửi email các ảnh sau trước buổi hẹn đầu tiên ít nhất 48 giờ và ít nhất mỗi năm một lần sau đó. Có thể gửi từng ảnh hoặc một liên kết Google Drive.","Full length photo from the front":"Ảnh toàn thân nhìn từ phía trước","Full length profile from the side":"Ảnh toàn thân nhìn nghiêng","Close up of face":"Ảnh cận mặt","Close up of both hands, palms downward":"Ảnh cận hai bàn tay, lòng bàn tay úp xuống","Entire top of tongue, including back (when you first wake up in the morning, before scraping)":"Toàn bộ mặt trên của lưỡi, gồm phần sau (ngay khi thức dậy, trước khi cạo lưỡi)","Close up of eyes looking to the right & left":"Ảnh cận mắt khi nhìn sang phải và trái","Full length childhood photo before the age of 5":"Ảnh toàn thân thời thơ ấu trước 5 tuổi","Print Intake Form":"In Hồ sơ y tế","Me":"Tôi","Fam":"Gia đình",
  "Allergies to Food/Drugs/Mold":"Dị ứng thực phẩm/thuốc/nấm mốc","Anemia":"Thiếu máu","Arthritis":"Viêm khớp","Asthma, Pneumonia, TB":"Hen suyễn, viêm phổi, lao","Autoimmune Disease":"Bệnh tự miễn","Blood Pressure (High/Low)":"Huyết áp (cao/thấp)","Cancer / Chemotherapy / Radiation":"Ung thư / hóa trị / xạ trị","Chest Pain/Angina":"Đau ngực/đau thắt ngực","Cholesterol / Triglycerides (High)":"Cholesterol / triglyceride cao","Contact Lenses / Prescription Glasses":"Kính áp tròng / kính thuốc","Dental Treatment Complications":"Biến chứng điều trị nha khoa","Diabetes":"Tiểu đường","Dizziness, Fainting":"Chóng mặt, ngất","Epilepsy, Convulsions, Seizures":"Động kinh, co giật","Feet or Ankles, Swelling":"Sưng bàn chân hoặc mắt cá","Glaucoma, Eye Surgery":"Tăng nhãn áp, phẫu thuật mắt","Headaches/Migraines":"Đau đầu/đau nửa đầu","Heart Attack / Disease / Surgery":"Nhồi máu / bệnh / phẫu thuật tim","Heart Murmur, Palpitations":"Tiếng thổi tim, đánh trống ngực","Hepatitis A / B / Other":"Viêm gan A / B / khác","HIV Exposure":"Phơi nhiễm HIV","IBS, Colitis, Crohn’s, Celiac, etc.":"IBS, viêm đại tràng, Crohn, Celiac, v.v.","Implant, Prosthesis":"Thiết bị cấy ghép, bộ phận giả","Kidney or Bladder Disease / Infection":"Bệnh / nhiễm trùng thận hoặc bàng quang","Mononucleosis, Jaundice, Gallstone":"Tăng bạch cầu đơn nhân, vàng da, sỏi mật","Pain/Ringing in the Ear":"Đau / ù tai","Parasites / Tropical / Chronic Infection":"Ký sinh trùng / nhiễm trùng nhiệt đới / mạn tính","Popping, Clicking, Locking of the Jaw":"Khớp hàm kêu, lục cục hoặc khóa","Prolonged Bleeding When Cut":"Chảy máu kéo dài khi bị thương","Psychiatric Treatment":"Điều trị tâm thần","Rheumatic / High Fever":"Thấp khớp / sốt cao","Shortness of Breath":"Khó thở","Stroke, Cerebro-Vascular Accident":"Đột quỵ, tai biến mạch máu não","Thyroid Disease or Medication":"Bệnh hoặc thuốc tuyến giáp","Ulcers, Intestinal Bleeding":"Loét, xuất huyết đường ruột","Venereal Diseases":"Bệnh lây truyền qua đường tình dục"
};
const intakeOriginalText = new WeakMap();

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
  updateIntakeLanguage();
}
function updateIntakeLanguage() {
  const root = document.getElementById("form-view");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const original = intakeOriginalText.get(node) ?? node.nodeValue;
    if (!intakeOriginalText.has(node)) intakeOriginalText.set(node, original);
    const key = original.trim();
    if (!key) continue;
    const translated = currentLang === "vi" ? intakeVi[key] : key;
    if (translated) node.nodeValue = original.replace(key, translated);
  }
  document.getElementById("print-intake-btn").textContent = t[currentLang].printIntake;
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
  updateIntakeLanguage();
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
  const optional = question.id === "menses" ? `<span class="optional-badge">${t[currentLang].optional}</span>` : "";
  const standardOptions = doshas.map(dosha => {
    const prakrutiSelected = selections.prakruti[question.id] === dosha;
    const vikrutiSelected = selections.vikruti[question.id] === dosha;
    const vikrutiDisabled = question.id === "menses" && selections.prakruti.menses === "not_applicable";
    return `<div class="option-row${prakrutiSelected ? " is-prakruti-selected" : ""}${vikrutiSelected ? " is-vikruti-selected" : ""}" data-option="${dosha}"><label class="description"><input class="prakruti-control" type="radio" name="prakruti-${question.id}" ${prakrutiSelected ? "checked" : ""} onchange="selectOption(this,'prakruti','${question.id}','${dosha}')" aria-label="${esc(`${t[currentLang].long}: ${data[dosha]}`)}"><i class="fake-radio" aria-hidden="true"></i><span>${esc(data[dosha])}</span></label><label class="current-control"><input type="checkbox" ${vikrutiSelected ? "checked" : ""} ${vikrutiDisabled ? "disabled" : ""} onchange="selectOption(this,'vikruti','${question.id}','${dosha}')" aria-label="${esc(`${t[currentLang].current}: ${data[dosha]}`)}"><span>${esc(t[currentLang].current)}</span></label></div>`;
  }).join("");
  const notApplicable = question.id === "menses" ? `<div class="option-row not-applicable${selections.prakruti.menses === "not_applicable" ? " is-prakruti-selected" : ""}" data-option="not_applicable"><label class="description"><input class="prakruti-control" type="radio" name="prakruti-menses" ${selections.prakruti.menses === "not_applicable" ? "checked" : ""} onchange="selectMensesNotApplicable(this)"><i class="fake-radio" aria-hidden="true"></i><span>${t[currentLang].noMenses}</span></label></div>` : "";
  return `<article class="question-block" id="question-${question.id}"><div class="question-heading"><span class="question-number">${String(number).padStart(2, "0")}</span><h2>${esc(data.trait)}${optional}</h2></div><div class="options">${standardOptions}${notApplicable}</div></article>`;
}
function selectOption(input, type, questionId, dosha) {
  const question = document.getElementById(`question-${questionId}`);
  const rows = [...question.querySelectorAll(".option-row")];
  if (type === "prakruti") {
    selections.prakruti[questionId] = dosha;
    rows.forEach(row => row.classList.toggle("is-prakruti-selected", row.dataset.option === dosha));
    if (questionId === "menses") rows.forEach(row => {
      const vikruti = row.querySelector(".current-control input");
      if (vikruti) vikruti.disabled = false;
    });
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
function selectMensesNotApplicable() {
  selections.prakruti.menses = "not_applicable";
  delete selections.vikruti.menses;
  const question = document.getElementById("question-menses");
  question.querySelectorAll(".option-row").forEach(row => {
    const selected = row.dataset.option === "not_applicable";
    row.classList.toggle("is-prakruti-selected", selected);
    row.classList.remove("is-vikruti-selected");
    const prakruti = row.querySelector(".prakruti-control");
    if (prakruti) prakruti.checked = selected;
    const vikruti = row.querySelector(".current-control input");
    if (vikruti) { vikruti.checked = false; vikruti.disabled = true; }
  });
  saveLocalData();
  updateProgress();
}
function sectionComplete(index) {
  return questions.filter(question => question.section === sectionIds[index] && question.id !== "menses").every(question => selections.prakruti[question.id]);
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
  const missing = questions.filter(question => question.id !== "menses" && question.section === sectionIds[currentSection] && !selections.prakruti[question.id]);
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
  const missing = questions.filter(question => question.id !== "menses" && !selections.prakruti[question.id]);
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
function printSummary(type, title, scores) {
  const x = t[currentLang];
  const total = doshas.reduce((sum, dosha) => sum + scores[dosha], 0);
  const scoreLine = doshas.map(dosha => `${dosha[0].toUpperCase() + dosha.slice(1)}: ${scores[dosha]}`).join(" · ");
  if (type === "vikruti" && total === 0) return `<section><h2>${title}</h2><div class="print-scores">${scoreLine}</div><div class="print-ranks">${x.noVikruti}</div></section>`;
  const groups = rankedGroups(scores);
  const rankLine = groups.map((group, index) => `${[x.primary, x.secondary, x.tertiary][index] || x.tied}: ${group.map(dosha => dosha[0].toUpperCase() + dosha.slice(1)).join(" + ")}`).join(" · ");
  return `<section><h2>${title}</h2><div class="print-scores">${scoreLine}</div><div class="print-ranks">${rankLine}</div></section>`;
}
function buildPrintProfile(counts) {
  const x = t[currentLang];
  const displayName = selections.name || "—";
  const sections = sectionIds.map((sectionId, sectionIndex) => `<section class="print-section"><h2>${String.fromCharCode(65 + sectionIndex)}. ${x.sectionNames[sectionIndex]}</h2>${questions.filter(question => question.section === sectionId).map(question => {
    const number = String(questions.findIndex(item => item.id === question.id) + 1).padStart(2, "0");
    const prakruti = selections.prakruti[question.id];
    const vikruti = selections.vikruti[question.id];
    const prakrutiText = prakruti === "not_applicable" ? x.noMenses : prakruti ? `${prakruti[0].toUpperCase() + prakruti.slice(1)} — ${question[currentLang][prakruti]}` : "—";
    const vikrutiText = vikruti ? `${vikruti[0].toUpperCase() + vikruti.slice(1)} — ${question[currentLang][vikruti]}` : "—";
    return `<article class="print-answer"><h3>${number}. ${esc(question[currentLang].trait)}</h3><p><b>Prakruti:</b> ${esc(prakrutiText)}</p><p><b>Vikruti:</b> ${esc(vikrutiText)}</p></article>`;
  }).join("")}</section>`).join("");
  document.getElementById("print-profile").innerHTML = `<header class="print-profile-head"><div><h1>Twin Beans Farm · Ayurveda</h1><p>${esc(displayName)}</p></div><div>${x.printDate}: ${new Intl.DateTimeFormat(currentLang === "vi" ? "vi-VN" : "en-US").format(new Date())}<br>${x.language}: ${currentLang.toUpperCase()}</div></header><div class="print-summary">${printSummary("prakruti", x.natural, counts.prakruti)}${printSummary("vikruti", x.imbalance, counts.vikruti)}</div><div class="print-answers">${sections}</div><div class="print-contact">Connect your true self with nature. · Hotline / Zalo: 0866 222 340 · twinbeansfarm@gmail.com</div>`;
}
function printProfile() {
  buildPrintProfile(getCurrentCounts());
  document.body.classList.add("print-profile");
  window.print();
}
function printIntake() {
  document.body.classList.add("print-intake");
  window.print();
}
if (typeof window !== "undefined") window.addEventListener("afterprint", () => document.body.classList.remove("print-profile", "print-intake"));
function displayDashboard(counts, shared) {
  const x = t[currentLang];
  const title = selections.name ? x.namedTitle(esc(selections.name)) : x.resultsTitle;
  document.getElementById("results").innerHTML = `<div class="results-shell"><header class="results-head"><p class="eyebrow">Twin Beans Farm · Ayurveda</p><h1>${title}</h1><p>${x.notDiagnosis}</p></header><div class="results-grid">${resultPanel("prakruti", x.natural, counts.prakruti)}${resultPanel("vikruti", x.imbalance, counts.vikruti)}</div><div class="action-feedback" id="action-feedback" role="status" aria-live="polite"></div><div class="action-buttons">${shared ? `<button class="primary-btn" onclick="takeOwnQuiz()">${x.takeOwn}</button>` : `<button id="copy-btn" class="action-btn" onclick="exportToText()">${x.copy}</button><button id="share-btn" class="action-btn" onclick="shareResults()">${x.share}</button>`}<button class="action-btn" onclick="printProfile()">${x.print}</button>${shared ? "" : `<button class="action-btn" onclick="resetQuizData()">${x.reset}</button>`}</div><div class="dosha-info-grid">${doshas.map(dosha => `<article class="dosha-info-card ${dosha}"><h3>${dosha[0].toUpperCase() + dosha.slice(1)}</h3><p>${x[`${dosha}Info`]}</p></article>`).join("")}</div></div>`;
  buildPrintProfile(counts);
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
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Clipboard unavailable");
}
async function exportToText() {
  try {
    await copyText(await saveShared());
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
      await copyText(url);
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
