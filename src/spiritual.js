export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Groq API key not configured on server' });
  }

  const { prompt, lang, messages } = req.body;

  const langInstruction = lang === "hi"
    ? "Respond in Hindi (Devanagari script). Be warm, spiritual and authentic."
    : lang === "mr"
    ? "Respond in Marathi (Devanagari script). Be warm, spiritual and authentic."
    : "Respond in English. Be warm, spiritual and authentic.";

  // Chat mode: full message history passed directly
  // Single query mode: prompt + lang
  const groqMessages = messages
    ? messages  // use as-is, system prompt already included
    : [
        {
          role: "system",
          content: `You are a knowledgeable Hindu spiritual advisor with deep expertise in Datta Sampradaya tradition, Vedic scriptures, and Sanskrit. ${langInstruction}`,
        },
        { role: "user", content: prompt },
      ];

  try {
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
      return res.status(groqRes.status).json({ error: err?.error?.message || 'API error' });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
