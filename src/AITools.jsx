import { useState } from "react";
import { useLang } from "./LangContext.jsx";

const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4" };
const inputStyle = { fontFamily: sansFont, fontSize: 14, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, width: "100%", boxSizing: "border-box", outline: "none", color: C.dark, background: "#fff" };

// ─── Gemini API Call (Free Tier) ───
const GEMINI_MODEL = "gemini-2.5-flash";

async function askGemini(prompt, lang, retries = 2) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("no_key");

  const langInstruction = lang === "hi"
    ? "Respond in Hindi (Devanagari script). Be warm, spiritual and authentic."
    : lang === "mr"
    ? "Respond in Marathi (Devanagari script). Be warm, spiritual and authentic."
    : "Respond in English. Be warm, spiritual and authentic.";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${langInstruction}\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 429 && retries > 0) {
      // Auto retry after 5 seconds
      await new Promise(r => setTimeout(r, 5000));
      return askGemini(prompt, lang, retries - 1);
    }
    if (res.status === 429) throw new Error("rate_limit");
    if (res.status === 400) throw new Error("invalid_key");
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received";
}

// ─── Shared UI ───
function AskButton({ onClick, loading, lang }) {
  const labels = { en: "✨ Get Guidance", hi: "✨ मार्गदर्शन लें", mr: "✨ मार्गदर्शन घ्या" };
  const loadingLabels = { en: "Seeking divine guidance... (may take a moment)", hi: "दिव्य मार्गदर्शन प्राप्त हो रहा है...", mr: "दिव्य मार्गदर्शन मिळत आहे..." };
  return (
    <button onClick={onClick} disabled={loading}
      style={{ fontFamily: sansFont, fontSize: 15, fontWeight: 700, padding: "13px 32px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? C.light : `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff", width: "100%", marginTop: 12, opacity: loading ? 0.7 : 1 }}>
      {loading ? (loadingLabels[lang] || loadingLabels.en) : (labels[lang] || labels.en)}
    </button>
  );
}

function ResponseBox({ response, lang }) {
  if (!response) return null;
  return (
    <div style={{ marginTop: 20, padding: "20px 24px", background: C.goldLight, borderRadius: 14, border: `1px solid ${C.gold}` }}>
      <p style={{ fontFamily: sansFont, fontSize: 12, color: C.gold, fontWeight: 700, margin: "0 0 10px", textTransform: "uppercase" }}>
        🕉️ {lang === "hi" ? "दिव्य मार्गदर्शन" : lang === "mr" ? "दिव्य मार्गदर्शन" : "Divine Guidance"}
      </p>
      <div style={{ fontFamily: font, fontSize: 15, color: C.dark, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{response}</div>
      <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "12px 0 0", fontStyle: "italic" }}>
        {lang === "hi" ? "⚠️ यह AI मार्गदर्शन है। विशेष परिस्थितियों में पंडित जी से संपर्क करें।"
          : lang === "mr" ? "⚠️ हे AI मार्गदर्शन आहे. विशेष परिस्थितीत पंडितजींशी संपर्क करा."
          : "⚠️ This is AI guidance. For serious matters, consult a qualified priest."}
      </p>
    </div>
  );
}

function ErrorBox({ error, lang }) {
  if (!error) return null;
  let msg;
  if (error === "rate_limit") msg = lang === "hi" ? "अभी बहुत अनुरोध हैं। 1 मिनट बाद पुनः प्रयास करें।" : lang === "mr" ? "सध्या खूप विनंत्या. 1 मिनिटानंतर पुन्हा प्रयत्न करा." : "Too many requests. Please try again in 1 minute.";
  else if (error === "no_key") msg = "Gemini API key not configured. Add VITE_GEMINI_API_KEY in Vercel and redeploy.";
  else if (error === "invalid_key") msg = "Invalid Gemini API key. Please check the key in Vercel settings.";
  else msg = lang === "hi" ? `त्रुटि: ${error}` : lang === "mr" ? `त्रुटी: ${error}` : `Error: ${error}`;
  return (
    <div style={{ marginTop: 12, padding: "12px 16px", background: "#fde8e8", borderRadius: 10, fontFamily: sansFont, fontSize: 13, color: "#c0392b" }}>
      ⚠️ {msg}
    </div>
  );
}

