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
  const profile = { name: "Duong", prakruti: { face: "vata" }, vikruti: {} };
  const saved = await save({ body: JSON.stringify(profile) });
  assert.equal(saved.statusCode, 200);
  assert.equal(stored.data.name, "Duong");
  const loaded = await get({ queryStringParameters: { id: JSON.parse(saved.body).id } });
  assert.deepEqual(JSON.parse(loaded.body), profile);
  assert.equal((await save({ body: "not json" })).statusCode, 400);
  assert.equal((await get({ queryStringParameters: { id: "../bad" } })).statusCode, 400);
  console.log("Validated shared-profile save/load round trip with name, Prakruti, and empty Vikruti.");
})().catch(error => { console.error(error); process.exitCode = 1; });
