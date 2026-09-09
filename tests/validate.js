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
assert.match(indexMarkup, /tel:\+84866222340/);
assert.match(indexMarkup, /mailto:twinbeansfarm@gmail\.com/);
assert.doesNotMatch(indexMarkup, /fonts\.googleapis\.com|brand-mark/);
assert.doesNotMatch(indexMarkup, /Daytime Phone|City, ST, Zip|Family Physician|type="date"/);
assert.match(indexMarkup, /Full name/);
assert.match(indexMarkup, /Mobile phone/);
assert.match(indexMarkup, /onclick="exportToText\('intake'\)"/);
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
console.log("Validated sections, bilingual fields, result edge cases, optional non-scoring Menses, and branding contacts.");
