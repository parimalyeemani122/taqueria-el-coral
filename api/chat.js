const CHATBOT_URL = process.env.CHATBOT_URL || 'https://restaurant-chatbot-production-2aa6.up.railway.app';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { messages, sessionId, restaurantId = 'taqueria_el_coral_santa_teresa' } = body;
  if (!messages || !sessionId) {
    return res.status(400).json({ error: 'Missing messages or sessionId' });
  }

  try {
    const upstream = await fetch(`${CHATBOT_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, sessionId, restaurantId }),
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Proxy error' });
  }
};