// ─── Tool 1: Puja Recommender ───
function PujaRecommender({ lang }) {
  const [situation, setSituation] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const placeholders = {
    en: "Describe your situation... e.g. 'My son is struggling in studies. Our family faces financial difficulties. Which puja would help us?'",
    hi: "अपनी स्थिति बताएं... जैसे 'मेरे बेटे की पढ़ाई में परेशानी है, घर में आर्थिक कठिनाई है, कौन सी पूजा करें?'",
    mr: "तुमची परिस्थिती सांगा... जसे 'माझ्या मुलाच्या शिक्षणात अडचण आहे, घरात आर्थिक समस्या आहे, कोणती पूजा करावी?'",
  };

  const handleAsk = async () => {
    if (!situation.trim()) return;
    setLoading(true); setError(""); setResponse("");
    try {
      const prompt = `You are a knowledgeable Vedic priest specializing in the Datta Sampradaya tradition. A devotee shares:

"${situation}"

Provide:
1. Specific puja(s) recommended and why (include Datta Sampradaya pujas where relevant)
2. Which deity to worship and on which day of the week
3. A mantra to chant (include in Sanskrit/Devanagari)
4. Simple home remedies or rituals
5. Words of spiritual encouragement rooted in Datta tradition

Be warm, compassionate and specific.`;
      setResponse(await askGemini(prompt, lang));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: C.saffronLight, borderRadius: 14, padding: "16px 20px", marginBottom: 16, border: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: sansFont, fontSize: 13, color: C.mid, margin: 0, lineHeight: 1.7 }}>
          🪔 {lang === "hi" ? "अपनी परिस्थिति बताएं — परिवार, स्वास्थ्य, व्यापार, संतान, विवाह — जो भी मन में हो। AI उचित पूजा और उपाय सुझाएगा।"
            : lang === "mr" ? "तुमची परिस्थिती सांगा — कुटुंब, आरोग्य, व्यवसाय, संतान, विवाह — जे मनात असेल. AI योग्य पूजा आणि उपाय सुचवेल."
            : "Describe your situation — family, health, business, children, marriage. AI will suggest the right puja and remedies."}
        </p>
      </div>
      <textarea value={situation} onChange={e => setSituation(e.target.value)} placeholder={placeholders[lang] || placeholders.en} rows={5} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
      <AskButton onClick={handleAsk} loading={loading} lang={lang} />
      <ErrorBox error={error} lang={lang} />
      <ResponseBox response={response} lang={lang} />
    </div>
  );
}

// ─── Tool 2: Spiritual Q&A ───
function Prashnottari({ lang }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const suggested = {
    en: ["What is the significance of Guru Purnima?", "Why does Dattatreya have 3 faces?", "What is the meaning of Digambara Digambara?", "How to do daily Datta puja at home?"],
    hi: ["गुरु पूर्णिमा का क्या महत्व है?", "दत्तात्रेय के तीन मुख क्यों हैं?", "दिगंबरा दिगंबरा का अर्थ क्या है?", "घर पर रोज दत्त पूजा कैसे करें?"],
    mr: ["गुरू पौर्णिमेचे महत्त्व काय?", "दत्तात्रेयांना तीन मुख का?", "दिगंबरा दिगंबराचा अर्थ काय?", "घरी रोज दत्त पूजा कशी करावी?"],
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true); setError(""); setResponse("");
    try {
      const prompt = `You are a learned scholar of Hindu scriptures with deep expertise in Datta Sampradaya, Gurucharitra and Vedic philosophy.

A devotee asks: "${question}"

Provide:
1. A clear authentic answer rooted in scripture
2. References to Gurucharitra, Upanishads or Puranas where relevant
3. Practical application for daily life
4. Keep tone reverent and accessible

Focus on Datta Sampradaya tradition where relevant.`;
      setResponse(await askGemini(prompt, lang));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: C.saffronLight, borderRadius: 14, padding: "16px 20px", marginBottom: 16, border: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 700, color: C.mid, margin: "0 0 10px" }}>
          💡 {lang === "hi" ? "सुझाए गए प्रश्न:" : lang === "mr" ? "सुचवलेले प्रश्न:" : "Suggested questions:"}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(suggested[lang] || suggested.en).map(q => (
            <button key={q} onClick={() => setQuestion(q)} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", color: C.mid, cursor: "pointer", textAlign: "left" }}>{q}</button>
          ))}
        </div>
      </div>
      <textarea value={question} onChange={e => setQuestion(e.target.value)}
        placeholder={lang === "hi" ? "कोई भी आध्यात्मिक प्रश्न पूछें..." : lang === "mr" ? "कोणताही आध्यात्मिक प्रश्न विचारा..." : "Ask any spiritual question..."}
        rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      <AskButton onClick={handleAsk} loading={loading} lang={lang} />
      <ErrorBox error={error} lang={lang} />
      <ResponseBox response={response} lang={lang} />
    </div>
  );
}

