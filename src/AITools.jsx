import { useState } from "react";
import { useLang } from "./LangContext.jsx";

const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4", success: "#2d7a4f", successBg: "#e8f5ee" };
const inputStyle = { fontFamily: sansFont, fontSize: 14, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, width: "100%", boxSizing: "border-box", outline: "none", color: C.dark, background: "#fff" };

// ─── Claude API Call ───
async function askClaude(prompt, lang) {
  const langInstruction = lang === "hi"
    ? "Respond in Hindi (Devanagari script). Keep it warm, spiritual and authentic."
    : lang === "mr"
    ? "Respond in Marathi (Devanagari script). Keep it warm, spiritual and authentic."
    : "Respond in English. Keep it warm, spiritual and authentic.";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: `${langInstruction}\n\n${prompt}` }],
    }),
  });
  if (!res.ok) throw new Error("API error: " + res.status);
  const data = await res.json();
  return data.content[0].text;
}

// ─── Shared UI ───
function AskButton({ onClick, loading, lang }) {
  const labels = { en: "✨ Get Guidance", hi: "✨ मार्गदर्शन लें", mr: "✨ मार्गदर्शन घ्या" };
  const loading_labels = { en: "Seeking divine guidance...", hi: "दिव्य मार्गदर्शन प्राप्त हो रहा है...", mr: "दिव्य मार्गदर्शन मिळत आहे..." };
  return (
    <button onClick={onClick} disabled={loading}
      style={{ fontFamily: sansFont, fontSize: 15, fontWeight: 700, padding: "13px 32px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? C.light : `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff", width: "100%", marginTop: 12, opacity: loading ? 0.7 : 1 }}>
      {loading ? loading_labels[lang] || loading_labels.en : labels[lang] || labels.en}
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
        {lang === "hi" ? "⚠️ यह AI मार्गदर्शन है। सटीक परामर्श के लिए पंडित जी से संपर्क करें।" : lang === "mr" ? "⚠️ हे AI मार्गदर्शन आहे. अचूक सल्ल्यासाठी पंडितजींशी संपर्क करा." : "⚠️ This is AI guidance. For precise advice, consult a priest."}
      </p>
    </div>
  );
}

function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div style={{ marginTop: 12, padding: "12px 16px", background: "#fde8e8", borderRadius: 10, fontFamily: sansFont, fontSize: 13, color: "#c0392b" }}>
      ⚠️ {error}
    </div>
  );
}

