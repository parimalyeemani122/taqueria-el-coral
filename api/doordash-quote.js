// TODO: Replace with live DoorDash Drive API credentials — see https://developer.doordash.com/en-US/docs/drive/tutorials/get_started
module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Mock response — replace with real DoorDash Drive /v2/estimates endpoint
  return res.status(200).json({
    fee: 5.99,
    currency: 'USD',
    estimated_delivery_time: '35–50 min',
    external_delivery_id: `MOCK-${Date.now()}`,
  });
};