// ─── Tool 3: Mantra Explainer ───
function MantraExplainer({ lang }) {
  const [mantra, setMantra] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const examples = ["ॐ द्रां दत्तात्रेयाय नमः", "दिगंबरा दिगंबरा श्रीपाद वल्लभ दिगंबरा", "ॐ नमः शिवाय", "ॐ गं गणपतये नमः", "महामृत्युंजय मंत्र", "गायत्री मंत्र"];

  const handleAsk = async () => {
    if (!mantra.trim()) return;
    setLoading(true); setError(""); setResponse("");
    try {
      const prompt = `You are a Sanskrit scholar and Vedic priest. A devotee wants to understand:

"${mantra}"

Explain:
1. Word-by-word meaning (break down each word/syllable)
2. Overall meaning and spiritual significance
3. Which deity it addresses and why
4. Benefits of chanting
5. Correct way to chant (timing, count, rules)
6. Any scripture references or stories

Make it beautiful, detailed and accessible.`;
      setResponse(await askGemini(prompt, lang));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 700, color: C.mid, margin: "0 0 10px" }}>
          💡 {lang === "hi" ? "उदाहरण मंत्र:" : lang === "mr" ? "उदाहरण मंत्र:" : "Example mantras:"}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {examples.map(m => (
            <button key={m} onClick={() => setMantra(m)} style={{ fontFamily: font, fontSize: 13, padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.cream, color: C.maroon, cursor: "pointer" }}>{m}</button>
          ))}
        </div>
      </div>
      <input value={mantra} onChange={e => setMantra(e.target.value)}
        placeholder={lang === "hi" ? "मंत्र, स्तोत्र या श्लोक यहां लिखें..." : lang === "mr" ? "मंत्र, स्तोत्र किंवा श्लोक येथे लिहा..." : "Enter mantra, stotra or shloka..."}
        style={{ ...inputStyle, fontFamily: font, fontSize: 16 }} />
      <AskButton onClick={handleAsk} loading={loading} lang={lang} />
      <ErrorBox error={error} lang={lang} />
      <ResponseBox response={response} lang={lang} />
    </div>
  );
}

// ─── Tool 4: Dream Interpretation ───
function SwapnaPhal({ lang }) {
  const [dream, setDream] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (!dream.trim()) return;
    setLoading(true); setError(""); setResponse("");
    try {
      const prompt = `You are a Hindu scholar specializing in Swapna Shastra (dream interpretation per Atharva Veda, Brihat Samhita, Swapna Adhyaya).

A devotee describes their dream: "${dream}"

Provide:
1. Interpretation per Hindu Swapna Shastra
2. Whether auspicious or inauspicious and what it indicates
3. Recommended prayer, puja or remedy
4. Approximate timeframe if applicable
5. Words of guidance and encouragement

Root interpretation in Hindu scripture and Datta tradition where relevant.`;
      setResponse(await askGemini(prompt, lang));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: "#f0f4ff", borderRadius: 14, padding: "16px 20px", marginBottom: 16, border: `1px solid #c5cae9` }}>
        <p style={{ fontFamily: sansFont, fontSize: 13, color: "#3949ab", margin: 0, lineHeight: 1.7 }}>
          🌙 {lang === "hi" ? "हिंदू स्वप्न शास्त्र के अनुसार, रात्रि के — विशेषतः प्रातःकाल के — स्वप्न आने वाले समय का संकेत देते हैं।"
            : lang === "mr" ? "हिंदू स्वप्न शास्त्रानुसार, रात्रीचे — विशेषतः पहाटेचे — स्वप्न येणाऱ्या काळाचे संकेत देतात."
            : "According to Hindu Swapna Shastra, dreams — especially those seen in early morning — are signs of things to come."}
        </p>
      </div>
      <textarea value={dream} onChange={e => setDream(e.target.value)}
        placeholder={lang === "hi" ? "अपना स्वप्न विस्तार से बताएं... जैसे 'मैंने भगवान दत्तात्रेय को भगवा वस्त्रों में देखा...'"
          : lang === "mr" ? "तुमचे स्वप्न विस्ताराने सांगा... जसे 'मला भगवान दत्तात्रेय भगव्या वस्त्रात दिसले...'"
          : "Describe your dream in detail... e.g. 'I saw Lord Dattatreya in saffron robes giving me flowers...'"}
        rows={5} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
      <AskButton onClick={handleAsk} loading={loading} lang={lang} />
      <ErrorBox error={error} lang={lang} />
      <ResponseBox response={response} lang={lang} />
    </div>
  );
}

