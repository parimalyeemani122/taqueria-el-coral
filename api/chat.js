const fs = require('fs');
const path = require('path');

function loadEnvKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;

  const root = process.cwd();
  for (const fileName of ['.env.local', '.env']) {
    try {
      const filePath = path.join(root, fileName);
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf-8');
      const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
      if (match?.[1]) return match[1].trim();
    } catch {
      continue;
    }
  }
  return undefined;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { messages, sessionId, restaurantId = 'taqueria-el-coral' } = body;
  if (!messages || !sessionId) {
    return res.status(400).json({ error: 'Missing messages or sessionId' });
  }

  const apiKey = loadEnvKey();
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY environment variable' });
  }

  const systemPrompt = `You are Maya, a friendly restaurant order assistant for Taqueria El Coral. Help customers with the menu, answer questions about the restaurant, and guide them toward placing an order in a warm, conversational, natural tone. Keep responses concise and helpful. If you do not know an answer, say so honestly.`;

  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: String(message.content),
    })),
  ];

  const systemPrompt2 = chatMessages.shift()?.content;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        system: systemPrompt2,
        messages: chatMessages,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Anthropic request failed' });
    }

    const message = data?.content?.[0]?.text || 'Sorry, something went wrong. Please try again.';
    return res.status(200).json({ message });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};
