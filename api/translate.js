export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if API key exists
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Anthropic API key not configured. Add ANTHROPIC_API_KEY in Vercel environment variables and redeploy.' });
  }

  try {
    const { fields, sourceLang } = req.body;

    if (!fields || !sourceLang) {
      return res.status(400).json({ error: 'Missing fields or sourceLang' });
    }

    const langNames = { en: "English", hi: "Hindi (Devanagari script)", mr: "Marathi (Devanagari script)" };
    const targetLangs = ["en", "hi", "mr"].filter(l => l !== sourceLang);

    const fieldEntries = Object.entries(fields).filter(([k, v]) => v && v.trim());
    if (fieldEntries.length === 0) {
      return res.status(400).json({ error: 'No content to translate' });
    }

    const fieldList = fieldEntries.map(([key, value]) => `"${key}": "${value}"`).join(',\n  ');

    const prompt = `You are a translator specializing in Hindu temple and spiritual content. Translate the following from ${langNames[sourceLang]} to ${targetLangs.map(l => langNames[l]).join(' and ')}.

Source (${langNames[sourceLang]}):
{
  ${fieldList}
}

Important guidelines:
- For temple names: keep "Shree/Sri/श्री" as appropriate in each language. Transliterate proper nouns.
- For location names: transliterate city/village names, translate common words like "district", "Maharashtra" etc.
- For descriptions: translate meaning, not word-by-word. Keep spiritual terminology authentic.
- Hindi should use proper Hindi vocabulary and Devanagari script.
- Marathi should use proper Marathi vocabulary and Devanagari script (not Hindi words).
- English should be clean, readable English with proper nouns transliterated.

Respond ONLY in valid JSON with no other text, no markdown backticks:
{
  ${targetLangs.map(l => fieldEntries.map(([key]) => `"${key}_${l}": "translated text"`).join(',\n  ')).join(',\n  ')}
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      return res.status(500).json({ error: `Anthropic API error: ${response.status}` });
    }

    const result = await response.json();
    const text = result.content[0].text.replace(/```json|```/g, '').trim();
    const translations = JSON.parse(text);

    return res.status(200).json(translations);
  } catch (e) {
    console.error('Translation error:', e);
    return res.status(500).json({ error: e.message || 'Translation failed' });
  }
}
