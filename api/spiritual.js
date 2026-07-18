export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Groq API key not configured' });
  }

  try {
    const body = req.body;
    const lang = body.lang || 'en';
    const messages = body.messages;
    const prompt = body.prompt;

    const langInstruction = lang === "hi"
      ? "Always respond in Hindi (Devanagari script). Be warm and spiritual."
      : lang === "mr"
      ? "Always respond in Marathi (Devanagari script). Be warm and spiritual."
      : "Always respond in English. Be warm and spiritual.";

    let groqMessages;

    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Chat mode - full conversation history
      groqMessages = messages;
    } else if (prompt) {
      // Single query mode
      groqMessages = [
        {
          role: "system",
          content: `You are a knowledgeable Hindu spiritual advisor specializing in Datta Sampradaya. ${langInstruction}`
        },
        { role: "user", content: prompt }
      ];
    } else {
      return res.status(400).json({ error: 'Missing prompt or messages' });
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      if (groqRes.status === 429) return res.status(429).json({ error: 'rate_limit' });
      return res.status(groqRes.status).json({ error: err?.error?.message || 'Groq API error' });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
