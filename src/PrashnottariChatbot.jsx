import { useState, useEffect, useRef } from "react";
import { useLang } from "./LangContext.jsx";
import { verifyAccessCode } from "./supabase.js";

const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4", success: "#2d7a4f", successBg: "#e8f5ee" };

const SYSTEM_PROMPT = `You are Gurudev, a wise and compassionate spiritual guide deeply rooted in the Datta Sampradaya tradition. You have comprehensive knowledge of:
- Lord Dattatreya and all his incarnations (Shripad Shrivallabh, Nrusimha Saraswati, etc.)
- Gurucharitra scripture and its teachings
- Vedic rituals, pujas, mantras and their meanings
- Hindu philosophy, astrology and remedies
- Datta Sampradaya pilgrimage sites (Ganagapur, Nrusimhawadi, Audumbar, Girnar)

You speak with warmth, wisdom and compassion. You:
- Remember everything discussed in this conversation
- Ask clarifying questions when needed to give better guidance
- Suggest specific pujas, mantras or remedies when appropriate
- Quote from Gurucharitra or scriptures when relevant
- Always encourage devotion and spiritual practice
- End responses with a short blessing when appropriate

Keep responses concise (3-5 paragraphs max) unless more detail is asked.`;

async function askGroq(messages, lang) {
  const langInstruction = lang === "hi"
    ? "Always respond in Hindi (Devanagari script)."
    : lang === "mr"
    ? "Always respond in Marathi (Devanagari script)."
    : "Always respond in English.";

  const res = await fetch('/api/spiritual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lang,
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n\n${langInstruction}` },
        ...messages,
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 429) throw new Error("rate_limit");
    throw new Error(err?.error || "Error");
  }
  const data = await res.json();
  return data.text || "";
}

// ─── Access Code Gate ───
function AccessCodeGate({ lang, onUnlock }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if already unlocked in session
  useEffect(() => {
    const saved = sessionStorage.getItem("chatbot_unlocked");
    if (saved === "true") onUnlock();
  }, []);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setLoading(true); setError("");
    try {
      const result = await verifyAccessCode(code);
      if (result) {
        sessionStorage.setItem("chatbot_unlocked", "true");
        onUnlock();
      } else {
        setError(lang === "hi" ? "अमान्य या समाप्त कोड। कृपया Facebook पेज से नया कोड प्राप्त करें।"
          : lang === "mr" ? "अवैध किंवा कालबाह्य कोड. कृपया Facebook पेजवरून नवा कोड मिळवा."
          : "Invalid or expired code. Please get the latest code from our Facebook page.");
      }
    } catch (e) {
      setError(lang === "hi" ? "त्रुटि हुई। पुनः प्रयास करें।" : "An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "32px 24px", background: `linear-gradient(135deg, ${C.maroon}, ${C.saffronDark})`, borderRadius: 20, marginBottom: 24, color: "#fff" }}>
        <span style={{ fontSize: 52, display: "block", marginBottom: 12 }}>🤖</span>
        <h2 style={{ fontFamily: font, fontSize: 26, margin: "0 0 8px", color: C.gold }}>
          {lang === "hi" ? "AI प्रश्नोत्तरी — गुरुदेव से बात करें" : lang === "mr" ? "AI प्रश्नोत्तरी — गुरुदेवांशी बोला" : "AI Prashnottari — Chat with Gurudev"}
        </h2>
        <p style={{ fontFamily: sansFont, fontSize: 14, opacity: 0.85, margin: 0, lineHeight: 1.6 }}>
          {lang === "hi" ? "दत्त संप्रदाय के ज्ञान पर आधारित AI आध्यात्मिक गुरु से सीधे बात करें — जितने चाहें उतने प्रश्न पूछें"
            : lang === "mr" ? "दत्त संप्रदायाच्या ज्ञानावर आधारित AI आध्यात्मिक गुरूशी थेट बोला — हवे तितके प्रश्न विचारा"
            : "Have a real conversation with an AI spiritual guide rooted in Datta Sampradaya — ask as many questions as you want"}
        </p>
      </div>

      {/* How to get code */}
      <div style={{ background: "#f0f4ff", borderRadius: 14, padding: "18px 22px", marginBottom: 20, border: "1px solid #c5cae9" }}>
        <p style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 700, color: "#3949ab", margin: "0 0 10px" }}>
          📘 {lang === "hi" ? "एक्सेस कोड कैसे पाएं?" : lang === "mr" ? "ऍक्सेस कोड कसा मिळवायचा?" : "How to get access code?"}
        </p>
        <ol style={{ fontFamily: sansFont, fontSize: 13, color: "#3949ab", margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>{lang === "hi" ? "हमारे Facebook पेज को Like और Follow करें" : lang === "mr" ? "आमचे Facebook पेज Like आणि Follow करा" : "Like and Follow our Facebook page"}</li>
          <li>{lang === "hi" ? "हर महीने का एक्सेस कोड पेज पर पोस्ट किया जाता है" : lang === "mr" ? "दर महिन्याचा ऍक्सेस कोड पेजवर पोस्ट केला जातो" : "Monthly access code is posted on the page"}</li>
          <li>{lang === "hi" ? "कोड नीचे दर्ज करें और चैट शुरू करें" : lang === "mr" ? "खाली कोड प्रविष्ट करा आणि चॅट सुरू करा" : "Enter the code below and start chatting"}</li>
        </ol>
        <a href="https://www.facebook.com/shreedattarajgurumauli" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: 12, fontFamily: sansFont, fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 8, background: "#1877F2", color: "#fff", textDecoration: "none" }}>
          👍 {lang === "hi" ? "Facebook पेज पर जाएं" : lang === "mr" ? "Facebook पेजवर जा" : "Visit Facebook Page"}
        </a>
      </div>

      {/* Code input */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: `1px solid ${C.border}` }}>
        <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 700, color: C.mid, display: "block", marginBottom: 10 }}>
          🔑 {lang === "hi" ? "एक्सेस कोड दर्ज करें" : lang === "mr" ? "ऍक्सेस कोड प्रविष्ट करा" : "Enter Access Code"}
        </label>
        {error && <div style={{ fontFamily: sansFont, fontSize: 13, color: "#c0392b", background: "#fde8e8", padding: "10px 14px", borderRadius: 8, marginBottom: 12 }}>⚠️ {error}</div>}
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && handleVerify()}
          placeholder={lang === "hi" ? "जैसे: DATTA2026" : lang === "mr" ? "उदा: DATTA2026" : "e.g. DATTA2026"}
          style={{ fontFamily: sansFont, fontSize: 16, fontWeight: 700, padding: "14px 16px", borderRadius: 10, border: `2px solid ${C.border}`, width: "100%", boxSizing: "border-box", outline: "none", letterSpacing: 2, color: C.maroon, marginBottom: 12 }}
        />
        <button onClick={handleVerify} disabled={loading || !code.trim()}
          style={{ width: "100%", fontFamily: sansFont, fontSize: 15, fontWeight: 700, padding: "13px", borderRadius: 10, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff", opacity: loading || !code.trim() ? 0.6 : 1 }}>
          {loading ? "🔄 Verifying..." : `🙏 ${lang === "hi" ? "कोड सत्यापित करें" : lang === "mr" ? "कोड सत्यापित करा" : "Verify Code"}`}
        </button>
      </div>
    </div>
  );
}

// ─── Chat Bubble ───
function ChatBubble({ msg, lang }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
      {!isUser && (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.maroon, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, marginRight: 8, alignSelf: "flex-end" }}>🕉️</div>
      )}
      <div style={{
        maxWidth: "75%",
        padding: "12px 16px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})` : "#fff",
        color: isUser ? "#fff" : C.dark,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: isUser ? "none" : `1px solid ${C.border}`,
      }}>
        <p style={{ fontFamily: font, fontSize: 14, margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{msg.content}</p>
      </div>
      {isUser && (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: C.saffronLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, marginLeft: 8, alignSelf: "flex-end" }}>🙏</div>
      )}
    </div>
  );
}

