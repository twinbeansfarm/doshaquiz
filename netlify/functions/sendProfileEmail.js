const { Buffer } = require('buffer');

const DESTINATION = 'twinbeansfarm@gmail.com';
const MAX_PDF_BYTES = 5 * 1024 * 1024;
const MAX_BODY_BYTES = 7 * 1024 * 1024;

function clean(value, max = 200) {
  return String(value || '').replace(/[\r\n\0<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

exports.handler = async event => {
  if (event.httpMethod && event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  const contentType = event.headers && (event.headers['content-type'] || event.headers['Content-Type']);
  if (contentType && !contentType.toLowerCase().startsWith('application/json')) return { statusCode: 415, body: JSON.stringify({ error: 'Unsupported request type' }) };
  if (Buffer.byteLength(event.body || '', 'utf8') > MAX_BODY_BYTES) return { statusCode: 413, body: JSON.stringify({ error: 'Profile PDF is too large' }) };

  let payload;
  try { payload = JSON.parse(event.body || ''); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) }; }

  const { attachment, client = {} } = payload || {};
  if (!['quiz', 'intake'].includes(payload?.kind) || !attachment?.content) return { statusCode: 400, body: JSON.stringify({ error: 'Missing profile PDF' }) };
  if (attachment.contentType !== 'application/pdf') return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported attachment type' }) };
  if (typeof attachment.content !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(attachment.content)) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid PDF data' }) };

  const pdf = Buffer.from(attachment.content, 'base64');
  if (!pdf.length || pdf.length > MAX_PDF_BYTES || pdf.subarray(0, 5).toString() !== '%PDF-') return { statusCode: 400, body: JSON.stringify({ error: 'Invalid PDF attachment' }) };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { statusCode: 503, body: JSON.stringify({ error: 'Email service is not configured' }) };

  const name = clean(client.name) || 'Client';
  const filename = clean(attachment.filename, 160).replace(/[^a-zA-Z0-9._-]/g, '_') || 'TwinBeansFarm_Profile.pdf';
  const isVi = payload.language === 'vi';
  const subject = payload.kind === 'intake'
    ? `${isVi ? 'Hồ sơ y tế Ayurveda' : 'Ayurveda Health Intake'} - ${name}`
    : `${isVi ? 'Hồ sơ Ayurveda' : 'Ayurveda Profile'} - ${name}`;
  const lines = [
    `${isVi ? 'Họ tên' : 'Name'}: ${name}`,
    `${isVi ? 'Điện thoại' : 'Phone'}: ${clean(client.phone) || '—'}`,
    `Email: ${clean(client.email) || '—'}`,
    ...(payload.kind === 'intake' ? [`${isVi ? 'Ngày tháng năm sinh' : 'Date of birth'}: ${clean(client.dateOfBirth) || '—'}`] : []),
    `${isVi ? 'Ngày gửi' : 'Sent date'}: ${new Date().toISOString()}`
  ];

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [DESTINATION], subject, text: lines.join('\n'), attachments: [{ filename, content: attachment.content }] })
    });
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'Email provider unavailable' }) };
  }
  if (!response.ok) return { statusCode: 502, body: JSON.stringify({ error: 'Unable to send profile' }) };
  return { statusCode: 200, body: JSON.stringify({ sent: true }) };
};