// ─── Tool 5: Kundli Guidance ───
function KundliGuidance({ lang }) {
  const [form, setForm] = useState({ rashi: "", nakshatra: "", currentPeriod: "", concerns: "" });
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rashis = {
    en: ["Aries (Mesh)", "Taurus (Vrishabh)", "Gemini (Mithun)", "Cancer (Kark)", "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchik)", "Sagittarius (Dhanu)", "Capricorn (Makar)", "Aquarius (Kumbh)", "Pisces (Meen)"],
    hi: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
    mr: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तूळ", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
  };
  const periods = ["Sun/Surya", "Moon/Chandra", "Mars/Mangal", "Rahu", "Jupiter/Guru", "Saturn/Shani", "Mercury/Budh", "Ketu", "Venus/Shukra"];

  const handleAsk = async () => {
    if (!form.rashi) { setError(lang === "hi" ? "कृपया अपनी राशि चुनें" : lang === "mr" ? "कृपया तुमची राशी निवडा" : "Please select your Rashi"); return; }
    setLoading(true); setError(""); setResponse("");
    try {
      const prompt = `You are an expert Vedic astrologer with deep knowledge of Jyotish Shastra and Datta Sampradaya remedies.

Devotee details:
- Moon Sign (Rashi): ${form.rashi}
- Birth Nakshatra: ${form.nakshatra || "Not specified"}
- Current Dasha period: ${form.currentPeriod || "Not specified"}
- Current situation: ${form.concerns || "General guidance"}

Provide:
1. Current cosmic influences for this Rashi
2. What the current dasha means for them
3. Specific puja recommendations (include Datta Sampradaya pujas)
4. Mantras to chant daily
5. Favorable days, colors, gemstones
6. Spiritual practices that will help most now`;
      setResponse(await askGemini(prompt, lang));
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>{lang === "hi" ? "चंद्र राशि *" : lang === "mr" ? "चंद्र राशी *" : "Moon Sign *"}</label>
            <select value={form.rashi} onChange={e => setForm(f => ({ ...f, rashi: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">{lang === "hi" ? "राशि चुनें" : lang === "mr" ? "राशी निवडा" : "Select Rashi"}</option>
              {(rashis[lang] || rashis.en).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>{lang === "hi" ? "जन्म नक्षत्र" : lang === "mr" ? "जन्म नक्षत्र" : "Birth Nakshatra"}</label>
            <input value={form.nakshatra} onChange={e => setForm(f => ({ ...f, nakshatra: e.target.value }))} placeholder={lang === "hi" ? "जैसे: रोहिणी, अश्विनी" : "e.g. Rohini, Ashwini"} style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>{lang === "hi" ? "वर्तमान दशा" : lang === "mr" ? "सध्याची दशा" : "Current Dasha Period"}</label>
          <select value={form.currentPeriod} onChange={e => setForm(f => ({ ...f, currentPeriod: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">{lang === "hi" ? "दशा चुनें (वैकल्पिक)" : "Select (optional)"}</option>
            {periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>{lang === "hi" ? "वर्तमान परिस्थिति" : lang === "mr" ? "सध्याची परिस्थिती" : "Current situation"}</label>
          <textarea value={form.concerns} onChange={e => setForm(f => ({ ...f, concerns: e.target.value }))}
            placeholder={lang === "hi" ? "जीवन में क्या चल रहा है? स्वास्थ्य, करियर, विवाह..." : lang === "mr" ? "जीवनात काय चालू आहे? आरोग्य, करियर, विवाह..." : "What's happening in life? Health, career, marriage..."}
            rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      </div>
      <AskButton onClick={handleAsk} loading={loading} lang={lang} />
      <ErrorBox error={error} lang={lang} />
      <ResponseBox response={response} lang={lang} />
    </div>
  );
}

// ─── Main Component ───
export function AITools() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState("puja");

  const tabs = [
    { key: "puja", icon: "🪔", en: "Puja Advisor", hi: "पूजा सलाहकार", mr: "पूजा सल्लागार" },
    { key: "prashn", icon: "🕉️", en: "Spiritual Q&A", hi: "प्रश्नोत्तरी", mr: "प्रश्नोत्तरी" },
    { key: "mantra", icon: "📿", en: "Mantra Guide", hi: "मंत्र मार्गदर्शन", mr: "मंत्र मार्गदर्शन" },
    { key: "swapna", icon: "🌙", en: "Dream Guide", hi: "स्वप्न फल", mr: "स्वप्न फल" },
    { key: "kundli", icon: "⭐", en: "Rashi Guidance", hi: "राशि मार्गदर्शन", mr: "राशी मार्गदर्शन" },
  ];

  const titles = {
    puja: { en: "🪔 AI Puja Recommender", hi: "🪔 AI पूजा सलाहकार", mr: "🪔 AI पूजा सल्लागार" },
    prashn: { en: "🕉️ Spiritual Q&A", hi: "🕉️ आध्यात्मिक प्रश्नोत्तरी", mr: "🕉️ आध्यात्मिक प्रश्नोत्तरी" },
    mantra: { en: "📿 Mantra & Stotra Explainer", hi: "📿 मंत्र और स्तोत्र व्याख्या", mr: "📿 मंत्र आणि स्तोत्र स्पष्टीकरण" },
    swapna: { en: "🌙 Dream Interpretation", hi: "🌙 स्वप्न फल व्याख्या", mr: "🌙 स्वप्न फल विवेचन" },
    kundli: { en: "⭐ Kundli Spiritual Guidance", hi: "⭐ कुंडली आधारित मार्गदर्शन", mr: "⭐ कुंडली आधारित मार्गदर्शन" },
  };

  const descs = {
    puja: { en: "Describe your situation, get personalized puja recommendations", hi: "अपनी परिस्थिति बताएं, व्यक्तिगत पूजा सुझाव पाएं", mr: "परिस्थिती सांगा, वैयक्तिक पूजा सुचना मिळवा" },
    prashn: { en: "Ask about spirituality, rituals, Datta Sampradaya", hi: "अध्यात्म, अनुष्ठान, दत्त संप्रदाय के बारे में पूछें", mr: "अध्यात्म, विधी, दत्त संप्रदायाबद्दल विचारा" },
    mantra: { en: "Get word-by-word meaning of any mantra or stotra", hi: "किसी भी मंत्र या स्तोत्र का अर्थ जानें", mr: "कोणत्याही मंत्राचा अर्थ जाणा" },
    swapna: { en: "Dream interpretation per Hindu Swapna Shastra", hi: "हिंदू स्वप्न शास्त्र अनुसार स्वप्न फल", mr: "हिंदू स्वप्न शास्त्रानुसार स्वप्न फल" },
    kundli: { en: "Spiritual guidance based on moon sign and dasha", hi: "राशि और दशा आधारित आध्यात्मिक मार्गदर्शन", mr: "राशी आणि दशा आधारित मार्गदर्शन" },
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "0 0 8px" }}>
          {lang === "hi" ? "🤖 AI आध्यात्मिक सहायक" : lang === "mr" ? "🤖 AI आध्यात्मिक सहाय्यक" : "🤖 AI Spiritual Assistant"}
        </h2>
        <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light }}>
          {lang === "hi" ? "दत्त संप्रदाय परंपरा पर आधारित — निःशुल्क AI मार्गदर्शन"
            : lang === "mr" ? "दत्त संप्रदाय परंपरेवर आधारित — मोफत AI मार्गदर्शन"
            : "Rooted in Datta Sampradaya tradition — Free AI-powered spiritual guidance"}
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, padding: "9px 14px", borderRadius: 20, border: `1.5px solid ${activeTab === tab.key ? C.saffron : C.border}`, cursor: "pointer", background: activeTab === tab.key ? C.saffron : "#fff", color: activeTab === tab.key ? "#fff" : C.mid, display: "flex", alignItems: "center", gap: 6 }}>
            <span>{tab.icon}</span><span>{tab[lang] || tab.en}</span>
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", background: C.cream, borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: font, fontSize: 20, color: C.maroon, margin: "0 0 4px" }}>{titles[activeTab][lang] || titles[activeTab].en}</h3>
          <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: 0 }}>{descs[activeTab][lang] || descs[activeTab].en}</p>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {activeTab === "puja" && <PujaRecommender lang={lang} />}
          {activeTab === "prashn" && <Prashnottari lang={lang} />}
          {activeTab === "mantra" && <MantraExplainer lang={lang} />}
          {activeTab === "swapna" && <SwapnaPhal lang={lang} />}
          {activeTab === "kundli" && <KundliGuidance lang={lang} />}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: "12px 18px", background: C.cream, borderRadius: 10, textAlign: "center" }}>
        <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: 0 }}>
          🙏 {lang === "hi" ? "यह सेवा Google Gemini AI द्वारा निःशुल्क संचालित है। गंभीर विषयों के लिए योग्य पंडित जी से परामर्श लें।"
            : lang === "mr" ? "ही सेवा Google Gemini AI द्वारे मोफत चालवली जाते. गंभीर विषयांसाठी पंडितजींचा सल्ला घ्या."
            : "This service is powered by Google Gemini AI — completely free. For serious matters, consult a qualified priest."}
        </p>
      </div>
    </div>
  );
}
