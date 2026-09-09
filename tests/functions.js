const assert = require("assert");
process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_KEY = "test-key";
let stored;
global.fetch = async (url, options = {}) => {
  if (options.method === "POST") {
    stored = JSON.parse(options.body);
    return { ok: true, json: async () => ({}) };
  }
  return { ok: true, json: async () => [{ data: stored.data }] };
};
const save = require("../netlify/functions/saveQuiz").handler;
const get = require("../netlify/functions/getQuiz").handler;
(async () => {
  const profile = { name: "Duong", phone: "0866", email: "d@example.com", prakruti: { face: "vata" }, vikruti: {} };
  const saved = await save({ body: JSON.stringify(profile) });
  assert.equal(saved.statusCode, 200);
  assert.match(JSON.parse(saved.body).id, /^[0-9a-f-]{36}$/i);
  assert.equal(stored.data.name, "Duong");
  const loaded = await get({ queryStringParameters: { id: JSON.parse(saved.body).id } });
  assert.deepEqual(JSON.parse(loaded.body), profile);
  const combined = { version: 2, language: "vi", quiz: profile, intake: { field_1: "August 2026", objective_2: true }, savedAt: "2026-09-08T00:00:00.000Z" };
  const combinedSaved = await save({ body: JSON.stringify(combined) });
  assert.equal(combinedSaved.statusCode, 200);
  const combinedLoaded = await get({ queryStringParameters: { id: JSON.parse(combinedSaved.body).id } });
  assert.deepEqual(JSON.parse(combinedLoaded.body), combined);
  assert.equal((await save({ body: "not json" })).statusCode, 400);
  assert.equal((await get({ queryStringParameters: { id: "../bad" } })).statusCode, 400);
  console.log("Validated shared-profile save/load round trip with name, Prakruti, and empty Vikruti.");
})().catch(error => { console.error(error); process.exitCode = 1; });
