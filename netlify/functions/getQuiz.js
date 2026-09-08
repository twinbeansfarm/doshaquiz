exports.handler = async (event) => {
  const id = event.queryStringParameters && event.queryStringParameters.id;
  const isLegacyId = /^[a-z0-9]{6}$/i.test(id || '');
  const isSecureId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || '');
  if (!isLegacyId && !isSecureId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid quiz profile id' }) };
  }
  const url = `${process.env.SUPABASE_URL}/rest/v1/quizzes?id=eq.${id}&select=*`;
  const key = process.env.SUPABASE_KEY;

  const response = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });

  if (!response.ok) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Unable to load quiz profile' }) };
  }

  const result = await response.json();
  if (!result.length) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Quiz profile not found' }) };
  }
  return { statusCode: 200, body: JSON.stringify(result[0].data) };
};