// ─── Main Chatbot ───
function PrashnottariChat({ lang, onLock }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const suggestedQuestions = {
    en: ["What is the significance of Datta Jayanti?", "I am going through a difficult phase in life. Please guide me.", "How to do daily Datta puja at home?", "What is the meaning of Gurucharitra?"],
    hi: ["दत्त जयंती का क्या महत्व है?", "मेरे जीवन में बहुत कठिनाइयां हैं। मार्गदर्शन करें।", "घर पर रोज दत्त पूजा कैसे करें?", "गुरुचरित्र का क्या अर्थ है?"],
    mr: ["दत्त जयंतीचे महत्त्व काय?", "माझ्या जीवनात खूप अडचणी आहेत. मार्गदर्शन करा.", "घरी रोज दत्त पूजा कशी करावी?", "गुरुचरित्राचा अर्थ काय?"],
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput("");
    setError("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const reply = await askGroq(newMessages, lang);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      if (e.message === "rate_limit") {
        setError(lang === "hi" ? "अभी बहुत अनुरोध हैं। 1 मिनट बाद पुनः प्रयास करें।" : lang === "mr" ? "सध्या खूप विनंत्या. 1 मिनिटानंतर पुन्हा प्रयत्न करा." : "Too many requests. Please try again in a minute.");
      } else {
        setError(e.message);
      }
      // Remove the user message if failed
      setMessages(newMessages.slice(0, -1));
    }
    setLoading(false);
  };

  const clearChat = () => {
    if (confirm(lang === "hi" ? "चैट मिटाएं?" : "Clear chat?")) {
      setMessages([]);
      setError("");
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 500 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.maroon}, ${C.saffronDark})`, borderRadius: "16px 16px 0 0", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🕉️</div>
          <div>
            <h3 style={{ fontFamily: font, fontSize: 17, color: C.gold, margin: 0 }}>
              {lang === "hi" ? "गुरुदेव — AI आध्यात्मिक मार्गदर्शक" : lang === "mr" ? "गुरुदेव — AI आध्यात्मिक मार्गदर्शक" : "Gurudev — AI Spiritual Guide"}
            </h3>
            <p style={{ fontFamily: sansFont, fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>
              {lang === "hi" ? "दत्त संप्रदाय परंपरा पर आधारित • Facebook सदस्य एक्सक्लूसिव"
                : lang === "mr" ? "दत्त संप्रदाय परंपरेवर आधारित • Facebook सदस्य एक्सक्लूसिव्ह"
                : "Datta Sampradaya tradition • Facebook subscriber exclusive"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {messages.length > 0 && (
            <button onClick={clearChat} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
              🗑️ Clear
            </button>
          )}
          <button onClick={() => { sessionStorage.removeItem("chatbot_unlocked"); onLock(); }}
            style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
            🔒 Lock
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", background: C.cream, display: "flex", flexDirection: "column" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>🙏</span>
            <h4 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: "0 0 6px" }}>
              {lang === "hi" ? "नमस्कार! मैं गुरुदेव हूं।" : lang === "mr" ? "नमस्कार! मी गुरुदेव आहे." : "Namaste! I am Gurudev."}
            </h4>
            <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: "0 0 20px" }}>
              {lang === "hi" ? "आध्यात्म, दत्त संप्रदाय, पूजा, मंत्र — जो भी पूछना हो, पूछें।"
                : lang === "mr" ? "अध्यात्म, दत्त संप्रदाय, पूजा, मंत्र — जे विचारायचे असेल ते विचारा."
                : "Ask me anything about spirituality, Datta Sampradaya, puja, mantras."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {(suggestedQuestions[lang] || suggestedQuestions.en).map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  style={{ fontFamily: sansFont, fontSize: 12, padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", color: C.mid, cursor: "pointer", textAlign: "left" }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => <ChatBubble key={i} msg={msg} lang={lang} />)}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.maroon, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginRight: 8 }}>🕉️</div>
            <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: "#fff", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.saffron, display: "inline-block", animation: `bounce 1.2s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ fontFamily: sansFont, fontSize: 13, color: "#c0392b", background: "#fde8e8", padding: "10px 14px", borderRadius: 10, marginBottom: 12 }}>⚠️ {error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", background: "#fff", borderRadius: "0 0 16px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={lang === "hi" ? "अपना प्रश्न यहाँ लिखें... (Enter दबाएं)" : lang === "mr" ? "तुमचा प्रश्न येथे लिहा... (Enter दाबा)" : "Type your question here... (Press Enter to send)"}
          rows={2}
          style={{ fontFamily: font, fontSize: 14, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, flex: 1, resize: "none", outline: "none", color: C.dark, lineHeight: 1.5 }}
          disabled={loading}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          style={{ fontFamily: sansFont, fontSize: 20, padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff", opacity: loading || !input.trim() ? 0.5 : 1, flexShrink: 0 }}>
          🙏
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Export ───
export function PrashnottariChatbot() {
  const { lang } = useLang();
  const [unlocked, setUnlocked] = useState(false);

  return unlocked
    ? <PrashnottariChat lang={lang} onLock={() => setUnlocked(false)} />
    : <AccessCodeGate lang={lang} onUnlock={() => setUnlocked(true)} />;
}
