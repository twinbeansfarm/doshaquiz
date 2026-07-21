exports.handler = async (event) => {
  const url = `${process.env.SUPABASE_URL}/rest/v1/quizzes`;
  const key = process.env.SUPABASE_KEY;
  const data = JSON.parse(event.body);
  const shortId = Math.random().toString(36).substring(2, 8);

  await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ id: shortId, data: data })
  });

  return { statusCode: 200, body: JSON.stringify({ id: shortId }) };
};
