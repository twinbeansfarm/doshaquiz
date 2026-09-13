const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const dataContext = {};
vm.runInNewContext(`${fs.readFileSync("quiz-data.js", "utf8")}\nglobalThis.quizQuestions = questions;`, dataContext);
const questions = dataContext.quizQuestions;
assert.equal(questions.length, 31);
assert.deepEqual(
  [...questions.reduce((map, question) => map.set(question.section, (map.get(question.section) || 0) + 1), new Map()).entries()],
  [["physical", 15], ["functional", 9], ["psychological", 7]]
);
assert.equal(questions[14].id, "bodytype");
assert.equal(questions[15].id, "appetite");
assert.equal(questions[23].id, "menses");
assert.equal(questions[24].id, "personality");
assert.equal(questions[30].id, "speech");
for (const question of questions) {
  for (const language of ["en", "vi"]) {
    for (const field of ["trait", "vata", "pitta", "kapha"]) assert.ok(question[language][field], `${question.id}.${language}.${field}`);
  }
}

const rawAppSource = fs.readFileSync("app.js", "utf8");
const appSource = rawAppSource.replace(/\ninit\(\);\s*$/, "") + "\nglobalThis.testApi={rankedGroups,getCurrentCounts,resultPanel,questionHTML,normalizeProfile,createCombinedProfile,setVikrutiControlState,hasSavedQuizProgress,setSelections:value=>{selections=value}};";
const appContext = {
  console,
  questions,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  document: { createElement: () => ({ textContent: "", get innerHTML() { return this.textContent; } }) }
};
vm.runInNewContext(appSource, appContext);
const { rankedGroups, resultPanel } = appContext.testApi;
assert.deepEqual(JSON.parse(JSON.stringify(rankedGroups({ vata: 10, pitta: 10, kapha: 11 }))), [["kapha"], ["vata", "pitta"]]);
assert.deepEqual(JSON.parse(JSON.stringify(rankedGroups({ vata: 10, pitta: 10, kapha: 9 }))), [["vata", "pitta"], ["kapha"]]);
const empty = resultPanel("vikruti", "Vikruti", { vata: 0, pitta: 0, kapha: 0 });
assert.match(empty, /Chưa ghi nhận mất cân bằng hiện tại/);
assert.doesNotMatch(empty, /<table/);
appContext.testApi.setSelections({ name: "", prakruti: { menses: "not_applicable" }, vikruti: {} });
assert.deepEqual(JSON.parse(JSON.stringify(appContext.testApi.getCurrentCounts())), { prakruti: { vata: 0, pitta: 0, kapha: 0 }, vikruti: { vata: 0, pitta: 0, kapha: 0 } });
const mensesMarkup = appContext.testApi.questionHTML(questions.find(question => question.id === "menses"));
assert.match(mensesMarkup, /Không bắt buộc/);
assert.match(mensesMarkup, /Không có kinh nguyệt/);
assert.match(mensesMarkup, /disabled/);
const indexMarkup = fs.readFileSync("index.html", "utf8");
assert.match(indexMarkup, /Connect your true self with nature\./);
assert.equal((indexMarkup.match(/assets\/brand\/TWINBEANS_Revised\.png/g) || []).length, 2);
assert.doesNotMatch(indexMarkup, /twin-beans-logo\.svg/);
assert.match(indexMarkup, /tel:\+84866222340/);
assert.match(indexMarkup, /mailto:twinbeansfarm@gmail\.com/);
assert.doesNotMatch(indexMarkup, /fonts\.googleapis\.com|brand-mark/);
assert.doesNotMatch(indexMarkup, /Daytime Phone|City, ST, Zip|Family Physician/);
assert.match(indexMarkup, /Full name/);
assert.match(indexMarkup, /Mobile phone/);
assert.match(indexMarkup, /name="full_name" required/);
assert.match(indexMarkup, /type="email" class="glass-input" name="email" required/);
assert.match(indexMarkup, /name="mobile_phone" required/);
assert.match(indexMarkup, /id="intake-date-of-birth" type="date" class="dob-picker" name="date_of_birth" required/);
assert.match(indexMarkup, /name="last_physical_exam" type="text"/);
assert.doesNotMatch(indexMarkup, /copy-intake-btn|>Copy link<|>Sao chép liên kết</);
assert.match(indexMarkup, /onclick="sharePdf\('intake'\)"/);
assert.match(fs.readFileSync("styles.css", "utf8"), /UVN Chuky/);
const legacy = appContext.testApi.normalizeProfile({ name: "Old", prakruti: { face: "vata" }, vikruti: {} });
assert.equal(legacy.version, 1);
assert.equal(legacy.quiz.name, "Old");
const combined = appContext.testApi.normalizeProfile({ version: 2, language: "vi", quiz: { name: "Mai", phone: "0866", email: "mai@example.com", prakruti: { menses: "not_applicable" }, vikruti: {} }, intake: { field_1: "August 2026", objective_2: true, history_me_3: true, history_family_4: true } });
assert.equal(combined.version, 2);
assert.equal(combined.quiz.phone, "0866");
assert.equal(combined.intake.field_1, "August 2026");
assert.equal(combined.intake.history_family_4, true);
const serialized = appContext.testApi.createCombinedProfile({ name: "Mai", phone: "0866", email: "mai@example.com", prakruti: { face: "vata", menses: "not_applicable" }, vikruti: { face: "pitta" } }, { text_1: "notes", textarea_2: "diet", radio_3: true, checkbox_4: true, history_me_5: true, history_family_6: true }, "vi", "2026-09-08T00:00:00.000Z");
assert.equal(serialized.version, 2);
assert.equal(serialized.quiz.scores.prakruti.vata, 1);
assert.equal(serialized.quiz.scores.prakruti.kapha, 0);
assert.equal(serialized.intake.textarea_2, "diet");
assert.equal(appContext.testApi.setVikrutiControlState({ querySelector: () => null }, true), false);
const invalidEqual = appContext.testApi.normalizeProfile({ name: "", prakruti: { face: "vata" }, vikruti: { face: "vata" } });
assert.equal(invalidEqual.quiz.vikruti.face, undefined);
assert.doesNotMatch(rawAppSource, /if\s*\(started\)\s*startQuiz/);
assert.doesNotMatch(rawAppSource, /doshaStarted\s*===\s*["']true/);
assert.match(indexMarkup, /<section id="intro" class="intro">/);
assert.match(indexMarkup, /<section id="questionnaire" hidden>/);
appContext.testApi.setSelections({ name: "Mai", phone: "", email: "", prakruti: { face: "vata" }, vikruti: {} });
assert.equal(appContext.testApi.hasSavedQuizProgress(), true);
assert.doesNotMatch(rawAppSource, /id="copy-btn"|id="copy-intake-btn"/);
assert.match(rawAppSource, /id="share-btn"/);
assert.match(rawAppSource, /class="history-header"/);
assert.match(fs.readFileSync("styles.css", "utf8"), /grid-template-columns:minmax\(0,1fr\) 54px 76px/);
assert.match(rawAppSource, /Bạn sẽ tìm hiểu về thể trạng \(Dosha\) tự nhiên của bản thân \(Prakruti\) và các biểu hiện mất cân bằng hiện tại \(Vikruti\)\./);
assert.doesNotMatch(`${indexMarkup}\n${rawAppSource}`, /Gửi Twin Beans Farm|Send to Twin Beans Farm|send-quiz-btn|send-intake-btn|sendProfileEmail/);
assert.match(indexMarkup, /Please email the following photos at least 48 hours before your first appointment\. You may send the photos individually or provide a Google Drive link\. You do not need to send every photo if your consultation is in person; however, providing photos is still encouraged to support a more thorough assessment\./);
assert.match(rawAppSource, /Vui lòng gửi email các ảnh sau trước buổi hẹn đầu tiên ít nhất 48 giờ\. Email: Twinbeansfarm@gmail\.com\. Có thể gửi từng ảnh hoặc một liên kết Google Drive\. Bạn không cần gửi tất cả ảnh nếu được tham vấn gặp mặt trực tiếp, tuy nhiên vẫn khuyến khích gửi ảnh để được chẩn đoán tốt hơn\./);
assert.match(rawAppSource, /Toàn bộ mặt trên của lưỡi, gồm phần sau \(tốt nhất nên chụp ngay khi thức dậy, trước khi cạo lưỡi\)/);
assert.doesNotMatch(`${indexMarkup}\n${rawAppSource}`, /ít nhất mỗi năm một lần sau đó|at least once a year afterwards/);
assert.match(rawAppSource, /textarea\.style\.height = "auto";[\s\S]*textarea\.scrollHeight/);
assert.match(rawAppSource, /control\.tagName === "TEXTAREA"/);
assert.match(rawAppSource, /pdf-textarea-row/);
assert.doesNotMatch(rawAppSource, /<textarea[^>]*>\$\{esc\(value\)\}/);
const styles = fs.readFileSync("styles.css", "utf8");
assert.match(styles, /body\[data-view="form"\] textarea\{min-height:0;overflow:visible!important;white-space:pre-wrap/);
assert.match(styles, /\.pdf-value\{[^}]*height:auto;overflow:visible;white-space:pre-wrap;overflow-wrap:anywhere/);
assert.match(styles, /\.action-feedback\{[^}]*text-align:center/);
assert.match(styles, /\.action-feedback\.error\{[^}]*text-align:center/);
// Mandatory quiz identity and prominent neutral selection guidance.
assert.match(indexMarkup, /id="user-name"[^>]*required/);
assert.doesNotMatch(indexMarkup.match(/id="user-phone"[^>]*>/)[0], /required/);
assert.doesNotMatch(indexMarkup.match(/id="user-email"[^>]*>/)[0], /required/);
assert.match(rawAppSource, /profileInfo: "Your information", name: "Your name \*"/);
assert.match(rawAppSource, /profileInfo: "Thông tin của bạn", name: "Tên của bạn \*"/);
assert.doesNotMatch(rawAppSource, /Your information \(optional\)|Thông tin của bạn \(không bắt buộc\)/);
assert.match(rawAppSource, /reportValidity\(\)/);
assert.match(rawAppSource, /scrollIntoView/);
for (const phrase of ["Khuynh hướng lâu dài", "Bắt buộc", "Cần chọn 1", "Mất cân bằng hiện tại", "Không bắt buộc", "Chỉ chọn khi có biểu hiện", "Long-term tendency", "Mandatory", "Choose 1", "Current imbalance", "Optional", "Select only when present"]) assert.match(rawAppSource, new RegExp(phrase));
// Semantically named intake controls and the deliberately limited required set.
for (const name of ["yoga_practice", "yoga_duration_frequency", "yoga_location_teacher_tradition", "pranayama_practice", "pranayama_practices", "meditation_practice", "meditation_frequency", "meditation_individual_or_group", "meditation_tradition_philosophy", "current_health_concern", "symptom_short_description", "symptom_frequency", "symptom_intensity", "symptom_duration", "symptom_actions", "symptom_additional_notes"]) assert.match(indexMarkup, new RegExp(`name="${name}"`));
assert.equal((indexMarkup.match(/name="symptom_intensity"/g) || []).length, 3);
for (const name of ["current_health_concern", "symptom_short_description", "symptom_frequency", "symptom_duration", "symptom_actions", "yoga_practice", "pranayama_practice", "meditation_practice"]) assert.match(indexMarkup, new RegExp(`name="${name}"[^>]*required`));
assert.match(indexMarkup, /name="symptom_intensity" value="mild" required/);
for (const name of ["yoga_duration_frequency", "pranayama_practices", "meditation_frequency", "meditation_individual_or_group", "meditation_tradition_philosophy", "symptom_additional_notes"]) assert.doesNotMatch(indexMarkup.match(new RegExp(`<[^>]+name="${name}"[^>]*>`))[0], /required/);
assert.match(rawAppSource, /teacher\.required = Boolean\(practicesYoga\)/);
assert.ok(indexMarkup.indexOf("Objectives") < indexMarkup.indexOf("Medical History &amp; Current Treatment"));
assert.ok(indexMarkup.indexOf("Medical History &amp; Current Treatment") < indexMarkup.indexOf("Current Health Concern"));
assert.ok(indexMarkup.indexOf("Current Health Concern") < indexMarkup.indexOf("Current Health &amp; Vitals"));
assert.match(indexMarkup, /placeholder="DD\/MM\/YYYY"/);
assert.match(rawAppSource, /formatDob/);
assert.match(rawAppSource, /date_of_birth" \? formatDob/);
assert.doesNotMatch(indexMarkup, /raw\.githubusercontent\.com/);
assert.doesNotMatch(rawAppSource, /raw\.githubusercontent\.com/);
assert.doesNotMatch(indexMarkup, /twin-beans-logo\.svg/);
assert.doesNotMatch(rawAppSource, /twin-beans-logo\.svg/);
assert.equal((rawAppSource.match(/assets\/brand\/TWINBEANS_Revised\.png/g) || []).length, 2);
assert.doesNotMatch(rawAppSource.match(/function resetQuizData\(\)[\s\S]*?\n}/)[0], /STORAGE\.intake|intakeData = \{\}/);
console.log("Validated required name, bilingual guidance, intake additions, DD/MM/YYYY DOB, print/PDF flow, and local branding.");
