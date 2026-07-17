export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on server' });
  }

  const { prompt, lang } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const langInstruction = lang === "hi"
    ? "Respond in Hindi (Devanagari script). Be warm, spiritual and authentic."
    : lang === "mr"
    ? "Respond in Marathi (Devanagari script). Be warm, spiritual and authentic."
    : "Respond in English. Be warm, spiritual and authentic.";

  const GEMINI_MODEL = "gemini-2.0-flash";

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${langInstruction}\n\n${prompt}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      if (geminiRes.status === 429) return res.status(429).json({ error: 'rate_limit' });
      return res.status(geminiRes.status).json({ error: err?.error?.message || 'Gemini API error' });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ text });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
