"use strict";

const STORAGE = {
  selections: "doshaSelections",
  language: "doshaLanguage",
  section: "doshaSection",
  intake: "doshaIntakeData"
};
const sectionIds = ["physical", "functional", "psychological"];
const doshas = ["vata", "pitta", "kapha"];
let currentLang = localStorage.getItem(STORAGE.language) || "vi";
let currentView = "quiz";
let currentSection = Number(localStorage.getItem(STORAGE.section) || 0);
let questionnaireOpen = false;
let isSharedView = false;
let selections = { name: "", phone: "", email: "", prakruti: {}, vikruti: {} };
let intakeData = {};

const t = {
  en: {
    header: "Ayurvedic Dosha Quiz",
    introTitle: "Discover Your Ayurvedic Constitution",
    introCopy: "You will learn about your natural Dosha constitution (Prakruti) and your current signs of imbalance (Vikruti).",
    prakrutiCopy: "Your natural constitution and the relatively stable tendencies you have experienced from childhood to the present.",
    vikrutiCopy: "Changes or imbalances that are showing themselves at the present time (within approximately the past 1 year).",
    meta: "31 questions · approximately 8–10 minutes",
    profileInfo: "Your information (optional)", name: "Your name", phone: "Phone number", email: "Email", start: "Start the Quiz", continuePrevious: "Continue previous quiz", startOver: "Start over",
    sections: ["A. Physical", "B. Body functions", "C. Psychological"],
    sectionNames: ["Physical Characteristics", "Physical Functional Characteristics", "Psychological Characteristics"],
    part: "Section", questions: "required in this section", overall: "required", oneOptional: "1 optional",
    long: "Long-term tendency", longHelp: "For each characteristic, choose one (01) of the three descriptions that best represents you from childhood to the present.",
    current: "Current imbalance", currentHelp: "Select only if this characteristic is currently present or has increased within approximately the past 1 year. Only select “Current imbalance” when it is different from your “Long-term tendency”. You do not need to select a current imbalance for every question. You may leave it blank if you are unsure.", optional: "Optional", noMenses: "No menstruation",
    previous: "Previous", continue: "Continue", results: "View results",
    unanswered: n => `You still have ${n} unanswered long-term tendency question${n === 1 ? "" : "s"}.`,
    jump: "Go to first unanswered", resultsTitle: "Your Ayurvedic profile",
    namedTitle: name => `${name}'s Ayurvedic Profile`, natural: "Natural constitution — Prakruti",
    imbalance: "Current imbalance — Vikruti", rank: "Rank", primary: "Primary", secondary: "Secondary", tertiary: "Tertiary", tied: "Tied",
    noVikruti: "No current imbalance selected", noVikrutiBody: "You did not select any characteristics as a current imbalance.",
    share: "Share", shareProfile: "Share profile", send: "Send to Twin Beans Farm", sending: "Sending profile...", sent: "Profile sent to Twin Beans Farm.", sendError: "Unable to send the profile. Please try again.", intakeRequired: "Please complete Full name, Email, Mobile phone and Date of birth.", print: "Print profile", reset: "Retake quiz",
    shareError: "We couldn't create a sharing link. Please try again.", sharedLoadError: "This shared profile could not be loaded. You can still take the quiz yourself.",
    viewQuiz: "Dosha Quiz", viewForm: "Intake Form", printIntake: "Print Intake Form", me: "Me", family: "Family", shared: "You are viewing a shared Dosha profile.", printDate: "Print date", language: "Language",
    takeOwn: "Create my own profile", notDiagnosis: "The quiz results are for reference only and are not a medical diagnosis. Please contact a Twin Beans Farm specialist for consultation.",
    vataInfo: "Air & Space — the energy of movement. In balance, Vata supports creativity, vitality and adaptability. Out of balance, it may show as anxiety, dryness, irregular digestion or restlessness.",
    pittaInfo: "Fire & Water — the energy of transformation. In balance, Pitta supports intelligence, courage and strong digestion. Out of balance, it may show as irritability, excess heat, inflammation or burnout.",
    kaphaInfo: "Earth & Water — the energy of structure and stability. In balance, Kapha supports calmness, compassion and endurance. Out of balance, it may show as heaviness, lethargy, attachment or congestion."
  },
  vi: {
    header: "Bài trắc nghiệm Ayurveda", introTitle: "Khám phá thể trạng Ayurveda của bạn",
    introCopy: "Bạn sẽ tìm hiểu về thể trạng (Dosha) tự nhiên của bản thân (Prakruti) và các biểu hiện mất cân bằng hiện tại (Vikruti).",
    prakrutiCopy: "Thể trạng tự nhiên và những khuynh hướng tương đối ổn định của bạn từ thời thơ ấu đến nay.",
    vikrutiCopy: "Những thay đổi hoặc mất cân bằng đang biểu hiện ở thời điểm hiện tại (trong vòng 1 năm gần nhất).",
    meta: "Bài trắc nghiệm gồm 31 câu · khoảng 8–10 phút", profileInfo: "Thông tin của bạn (không bắt buộc)", name: "Tên của bạn", phone: "Số điện thoại", email: "Email", start: "Bắt đầu bài trắc nghiệm", continuePrevious: "Tiếp tục bài đang làm", startOver: "Bắt đầu lại",
    sections: ["A. Thể chất", "B. Chức năng cơ thể", "C. Tâm lý"],
    sectionNames: ["Đặc điểm thể chất", "Đặc điểm chức năng cơ thể", "Đặc điểm tâm lý"],
    part: "Phần", questions: "câu bắt buộc trong phần này", overall: "câu bắt buộc", oneOptional: "1 câu không bắt buộc",
    long: "Khuynh hướng lâu dài", longHelp: "Với mỗi đặc điểm, chọn một (01) đáp án phù hợp nhất trong ba mô tả bạn từ trước (từ thời thơ ấu) đến nay.",
    current: "Mất cân bằng hiện tại", currentHelp: "Chỉ đánh dấu nếu đặc điểm này đang xuất hiện hoặc tăng lên hiện nay (trong vòng 1 năm gần nhất). Chỉ đánh dấu khi đặc điểm “Mất cân bằng hiện tại” khác với “Khuynh hướng lâu dài”. Không cần đánh dấu cho từng câu. (Có thể để trống nếu bạn không biết).", optional: "Không bắt buộc", noMenses: "Không có kinh nguyệt",
    previous: "Quay lại", continue: "Tiếp tục", results: "Xem kết quả",
    unanswered: n => `Bạn còn ${n} câu chưa chọn ở phần Khuynh hướng lâu dài.`, jump: "Đến câu đầu tiên",
    resultsTitle: "Hồ sơ thể trạng Ayurveda", namedTitle: name => `Hồ sơ Ayurveda của ${name}`,
    natural: "Thể trạng tự nhiên — Prakruti", imbalance: "Mất cân bằng hiện tại — Vikruti",
    rank: "Xếp hạng", primary: "Chính", secondary: "Phụ", tertiary: "Thứ ba", tied: "Đồng hạng",
    noVikruti: "Chưa ghi nhận mất cân bằng hiện tại", noVikrutiBody: "Bạn chưa chọn đặc điểm nào ở phần Mất cân bằng hiện tại.",
    share: "Chia sẻ", shareProfile: "Chia sẻ hồ sơ", send: "Gửi Twin Beans Farm", sending: "Đang gửi hồ sơ...", sent: "Đã gửi hồ sơ đến Twin Beans Farm.", sendError: "Không thể gửi hồ sơ. Vui lòng thử lại.", intakeRequired: "Vui lòng điền đầy đủ Họ và tên, Email, Điện thoại di động và Ngày tháng năm sinh.", print: "In hồ sơ", reset: "Làm lại",
    shareError: "Không thể tạo liên kết chia sẻ. Vui lòng thử lại.", sharedLoadError: "Không thể tải hồ sơ được chia sẻ này. Bạn vẫn có thể làm bài trắc nghiệm của mình.", viewQuiz: "Bài trắc nghiệm", viewForm: "Hồ sơ y tế",
    shared: "Hồ sơ Ayurveda được chia sẻ", takeOwn: "Làm hồ sơ của tôi", printIntake: "In Hồ sơ y tế", me: "Tôi", family: "Gia đình", printDate: "Ngày in", language: "Ngôn ngữ",
    notDiagnosis: "Kết quả bài trắc nghiệm mang tính tham khảo, và không phải chẩn đoán y khoa. Vui lòng liên hệ chuyên gia của Twin Beans Farm để được tư vấn.",
    vataInfo: "Khí & Không gian — năng lượng của chuyển động. Khi cân bằng, Vata hỗ trợ sự sáng tạo, sức sống và khả năng thích nghi. Khi mất cân bằng, có thể biểu hiện lo âu, khô ráp, tiêu hóa thất thường hoặc bồn chồn.",
    pittaInfo: "Lửa & Nước — năng lượng của chuyển hóa. Khi cân bằng, Pitta hỗ trợ trí tuệ, lòng can đảm và tiêu hóa khỏe. Khi mất cân bằng, có thể biểu hiện cáu kỉnh, dư nhiệt, viêm hoặc kiệt sức.",
    kaphaInfo: "Đất & Nước — năng lượng của cấu trúc và ổn định. Khi cân bằng, Kapha hỗ trợ sự điềm tĩnh, lòng từ bi và sức bền. Khi mất cân bằng, có thể biểu hiện nặng nề, trì trệ, bám chấp hoặc tắc nghẽn."
  }
};

