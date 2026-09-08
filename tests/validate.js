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

const appSource = fs.readFileSync("app.js", "utf8").replace(/\ninit\(\);\s*$/, "") + "\nglobalThis.testApi={rankedGroups,getCurrentCounts,resultPanel};";
const appContext = {
  console,
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
console.log("Validated 31 questions (15/9/7), workbook section boundaries, bilingual fields, tie groups, and empty Vikruti output.");