// ─── Tool 1: AI Puja Recommender ───
function PujaRecommender({ lang }) {
  const [situation, setSituation] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const placeholders = {
    en: "Describe your situation... e.g. 'My son is struggling in studies and career. Our family is going through financial difficulties. I want to know which puja would help us.'",
    hi: "अपनी स्थिति बताएं... जैसे 'मेरे बेटे की पढ़ाई में परेशानी है। घर में आर्थिक कठिनाइयां हैं। कौन सी पूजा से लाभ होगा?'",
    mr: "तुमची परिस्थिती सांगा... जसे 'माझ्या मुलाच्या शिक्षणात अडचणी आहेत. घरात आर्थिक समस्या आहेत. कोणती पूजा फायदेशीर ठरेल?'",
  };

  const handleAsk = async () => {
    if (!situation.trim()) return;
    setLoading(true); setError(""); setResponse("");
    try {
      const prompt = `You are a knowledgeable Vedic astrologer and priest specializing in the Datta Sampradaya tradition. A devotee has shared their situation:

"${situation}"

Based on this, provide:
1. Which specific puja(s) are recommended and why (mention Lord Dattatreya pujas where relevant)
2. Which deity to pray to and on which day
3. Which mantra to chant (include the mantra in Sanskrit/Devanagari)
4. Any specific rituals or remedies
5. Words of spiritual encouragement

Keep your response warm, compassionate and rooted in Hindu/Datta Sampradaya tradition.`;
      const res = await askClaude(prompt, lang);
      setResponse(res);
    } catch (e) {
      setError(lang === "hi" ? "त्रुटि हुई। कृपया पुनः प्रयास करें।" : lang === "mr" ? "त्रुटी झाली. कृपया पुन्हा प्रयत्न करा." : "An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: C.saffronLight, borderRadius: 14, padding: "20px 24px", marginBottom: 20, border: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: sansFont, fontSize: 13, color: C.mid, margin: 0, lineHeight: 1.7 }}>
          {lang === "hi" ? "🪔 अपनी परिस्थिति बताएं — परिवार, स्वास्थ्य, व्यापार, संतान, विवाह — जो भी मन में हो। AI आपके लिए उचित पूजा और उपाय सुझाएगा।"
          : lang === "mr" ? "🪔 तुमची परिस्थिती सांगा — कुटुंब, आरोग्य, व्यवसाय, संतान, विवाह — जे काही मनात असेल. AI तुमच्यासाठी योग्य पूजा आणि उपाय सुचवेल."
          : "🪔 Describe your situation — family, health, business, children, marriage — whatever is on your mind. AI will suggest the right puja and remedies for you."}
        </p>
      </div>
      <textarea value={situation} onChange={e => setSituation(e.target.value)}
        placeholder={placeholders[lang] || placeholders.en}
        rows={5} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
      <AskButton onClick={handleAsk} loading={loading} lang={lang} />
      <ErrorBox error={error} />
      <ResponseBox response={response} lang={lang} />
    </div>
  );
}

// ─── Tool 2: AI Prashnottari ───
function Prashnottari({ lang }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const placeholders = {
    en: "Ask any spiritual question... e.g. 'What is the significance of Gurucharitra parayan?' or 'Why do we offer water to the Tulsi plant?' or 'What is the Datta Sampradaya philosophy?'",
    hi: "कोई भी आध्यात्मिक प्रश्न पूछें... जैसे 'गुरुचरित्र पारायण का क्या महत्व है?' या 'दत्त संप्रदाय का दर्शन क्या है?'",
    mr: "कोणताही आध्यात्मिक प्रश्न विचारा... जसे 'गुरुचरित्र पारायणाचे महत्त्व काय?' किंवा 'दत्त संप्रदायाचे तत्त्वज्ञान काय आहे?'",
  };

  const suggested = {
    en: ["What is the significance of Guru Purnima?", "Why is Lord Dattatreya shown with 3 heads?", "What is the meaning of 'Digambara Digambara'?", "How to do daily Datta puja at home?"],
    hi: ["गुरु पूर्णिमा का क्या महत्व है?", "दत्तात्रेय के तीन मुख क्यों हैं?", "दिगंबरा दिगंबरा का अर्थ क्या है?", "घर पर रोज दत्त पूजा कैसे करें?"],
    mr: ["गुरू पौर्णिमेचे महत्त्व काय?", "दत्तात्रेयांना तीन मुख का आहेत?", "दिगंबरा दिगंबरा चा अर्थ काय?", "घरी रोज दत्त पूजा कशी करावी?"],
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true); setError(""); setResponse("");
    try {
      const prompt = `You are a learned scholar of Hindu scriptures with deep expertise in the Datta Sampradaya tradition, Gurucharitra, and Vedic philosophy. A devotee asks:

"${question}"

Answer this question with:
1. A clear, authentic answer rooted in scripture and tradition
2. References to relevant texts (Gurucharitra, Upanishads, Puranas) where applicable  
3. Practical spiritual application for the devotee's daily life
4. Keep the tone reverent, warm and accessible to a common devotee

Focus especially on Datta Sampradaya knowledge when relevant.`;
      const res = await askClaude(prompt, lang);
      setResponse(res);
    } catch (e) {
      setError(lang === "hi" ? "त्रुटि हुई। कृपया पुनः प्रयास करें।" : "An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: C.saffronLight, borderRadius: 14, padding: "16px 20px", marginBottom: 16, border: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 700, color: C.mid, margin: "0 0 10px" }}>
          {lang === "hi" ? "💡 सुझाए गए प्रश्न:" : lang === "mr" ? "💡 सुचवलेले प्रश्न:" : "💡 Suggested questions:"}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(suggested[lang] || suggested.en).map(q => (
            <button key={q} onClick={() => setQuestion(q)}
              style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", color: C.mid, cursor: "pointer", textAlign: "left" }}>
              {q}
            </button>
          ))}
        </div>
      </div>
      <textarea value={question} onChange={e => setQuestion(e.target.value)}
        placeholder={placeholders[lang] || placeholders.en}
        rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      <AskButton onClick={handleAsk} loading={loading} lang={lang} />
      <ErrorBox error={error} />
      <ResponseBox response={response} lang={lang} />
    </div>
  );
}

// ─── Tool 3: Mantra/Stotra Explainer ───
function MantraExplainer({ lang }) {
  const [mantra, setMantra] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const examples = [
    "ॐ द्रां दत्तात्रेयाय नमः",
    "दिगंबरा दिगंबरा श्रीपाद वल्लभ दिगंबरा",
    "ॐ नमः शिवाय",
    "ॐ गं गणपतये नमः",
    "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे",
    "महामृत्युंजय मंत्र",
    "गायत्री मंत्र",
  ];

  const handleAsk = async () => {
    if (!mantra.trim()) return;
    setLoading(true); setError(""); setResponse("");
    try {
      const prompt = `You are a Sanskrit scholar and Vedic priest with deep knowledge of mantras, stotras and their meanings. A devotee wants to understand:

"${mantra}"

Please explain:
1. Word by word meaning (break down each word/syllable)
2. Overall meaning and significance
3. Which deity it is addressed to and why
4. The spiritual benefits of chanting this mantra/stotra
5. Correct way to chant (time, number of repetitions, any rules)
6. Any interesting stories or references from scripture related to it

Make it beautiful, detailed and accessible to a regular devotee.`;
      const res = await askClaude(prompt, lang);
      setResponse(res);
    } catch (e) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 700, color: C.mid, margin: "0 0 10px" }}>
          {lang === "hi" ? "💡 उदाहरण मंत्र:" : lang === "mr" ? "💡 उदाहरण मंत्र:" : "💡 Example mantras:"}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {examples.map(m => (
            <button key={m} onClick={() => setMantra(m)}
              style={{ fontFamily: font, fontSize: 13, padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.cream, color: C.maroon, cursor: "pointer" }}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <input value={mantra} onChange={e => setMantra(e.target.value)}
        placeholder={lang === "hi" ? "मंत्र, स्तोत्र या श्लोक यहां लिखें..." : lang === "mr" ? "मंत्र, स्तोत्र किंवा श्लोक येथे लिहा..." : "Enter mantra, stotra or shloka here..."}
        style={{ ...inputStyle, fontFamily: font, fontSize: 16 }} />
      <AskButton onClick={handleAsk} loading={loading} lang={lang} />
      <ErrorBox error={error} />
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

  const placeholders = {
    en: "Describe your dream in detail... e.g. 'I saw Lord Dattatreya in saffron clothes giving me flowers. There was a river nearby and I felt very peaceful.'",
    hi: "अपना स्वप्न विस्तार से बताएं... जैसे 'मैंने भगवान दत्तात्रेय को भगवा वस्त्रों में देखा, वे मुझे फूल दे रहे थे। पास में एक नदी थी और मन को बहुत शांति मिली।'",
    mr: "तुमचे स्वप्न विस्ताराने सांगा... जसे 'मला भगवान दत्तात्रेय भगव्या वस्त्रात दिसले, ते मला फुले देत होते. जवळ एक नदी होती आणि मनाला खूप शांती मिळाली.'",
  };

  const handleAsk = async () => {
    if (!dream.trim()) return;
    setLoading(true); setError(""); setResponse("");
    try {
      const prompt = `You are a learned Hindu scholar specializing in Swapna Shastra (dream interpretation according to ancient Hindu texts like Swapna Adhyaya, Brihat Samhita, and Atharva Veda).

A devotee describes their dream:
"${dream}"

Please provide:
1. Interpretation according to Hindu Swapna Shastra tradition
2. What this dream may signify spiritually
3. Is it auspicious or inauspicious? What does it indicate?
4. Any recommended prayer, puja or remedy based on this dream
5. Time frame if applicable (when might the indicated event occur)
6. Words of guidance and encouragement

Root your interpretation in Hindu scripture and Datta Sampradaya tradition where relevant. Be thoughtful and compassionate.`;
      const res = await askClaude(prompt, lang);
      setResponse(res);
    } catch (e) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: "#f0f4ff", borderRadius: 14, padding: "16px 20px", marginBottom: 16, border: `1px solid #c5cae9` }}>
        <p style={{ fontFamily: sansFont, fontSize: 13, color: "#3949ab", margin: 0, lineHeight: 1.7 }}>
          🌙 {lang === "hi" ? "हिंदू स्वप्न शास्त्र के अनुसार — रात्रि के स्वप्न, विशेषतः प्रातःकाल के स्वप्न — आने वाले समय का संकेत देते हैं। अपना स्वप्न विस्तार से बताएं।"
          : lang === "mr" ? "हिंदू स्वप्न शास्त्रानुसार — रात्रीचे स्वप्न, विशेषतः पहाटेचे स्वप्न — येणाऱ्या काळाचे संकेत देतात. तुमचे स्वप्न विस्ताराने सांगा."
          : "According to Hindu Swapna Shastra — dreams, especially those seen in the early morning hours — are signs of things to come. Describe your dream in detail."}
        </p>
      </div>
      <textarea value={dream} onChange={e => setDream(e.target.value)}
        placeholder={placeholders[lang] || placeholders.en}
        rows={5} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
      <AskButton onClick={handleAsk} loading={loading} lang={lang} />
      <ErrorBox error={error} />
      <ResponseBox response={response} lang={lang} />
    </div>
  );
}

// ─── Tool 5: Kundli Spiritual Guidance ───
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
    if (!form.rashi) { setError(lang === "hi" ? "कृपया अपनी राशि चुनें" : "Please select your Rashi"); return; }
    setLoading(true); setError(""); setResponse("");
    try {
      const prompt = `You are an expert Vedic astrologer with deep knowledge of Jyotish Shastra and Datta Sampradaya spiritual remedies.

A devotee provides the following details:
- Moon Sign (Chandra Rashi): ${form.rashi}
- Birth Nakshatra: ${form.nakshatra || "Not specified"}
- Current Mahadasha/Dasha period: ${form.currentPeriod || "Not specified"}
- Current concerns or life situation: ${form.concerns || "General guidance requested"}

Please provide:
1. Characteristics of this Rashi and its current cosmic influences
2. What the current dasha period means for this person
3. Specific puja recommendations for this Rashi (include Datta Sampradaya pujas)
4. Recommended mantras to chant daily
5. Favorable days, colors, gemstones
6. Spiritual practices that will help most right now
7. General predictions and guidance for this period

Be detailed, authentic and rooted in Vedic tradition.`;
      const res = await askClaude(prompt, lang);
      setResponse(res);
    } catch (e) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>
              {lang === "hi" ? "चंद्र राशि *" : lang === "mr" ? "चंद्र राशी *" : "Moon Sign (Chandra Rashi) *"}
            </label>
            <select value={form.rashi} onChange={e => setForm(f => ({ ...f, rashi: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">{lang === "hi" ? "राशि चुनें" : lang === "mr" ? "राशी निवडा" : "Select Rashi"}</option>
              {(rashis[lang] || rashis.en).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>
              {lang === "hi" ? "जन्म नक्षत्र" : lang === "mr" ? "जन्म नक्षत्र" : "Birth Nakshatra"}
            </label>
            <input value={form.nakshatra} onChange={e => setForm(f => ({ ...f, nakshatra: e.target.value }))}
              placeholder={lang === "hi" ? "जैसे: रोहिणी, अश्विनी..." : "e.g. Rohini, Ashwini..."}
              style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>
            {lang === "hi" ? "वर्तमान महादशा / दशा" : lang === "mr" ? "सध्याची महादशा / दशा" : "Current Mahadasha / Dasha Period"}
          </label>
          <select value={form.currentPeriod} onChange={e => setForm(f => ({ ...f, currentPeriod: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">{lang === "hi" ? "दशा चुनें (वैकल्पिक)" : "Select period (optional)"}</option>
            {periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>
            {lang === "hi" ? "वर्तमान परिस्थिति / चिंता" : lang === "mr" ? "सध्याची परिस्थिती / काळजी" : "Current situation / concerns"}
          </label>
          <textarea value={form.concerns} onChange={e => setForm(f => ({ ...f, concerns: e.target.value }))}
            placeholder={lang === "hi" ? "जीवन में क्या चल रहा है? स्वास्थ्य, करियर, विवाह, संतान..." : lang === "mr" ? "जीवनात काय चालू आहे? आरोग्य, करियर, विवाह, संतान..." : "What's happening in your life? Health, career, marriage, children..."}
            rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      </div>
      <AskButton onClick={handleAsk} loading={loading} lang={lang} />
      <ErrorBox error={error} />
      <ResponseBox response={response} lang={lang} />
    </div>
  );
}

// ─── Main AI Tools Component ───
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
    prashn: { en: "🕉️ Spiritual Q&A (Prashnottari)", hi: "🕉️ आध्यात्मिक प्रश्नोत्तरी", mr: "🕉️ आध्यात्मिक प्रश्नोत्तरी" },
    mantra: { en: "📿 Mantra & Stotra Explainer", hi: "📿 मंत्र और स्तोत्र व्याख्या", mr: "📿 मंत्र आणि स्तोत्र स्पष्टीकरण" },
    swapna: { en: "🌙 Dream Interpretation (Swapna Phal)", hi: "🌙 स्वप्न फल व्याख्या", mr: "🌙 स्वप्न फल विवेचन" },
    kundli: { en: "⭐ Kundli-based Spiritual Guidance", hi: "⭐ कुंडली आधारित मार्गदर्शन", mr: "⭐ कुंडली आधारित मार्गदर्शन" },
  };

  const descs = {
    puja: { en: "Describe your life situation and get personalized puja recommendations", hi: "अपनी परिस्थिति बताएं और व्यक्तिगत पूजा सुझाव पाएं", mr: "तुमची परिस्थिती सांगा आणि वैयक्तिक पूजा सुचना मिळवा" },
    prashn: { en: "Ask any question about spirituality, rituals, Datta Sampradaya tradition", hi: "अध्यात्म, अनुष्ठान, दत्त संप्रदाय के बारे में कोई भी प्रश्न पूछें", mr: "अध्यात्म, विधी, दत्त संप्रदाय बद्दल कोणताही प्रश्न विचारा" },
    mantra: { en: "Enter any mantra or stotra to get its word-by-word meaning and significance", hi: "कोई भी मंत्र या स्तोत्र लिखें और उसका अर्थ व महत्व जानें", mr: "कोणताही मंत्र किंवा स्तोत्र लिहा आणि त्याचा अर्थ जाणा" },
    swapna: { en: "Describe your dream and get interpretation as per Hindu Swapna Shastra", hi: "अपना स्वप्न बताएं और हिंदू स्वप्न शास्त्र अनुसार फल जानें", mr: "तुमचे स्वप्न सांगा आणि हिंदू स्वप्न शास्त्रानुसार फल जाणा" },
    kundli: { en: "Get spiritual guidance based on your moon sign, nakshatra and dasha", hi: "अपनी राशि, नक्षत्र और दशा के आधार पर आध्यात्मिक मार्गदर्शन पाएं", mr: "तुमची राशी, नक्षत्र आणि दशा यावर आधारित आध्यात्मिक मार्गदर्शन मिळवा" },
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "0 0 8px" }}>
          {lang === "hi" ? "🤖 AI आध्यात्मिक सहायक" : lang === "mr" ? "🤖 AI आध्यात्मिक सहाय्यक" : "🤖 AI Spiritual Assistant"}
        </h2>
        <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light }}>
          {lang === "hi" ? "दत्त संप्रदाय परंपरा पर आधारित — AI द्वारा संचालित व्यक्तिगत आध्यात्मिक मार्गदर्शन"
          : lang === "mr" ? "दत्त संप्रदाय परंपरेवर आधारित — AI द्वारे वैयक्तिक आध्यात्मिक मार्गदर्शन"
          : "Rooted in Datta Sampradaya tradition — AI-powered personal spiritual guidance"}
        </p>
      </div>

      {/* Tab Pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, padding: "9px 14px", borderRadius: 20, border: `1.5px solid ${activeTab === tab.key ? C.saffron : C.border}`, cursor: "pointer", background: activeTab === tab.key ? C.saffron : "#fff", color: activeTab === tab.key ? "#fff" : C.mid, display: "flex", alignItems: "center", gap: 6 }}>
            <span>{tab.icon}</span>
            <span>{tab[lang] || tab.en}</span>
          </button>
        ))}
      </div>

      {/* Active Tool */}
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

      {/* Disclaimer */}
      <div style={{ marginTop: 16, padding: "12px 18px", background: C.cream, borderRadius: 10, textAlign: "center" }}>
        <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: 0 }}>
          {lang === "hi" ? "🙏 यह सेवा AI द्वारा संचालित है। गंभीर विषयों के लिए कृपया योग्य पंडित जी से परामर्श लें। प्रति प्रश्न छोटी AI लागत लगती है।"
          : lang === "mr" ? "🙏 ही सेवा AI द्वारे चालवली जाते. गंभीर विषयांसाठी योग्य पंडितजींचा सल्ला घ्या. प्रति प्रश्न थोडी AI किंमत लागते."
          : "🙏 This service is powered by AI. For serious matters, please consult a qualified priest. A small AI cost applies per query."}
        </p>
      </div>
    </div>
  );
}