const intakeVi = {
  "Full name":"Họ và tên","Full name *":"Họ và tên *","Email *":"Email *","Mobile phone *":"Điện thoại di động *","Date of birth *":"Ngày tháng năm sinh *","Mobile phone":"Điện thoại di động","Date of birth":"Ngày tháng năm sinh","Referred by (if any)":"Người giới thiệu (nếu có)","Health Information & History Intake":"Hồ sơ thông tin và tiền sử sức khỏe","Personal Details":"Thông tin cá nhân","Client Name":"Họ và tên","Daytime Phone":"Điện thoại liên hệ ban ngày","Address":"Địa chỉ","City, ST, Zip":"Thành phố, tỉnh/bang, mã bưu chính","Email":"Email","Cell":"Điện thoại di động","Age":"Tuổi","DOB":"Ngày sinh","Marital Status":"Tình trạng hôn nhân","Occupation":"Nghề nghiệp","Referred By":"Người giới thiệu","Family Physician":"Bác sĩ gia đình","Objectives":"Mục tiêu","Select the item below that reflects your main objective (one only). Please note that Ayurvedic Consultations do not include medical diagnosis and treatments. If you are concerned about a medical condition, you should see a medical doctor.":"Chọn một mục phản ánh mục tiêu chính của bạn. Tư vấn Ayurveda không bao gồm chẩn đoán hay điều trị y khoa. Nếu lo ngại về một tình trạng bệnh lý, bạn nên gặp bác sĩ.",
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
  const normalized = { name: value?.name || "", phone: value?.phone || "", email: value?.email || "", prakruti: { ...(value?.prakruti || {}) }, vikruti: { ...(value?.vikruti || {}) } };
  Object.keys(normalized.vikruti).forEach(id => {
    if (normalized.prakruti[id] === normalized.vikruti[id] || (id === "menses" && normalized.prakruti[id] === "not_applicable")) delete normalized.vikruti[id];
  });
  return normalized;
}
function loadLocalData() {
  try {
    selections = normalizeSelections(JSON.parse(localStorage.getItem(STORAGE.selections)));
    intakeData = JSON.parse(localStorage.getItem(STORAGE.intake)) || {};
  }
  catch (error) { console.warn("Stored quiz state could not be read", error); }
}
function saveLocalData() {
  if (isSharedView) return;
  localStorage.setItem(STORAGE.selections, JSON.stringify(selections));
  localStorage.setItem(STORAGE.language, currentLang);
  localStorage.setItem(STORAGE.section, String(currentSection));
  localStorage.setItem(STORAGE.intake, JSON.stringify(intakeData));
}
function saveName() {
  selections.name = document.getElementById("user-name").value.trim();
  selections.phone = document.getElementById("user-phone").value.trim();
  selections.email = document.getElementById("user-email").value.trim();
  saveLocalData();
}
function setLang(lang) {
  const showingResults = Boolean(document.getElementById("results").innerHTML);
  currentLang = lang;
  document.documentElement.lang = lang;
  if (!isSharedView) localStorage.setItem(STORAGE.language, lang);
  renderChrome();
  if (document.getElementById("history-grid").children.length) renderHistory();
  if (showingResults) displayDashboard(getCurrentCounts(), isSharedView);
  else if (questionnaireOpen) renderQuiz();
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
  document.getElementById("phone-label").textContent = x.phone;
  document.getElementById("email-label").textContent = x.email;
  document.getElementById("profile-fields-title").textContent = x.profileInfo;
  document.getElementById("user-name").value = selections.name;
  document.getElementById("user-phone").value = selections.phone;
  document.getElementById("user-email").value = selections.email;
  updateIntroActions();
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
function hasSavedQuizProgress() {
  return Object.keys(selections.prakruti).length > 0 || Object.keys(selections.vikruti).length > 0;
}
function updateIntroActions() {
  const x = t[currentLang];
  const hasProgress = hasSavedQuizProgress();
  document.getElementById("start-btn").textContent = hasProgress ? x.continuePrevious : x.start;
  const startOver = document.getElementById("start-over-btn");
  startOver.textContent = x.startOver;
  startOver.hidden = !hasProgress;
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
  document.getElementById("send-intake-btn").textContent = t[currentLang].send;
  document.getElementById("share-intake-btn").textContent = t[currentLang].shareProfile;
}
function startQuiz() {
  saveName();
  questionnaireOpen = true;
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
  const x = t[currentLang];
  document.getElementById("history-grid").innerHTML = `<div class="history-header"><span></span><span>${x.me}</span><span>${x.family}</span></div>${historyOptions.map((option, index) => `<div class="history-item"><span class="history-label">${esc(currentLang === "vi" ? intakeVi[option] || option : option)}</span><label class="history-choice" aria-label="${esc(`${option} — ${x.me}`)}"><input type="checkbox" name="history-me-${index}"><span class="sr-only">${x.me}</span></label><label class="history-choice" aria-label="${esc(`${option} — ${x.family}`)}"><input type="checkbox" name="history-family-${index}"><span class="sr-only">${x.family}</span></label></div>`).join("")}`;
  updateIntakeLanguage();
  prepareIntakeControls();
}
function intakeControls() {
  return [...document.querySelectorAll("#form-view input, #form-view textarea, #form-view select")];
}
function prepareIntakeControls() {
  intakeControls().forEach((control, index) => {
    const key = `${control.name || "field"}_${index}`;
    control.dataset.intakeKey = key;
    const saved = intakeData[key];
    if (saved !== undefined) {
      if (control.type === "checkbox" || control.type === "radio") control.checked = Boolean(saved);
      else control.value = String(saved);
    }
    if (!control.dataset.persistenceBound) {
      control.addEventListener("input", saveIntakeData);
      control.addEventListener("change", saveIntakeData);
      control.dataset.persistenceBound = "true";
    }
    control.disabled = isSharedView;
  });
  document.getElementById("send-intake-btn").hidden = isSharedView;
  document.getElementById("share-intake-btn").hidden = isSharedView;
}
function saveIntakeData() {
  if (isSharedView) return;
  intakeControls().forEach(control => {
    intakeData[control.dataset.intakeKey] = control.type === "checkbox" || control.type === "radio" ? control.checked : control.value;
  });
  saveLocalData();
}
function combinedProfile() {
  saveName();
  saveIntakeData();
  return createCombinedProfile(selections, intakeData, currentLang);
}
function createCombinedProfile(quiz, intake, language, savedAt = new Date().toISOString()) {
  return { version: 2, language, quiz: { ...quiz, scores: getCountsForSelections(quiz) }, intake: { ...intake }, savedAt };
}
function getCountsForSelections(quiz) {
  const counts = { prakruti: { vata: 0, pitta: 0, kapha: 0 }, vikruti: { vata: 0, pitta: 0, kapha: 0 } };
  ["prakruti", "vikruti"].forEach(type => Object.values(quiz[type] || {}).forEach(dosha => {
    if (doshas.includes(dosha)) counts[type][dosha] += 1;
  }));
  return counts;
}
function normalizeProfile(data) {
  if (data?.version === 2 && data.quiz) return { version: 2, language: data.language, quiz: normalizeSelections(data.quiz), intake: data.intake || {}, savedAt: data.savedAt };
  return { version: 1, language: null, quiz: normalizeSelections(data), intake: {}, savedAt: null };
}
function updateProgress() {
  const x = t[currentLang];
  const subset = questions.filter(question => question.section === sectionIds[currentSection]);
  const requiredSubset = subset.filter(question => question.id !== "menses");
  const requiredQuestions = questions.filter(question => question.id !== "menses");
  const sectionAnswered = requiredSubset.filter(question => selections.prakruti[question.id]).length;
  const totalAnswered = requiredQuestions.filter(question => selections.prakruti[question.id]).length;
  const optionalText = currentSection === 1 ? ` · ${x.oneOptional}` : "";
  document.getElementById("answer-meta").textContent = `${sectionAnswered} / ${requiredSubset.length} ${x.questions}${optionalText} · ${totalAnswered} / ${requiredQuestions.length} ${x.overall}`;
  document.getElementById("progress-bar").style.width = `${totalAnswered / requiredQuestions.length * 100}%`;
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
    const vikrutiDisabled = selections.prakruti[question.id] === dosha || (question.id === "menses" && selections.prakruti.menses === "not_applicable");
    return `<div class="option-row${prakrutiSelected ? " is-prakruti-selected" : ""}${vikrutiSelected ? " is-vikruti-selected" : ""}" data-option="${dosha}"><p class="answer-description">${esc(data[dosha])}</p><div class="option-controls"><label class="description"><input class="prakruti-control" type="radio" name="prakruti-${question.id}" ${prakrutiSelected ? "checked" : ""} onchange="selectOption(this,'prakruti','${question.id}','${dosha}')" aria-label="${esc(`${t[currentLang].long}: ${data[dosha]}`)}"><i class="fake-radio" aria-hidden="true"></i><span>${esc(t[currentLang].long)}</span></label><label class="current-control"><input type="checkbox" ${vikrutiSelected ? "checked" : ""} ${vikrutiDisabled ? "disabled" : ""} onchange="selectOption(this,'vikruti','${question.id}','${dosha}')" aria-label="${esc(`${t[currentLang].current}: ${data[dosha]}`)}"><span>${esc(t[currentLang].current)}</span></label></div></div>`;
  }).join("");
  const notApplicable = question.id === "menses" ? `<div class="option-row not-applicable${selections.prakruti.menses === "not_applicable" ? " is-prakruti-selected" : ""}" data-option="not_applicable"><p class="answer-description">${t[currentLang].noMenses}</p><div class="option-controls"><label class="description"><input class="prakruti-control" type="radio" name="prakruti-menses" ${selections.prakruti.menses === "not_applicable" ? "checked" : ""} onchange="selectMensesNotApplicable(this)"><i class="fake-radio" aria-hidden="true"></i><span>${t[currentLang].long}</span></label></div></div>` : "";
  return `<article class="question-block" id="question-${question.id}"><div class="question-heading"><span class="question-number">${String(number).padStart(2, "0")}</span><h2>${esc(data.trait)}${optional}</h2></div><div class="options">${standardOptions}${notApplicable}</div></article>`;
}
function selectOption(input, type, questionId, dosha) {
  const question = document.getElementById(`question-${questionId}`);
  const rows = [...question.querySelectorAll(".option-row")];
  if (type === "prakruti") {
    selections.prakruti[questionId] = dosha;
    if (selections.vikruti[questionId] === dosha) delete selections.vikruti[questionId];
    rows.forEach(row => {
      row.classList.toggle("is-prakruti-selected", row.dataset.option === dosha);
      if (row.dataset.option === dosha) row.classList.remove("is-vikruti-selected");
      const vikruti = row.querySelector(".current-control input");
      if (vikruti) {
        vikruti.disabled = row.dataset.option === dosha;
        if (row.dataset.option === dosha) vikruti.checked = false;
      }
    });
  } else {
    const clearing = selections.vikruti[questionId] === dosha;
    if (clearing) delete selections.vikruti[questionId];
    else selections.vikruti[questionId] = dosha;
    rows.forEach(row => {
      const selected = !clearing && row.dataset.option === dosha;
      row.classList.toggle("is-vikruti-selected", selected);
      setVikrutiControlState(row, selected);
    });
  }
  saveLocalData();
  updateProgress();
}
function setVikrutiControlState(row, selected, disabled) {
  const control = row.querySelector(".current-control input");
  if (!control) return false;
  control.checked = selected;
  if (typeof disabled === "boolean") control.disabled = disabled;
  return true;
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
    setVikrutiControlState(row, false, true);
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
  return getCountsForSelections(selections);
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
  document.getElementById("print-profile").innerHTML = `<header class="print-profile-head"><div><h1><img class="print-brand-logo" src="https://raw.githubusercontent.com/twinbeansfarm/doshaquiz/main/assets/brand/TWINBEANS_Revised.png" alt="Twin Beans Farm"> · Ayurveda</h1><p>${esc(displayName)} · ${esc(selections.phone || "—")} · ${esc(selections.email || "—")}</p></div><div>${x.printDate}: ${new Intl.DateTimeFormat(currentLang === "vi" ? "vi-VN" : "en-US").format(new Date())}<br>${x.language}: ${currentLang.toUpperCase()}</div></header><div class="print-summary">${printSummary("prakruti", x.natural, counts.prakruti)}${printSummary("vikruti", x.imbalance, counts.vikruti)}</div><div class="print-answers">${sections}</div><div class="print-contact">Connect your true self with nature. · Hotline / Zalo: 0866 222 340 · twinbeansfarm@gmail.com</div>`;
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
function safeFilename(value) {
  return (value || "Client").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_-]+/gi, "_").replace(/^_+|_+$/g, "") || "Client";
}
function buildIntakePdfDocument() {
  saveIntakeData();
  const documentNode = document.createElement("section");
  documentNode.className = "pdf-document";
  const rows = intakeControls().map(control => {
    if ((control.type === "checkbox" || control.type === "radio") && !control.checked) return "";
    const value = control.type === "checkbox" || control.type === "radio" ? "✓" : control.value.trim();
    if (!value) return "";
    const group = control.closest(".form-group, .history-item");
    const ownLabel = control.closest("label")?.textContent.trim();
    const groupLabel = group?.querySelector(".form-label, span")?.textContent.trim();
    const label = group?.classList.contains("history-item") ? `${groupLabel || "—"} — ${ownLabel || "—"}` : groupLabel || ownLabel || "—";
    return `<div class="pdf-row"><b>${esc(label)}</b><span>${esc(value)}</span></div>`;
  }).join("");
  documentNode.innerHTML = `<h1><img class="pdf-brand-logo" src="https://raw.githubusercontent.com/twinbeansfarm/doshaquiz/main/assets/brand/TWINBEANS_Revised.png" alt="Twin Beans Farm"></h1><h2>${t[currentLang].viewForm}</h2><p>${esc(selections.name || "—")} · ${esc(selections.phone || "—")} · ${esc(selections.email || "—")}</p>${rows || "—"}<footer>Connect your true self with nature. · 0866 222 340 · twinbeansfarm@gmail.com</footer>`;
  document.body.appendChild(documentNode);
  return documentNode;
}
async function generatePdf(kind) {
  const source = kind === "intake" ? buildIntakePdfDocument() : (buildPrintProfile(getCurrentCounts()), document.getElementById("print-profile"));
  if (kind === "quiz") source.classList.add("pdf-export");
  const filename = `TwinBeansFarm_${kind === "intake" ? "Health" : "Ayurveda"}_Profile_${safeFilename(kind === "intake" ? document.getElementById("intake-full-name").value : selections.name)}_${new Date().toISOString().slice(0, 10)}.pdf`;
  try {
    if (typeof html2pdf !== "function") throw new Error("PDF generator unavailable");
    const blob = await html2pdf().set({ margin: 8, filename, image: { type: "jpeg", quality: .96 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }, pagebreak: { mode: ["css", "legacy"] } }).from(source).outputPdf("blob");
    return { blob, file: new File([blob], filename, { type: "application/pdf" }), filename };
  } finally {
    if (kind === "intake") source.remove();
    else source.classList.remove("pdf-export");
  }
}
async function sharePdf(kind) {
  try {
    const { blob, file, filename } = await generatePdf(kind);
    if (navigator.share && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: filename });
    else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob); link.download = filename; link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      showActionFeedback(currentLang === "vi" ? "PDF đã được tạo và lưu. Bạn có thể gửi file này qua ứng dụng mong muốn." : "The PDF has been created and saved. You can send it using your preferred app.", false, kind);
    }
  } catch (error) {
    if (error.name !== "AbortError") showActionFeedback(currentLang === "vi" ? "Không thể tạo PDF. Vui lòng thử lại." : "The PDF could not be created. Please try again.", true, kind);
  }
}
function validateIntakeRequired() {
  const form = document.getElementById("form-view");
  const required = [...form.querySelectorAll("[required]")];
  const invalid = required.find(control => !control.checkValidity());
  if (!invalid) return true;
  showActionFeedback(t[currentLang].intakeRequired, true, "intake");
  invalid.reportValidity();
  invalid.focus({ preventScroll: true });
  invalid.scrollIntoView({ behavior: "smooth", block: "center" });
  return false;
}
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
async function sendProfileEmail(kind) {
  if (kind === "intake" && !validateIntakeRequired()) return;
  const button = document.getElementById(kind === "intake" ? "send-intake-btn" : "send-quiz-btn");
  if (!button || button.disabled) return;
  button.disabled = true;
  button.textContent = t[currentLang].sending;
  showActionFeedback(t[currentLang].sending, false, kind);
  try {
    const { blob, filename } = await generatePdf(kind);
    const intakeName = document.getElementById("intake-full-name").value.trim();
    const client = kind === "intake" ? {
      name: intakeName,
      email: document.getElementById("intake-email").value.trim(),
      phone: document.getElementById("intake-mobile-phone").value.trim(),
      dateOfBirth: document.getElementById("intake-date-of-birth").value
    } : { name: selections.name, email: selections.email, phone: selections.phone };
    const response = await fetch("/.netlify/functions/sendProfileEmail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, language: currentLang, client, attachment: { filename, contentType: "application/pdf", content: await blobToBase64(blob) } }) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    showActionFeedback(t[currentLang].sent, false, kind);
  } catch (error) {
    console.error("Unable to send profile", error);
    showActionFeedback(t[currentLang].sendError, true, kind);
  } finally {
    button.disabled = false;
    button.textContent = t[currentLang].send;
  }
}
if (typeof window !== "undefined") window.addEventListener("afterprint", () => document.body.classList.remove("print-profile", "print-intake"));
function displayDashboard(counts, shared) {
  const x = t[currentLang];
  const title = selections.name ? x.namedTitle(esc(selections.name)) : x.resultsTitle;
  document.getElementById("results").innerHTML = `<div class="results-shell"><header class="results-head"><p class="eyebrow">Twin Beans Farm · Ayurveda</p><h1>${title}</h1><p>${x.notDiagnosis}</p></header><div class="results-grid">${resultPanel("prakruti", x.natural, counts.prakruti)}${resultPanel("vikruti", x.imbalance, counts.vikruti)}</div><div class="action-feedback" id="action-feedback" role="status" aria-live="polite"></div><div class="action-buttons">${shared ? `<button class="primary-btn" onclick="takeOwnQuiz()">${x.takeOwn}</button>` : `<button id="send-quiz-btn" class="primary-btn" onclick="sendProfileEmail('quiz')">${x.send}</button><button id="share-btn" class="action-btn" onclick="sharePdf('quiz')">${x.share}</button>`}<button class="action-btn" onclick="printProfile()">${x.print}</button>${shared ? "" : `<button class="action-btn" onclick="resetQuizData()">${x.reset}</button>`}</div><div class="dosha-info-grid">${doshas.map(dosha => `<article class="dosha-info-card ${dosha}"><h3>${dosha[0].toUpperCase() + dosha.slice(1)}</h3><p>${x[`${dosha}Info`]}</p></article>`).join("")}</div></div>`;
  buildPrintProfile(counts);
}
function showActionFeedback(message, isError = false, source = "quiz") {
  const feedback = document.getElementById(source === "intake" ? "intake-feedback" : "action-feedback");
  feedback.textContent = message;
  feedback.classList.toggle("error", isError);
}

function takeOwnQuiz() {
  isSharedView = false;
  selections = { name: "", phone: "", email: "", prakruti: {}, vikruti: {} };
  intakeData = {};
  intakeControls().forEach(control => { control.disabled = false; if (control.type === "checkbox" || control.type === "radio") control.checked = false; else control.value = ""; });
  currentSection = 0;
  questionnaireOpen = false;
  history.replaceState({}, document.title, location.pathname);
  renderChrome();
  document.getElementById("shared-banner").hidden = true;
  document.getElementById("results").innerHTML = "";
  document.getElementById("intro").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function resetQuizData() {
  selections = { name: "", phone: "", email: "", prakruti: {}, vikruti: {} };
  intakeData = {};
  intakeControls().forEach(control => { if (control.type === "checkbox" || control.type === "radio") control.checked = false; else control.value = ""; });
  currentSection = 0;
  questionnaireOpen = false;
  isSharedView = false;
  [STORAGE.selections, STORAGE.section, STORAGE.intake, "doshaStarted"].forEach(key => localStorage.removeItem(key));
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
  ["user-name", "user-phone", "user-email"].forEach(id => document.getElementById(id).addEventListener("input", saveName));
  prepareIntakeControls();
  if (params.has("id")) {
    try {
      const response = await fetch(`/.netlify/functions/getQuiz?id=${encodeURIComponent(params.get("id"))}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const profile = normalizeProfile(await response.json());
      selections = profile.quiz;
      intakeData = profile.intake;
      if (profile.language && t[profile.language] && !params.get("l")) currentLang = profile.language;
      isSharedView = true;
      questionnaireOpen = false;
      document.getElementById("questionnaire").hidden = true;
      document.getElementById("intro").hidden = true;
      const banner = document.getElementById("shared-banner");
      banner.textContent = t[currentLang].shared;
      banner.hidden = false;
      renderChrome();
      if (!document.getElementById("history-grid").children.length) renderHistory();
      else prepareIntakeControls();
      displayDashboard(getCurrentCounts(), true);
      return;
    } catch (error) {
      console.error("Unable to load shared quiz", error);
      const banner = document.getElementById("shared-banner");
      banner.textContent = t[currentLang].sharedLoadError;
      banner.hidden = false;
    }
  }
  document.getElementById("intro").hidden = false;
  document.getElementById("questionnaire").hidden = true;
  updateIntroActions();
}

init();
