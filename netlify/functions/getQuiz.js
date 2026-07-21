exports.handler = async (event) => {
  const id = event.queryStringParameters.id;
  const url = `${process.env.SUPABASE_URL}/rest/v1/quizzes?id=eq.${id}&select=*`;
  const key = process.env.SUPABASE_KEY;

  const response = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });

  const result = await response.json();
  return { statusCode: 200, body: JSON.stringify(result[0].data) };
};
