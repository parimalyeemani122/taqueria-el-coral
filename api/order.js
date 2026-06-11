module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = req.query?.sessionId || (req.url ? new URL(req.url, `http://${req.headers.host}`).searchParams.get('sessionId') : null);
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  return res.status(200).json({
    empty: true,
    items: [],
    subtotal: '$0.00',
  });
};
