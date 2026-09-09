exports.handler = async (event) => {
  const url = `${process.env.SUPABASE_URL}/rest/v1/quizzes`;
  const key = process.env.SUPABASE_KEY;
  let data;
  try {
    data = JSON.parse(event.body || '');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid quiz profile' }) };
  }
  const quiz = data && data.version === 2 ? data.quiz : data;
  if (!quiz || typeof quiz !== 'object' || typeof quiz.prakruti !== 'object' || typeof quiz.vikruti !== 'object') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid quiz profile' }) };
  }
  const profileId = require('crypto').randomUUID();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ id: profileId, data: data })
  });

  if (!response.ok) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Unable to save quiz profile' }) };
  }

  return { statusCode: 200, body: JSON.stringify({ id: profileId }) };
};
