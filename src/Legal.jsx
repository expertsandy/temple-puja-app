import { useState } from "react";

const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4" };

function LangToggle({ lang, setLang }) {
  return (
    <div style={{ display: "flex", gap: 4, background: C.cream, borderRadius: 8, padding: 3, marginBottom: 24, width: "fit-content" }}>
      {["hi", "en"].map(l => (
        <button key={l} onClick={() => setLang(l)} style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", background: lang === l ? C.saffron : "transparent", color: lang === l ? "#fff" : C.mid }}>
          {l === "hi" ? "हिंदी" : "English"}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontFamily: font, fontSize: 18, color: C.saffron, margin: "0 0 10px" }}>{title}</h3>
      <div style={{ fontFamily: sansFont, fontSize: 15, color: C.mid, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

// ─── Privacy Policy ───
export function PrivacyPolicyPage() {
  const [lang, setLang] = useState("hi");
  const updated = "15 मई 2026 / May 15, 2026";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "0 0 6px" }}>🔒 {lang === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}</h2>
      <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: "0 0 20px" }}>Last updated / अंतिम अपडेट: {updated}</p>
      <LangToggle lang={lang} setLang={setLang} />

      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", border: `1px solid ${C.border}` }}>
        {lang === "hi" ? (
          <>
            <Section title="1. परिचय">
              <p>श्री दत्तराज गुरुमाऊली (shreedattarajgurumauli.com) आपकी गोपनीयता का सम्मान करती है। यह नीति बताती है कि हम आपकी व्यक्तिगत जानकारी कैसे एकत्र, उपयोग और सुरक्षित रखते हैं।</p>
            </Section>
            <Section title="2. हम कौन सी जानकारी एकत्र करते हैं">
              <p>पूजा पंजीकरण के दौरान हम निम्नलिखित जानकारी एकत्र करते हैं: पूरा नाम, फ़ोन नंबर, ईमेल पता (वैकल्पिक), गोत्र (वैकल्पिक), परिवार के सदस्यों की संख्या, पसंदीदा पूजा तिथि, और भुगतान स्क्रीनशॉट।</p>
            </Section>
            <Section title="3. जानकारी का उपयोग">
              <p>आपकी जानकारी का उपयोग केवल निम्नलिखित उद्देश्यों के लिए किया जाता है: पूजा पंजीकरण की पुष्टि और समन्वय, भुगतान सत्यापन, पूजा से संबंधित अपडेट और सूचनाएं, और मंदिर समन्वयक द्वारा संपर्क।</p>
            </Section>
            <Section title="4. जानकारी की सुरक्षा">
              <p>आपकी जानकारी सुरक्षित क्लाउड सर्वर पर संग्रहीत की जाती है। हम उचित तकनीकी और संगठनात्मक उपाय करते हैं ताकि आपकी जानकारी अनधिकृत पहुंच, परिवर्तन या विनाश से सुरक्षित रहे।</p>
            </Section>
            <Section title="5. जानकारी साझा करना">
              <p>हम आपकी व्यक्तिगत जानकारी किसी तीसरे पक्ष को नहीं बेचते, किराए पर नहीं देते या साझा नहीं करते। जानकारी केवल पूजा समन्वय के लिए संबंधित मंदिर प्रशासन के साथ साझा की जा सकती है।</p>
            </Section>
            <Section title="6. भुगतान स्क्रीनशॉट">
              <p>भुगतान स्क्रीनशॉट केवल भुगतान सत्यापन के उद्देश्य से एकत्र किए जाते हैं। सत्यापन के बाद इन्हें सुरक्षित रूप से संग्रहीत किया जाता है और केवल अधिकृत प्रशासक ही इन तक पहुंच सकते हैं।</p>
            </Section>
            <Section title="7. आपके अधिकार">
              <p>आप किसी भी समय अपनी जानकारी को अपडेट या हटाने का अनुरोध कर सकते हैं। इसके लिए हमसे हमारे फेसबुक पेज या वेबसाइट के माध्यम से संपर्क करें।</p>
            </Section>
            <Section title="8. संपर्क">
              <p>गोपनीयता से संबंधित किसी भी प्रश्न के लिए कृपया हमसे संपर्क करें:</p>
              <p style={{ marginTop: 8 }}>📧 श्री दत्तराज गुरुमाऊली<br/>🌐 shreedattarajgurumauli.com<br/>📱 Facebook: facebook.com/shreedattarajgurumauli</p>
            </Section>
          </>
        ) : (
          <>
            <Section title="1. Introduction">
              <p>Shree Dattaraj Gurumauli (shreedattarajgurumauli.com) respects your privacy. This policy explains how we collect, use, and protect your personal information when you use our puja registration services.</p>
            </Section>
            <Section title="2. Information We Collect">
              <p>During puja registration, we collect: full name, phone number, email address (optional), gotra (optional), number of family members, preferred puja date, and payment screenshots.</p>
            </Section>
            <Section title="3. How We Use Your Information">
              <p>Your information is used solely for: confirming and coordinating puja registrations, verifying payments, sending puja-related updates and notifications, and contact by temple coordinators.</p>
            </Section>
            <Section title="4. Data Security">
              <p>Your information is stored on secure cloud servers. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, or destruction.</p>
            </Section>
            <Section title="5. Information Sharing">
              <p>We do not sell, rent, or share your personal information with third parties. Information may only be shared with relevant temple administration for puja coordination purposes.</p>
            </Section>
            <Section title="6. Payment Screenshots">
              <p>Payment screenshots are collected solely for payment verification purposes. After verification, they are stored securely and accessible only to authorized administrators.</p>
            </Section>
            <Section title="7. Your Rights">
              <p>You may request to update or delete your information at any time. Please contact us through our Facebook page or website to make such requests.</p>
            </Section>
            <Section title="8. Contact Us">
              <p>For any privacy-related questions, please contact us:</p>
              <p style={{ marginTop: 8 }}>📧 Shree Dattaraj Gurumauli<br/>🌐 shreedattarajgurumauli.com<br/>📱 Facebook: facebook.com/shreedattarajgurumauli</p>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Terms of Service ───
export function TermsPage() {
  const [lang, setLang] = useState("hi");
  const updated = "15 मई 2026 / May 15, 2026";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "0 0 6px" }}>📋 {lang === "hi" ? "सेवा की शर्तें" : "Terms of Service"}</h2>
      <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: "0 0 20px" }}>Last updated / अंतिम अपडेट: {updated}</p>
      <LangToggle lang={lang} setLang={setLang} />

      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", border: `1px solid ${C.border}` }}>
        {lang === "hi" ? (
          <>
            <Section title="1. सेवा का विवरण">
              <p>श्री दत्तराज गुरुमाऊली विभिन्न मंदिरों में पूजा और धार्मिक अनुष्ठानों के लिए ऑनलाइन पंजीकरण सुविधा प्रदान करती है। यह सेवा वेबसाइट और व्हाट्सएप बॉट के माध्यम से उपलब्ध है।</p>
            </Section>
            <Section title="2. पंजीकरण">
              <p>पूजा पंजीकरण के लिए सटीक और सही जानकारी देना अनिवार्य है। गलत जानकारी देने पर पंजीकरण रद्द किया जा सकता है। पंजीकरण की पुष्टि हमारे समन्वयक द्वारा भुगतान सत्यापन के बाद की जाती है।</p>
            </Section>
            <Section title="3. भुगतान">
              <p>पूजा शुल्क UPI या बैंक ट्रांसफर के माध्यम से भुगतान किया जा सकता है। भुगतान के बाद स्क्रीनशॉट अपलोड करना आवश्यक है। भुगतान सत्यापन के बाद ही पंजीकरण की पुष्टि होती है।</p>
            </Section>
            <Section title="4. पूजा समय और तिथि">
              <p>पूजा की तिथि और समय मंदिर की उपलब्धता और पुजारी की सुविधा के अनुसार निर्धारित किया जाता है। हम आपकी पसंदीदा तिथि का सम्मान करने का प्रयास करते हैं, लेकिन परिस्थितियों के अनुसार बदलाव संभव है।</p>
            </Section>
            <Section title="5. रद्दीकरण">
              <p>पूजा तिथि से 48 घंटे पहले रद्दीकरण अनुरोध किया जा सकता है। रद्दीकरण की स्थिति में प्रशासनिक शुल्क कटौती के बाद शेष राशि वापस की जाएगी। पूजा तिथि के 48 घंटे के भीतर रद्दीकरण पर कोई वापसी नहीं होगी।</p>
            </Section>
            <Section title="6. हमारा दायित्व">
              <p>हम पूजा का उचित और विधिपूर्वक आयोजन सुनिश्चित करने का प्रयास करते हैं। हालांकि, प्राकृतिक आपदा, मंदिर प्रशासन के निर्णय या अन्य अनियंत्रित परिस्थितियों के कारण पूजा में बदलाव या रद्दीकरण के लिए हम उत्तरदायी नहीं हैं।</p>
            </Section>
            <Section title="7. व्यवहार संहिता">
              <p>भक्तों से अपेक्षा है कि वे मंदिर परिसर में शालीन व्यवहार करें, मंदिर के नियमों का पालन करें, और अन्य भक्तों के प्रति सम्मान रखें।</p>
            </Section>
            <Section title="8. शर्तों में बदलाव">
              <p>हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं। कोई भी बदलाव वेबसाइट पर प्रकाशित किया जाएगा।</p>
            </Section>
          </>
        ) : (
          <>
            <Section title="1. Service Description">
              <p>Shree Dattaraj Gurumauli provides online registration facility for pujas and religious rituals at various temples. This service is available through our website and WhatsApp bot.</p>
            </Section>
            <Section title="2. Registration">
              <p>Accurate and correct information is mandatory for puja registration. Registration may be cancelled if incorrect information is provided. Registration is confirmed by our coordinator after payment verification.</p>
            </Section>
            <Section title="3. Payment">
              <p>Puja fees can be paid via UPI or bank transfer. Uploading a payment screenshot after payment is required. Registration is confirmed only after payment verification.</p>
            </Section>
            <Section title="4. Puja Date and Time">
              <p>Puja date and time are determined based on temple availability and priest convenience. We try to honor your preferred date, but changes may occur based on circumstances.</p>
            </Section>
            <Section title="5. Cancellation">
              <p>Cancellation requests can be made up to 48 hours before the puja date. In case of cancellation, the remaining amount will be refunded after deducting administrative charges. No refund for cancellations within 48 hours of the puja date.</p>
            </Section>
            <Section title="6. Our Liability">
              <p>We strive to ensure proper and ritualistic conduct of pujas. However, we are not liable for changes or cancellations due to natural disasters, temple administration decisions, or other uncontrollable circumstances.</p>
            </Section>
            <Section title="7. Code of Conduct">
              <p>Devotees are expected to maintain decorum in temple premises, follow temple rules, and show respect towards other devotees.</p>
            </Section>
            <Section title="8. Changes to Terms">
              <p>We may update these terms from time to time. Any changes will be published on our website.</p>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Refund Policy ───
export function RefundPolicyPage() {
  const [lang, setLang] = useState("hi");
  const updated = "15 मई 2026 / May 15, 2026";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "0 0 6px" }}>💰 {lang === "hi" ? "वापसी नीति" : "Refund Policy"}</h2>
      <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: "0 0 20px" }}>Last updated / अंतिम अपडेट: {updated}</p>
      <LangToggle lang={lang} setLang={setLang} />

      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", border: `1px solid ${C.border}` }}>
        {lang === "hi" ? (
          <>
            <Section title="1. वापसी की पात्रता">
              <p>पूजा तिथि से 48 घंटे पहले रद्दीकरण अनुरोध करने पर आप धनवापसी के पात्र हैं। 48 घंटे के भीतर किए गए रद्दीकरण पर कोई धनवापसी नहीं होगी।</p>
            </Section>
            <Section title="2. वापसी प्रक्रिया">
              <p>धनवापसी के लिए हमसे फेसबुक पेज या व्हाट्सएप के माध्यम से संपर्क करें। अपना पंजीकरण विवरण और भुगतान जानकारी प्रदान करें। सत्यापन के बाद 7-10 कार्य दिवसों में धनवापसी की जाएगी।</p>
            </Section>
            <Section title="3. प्रशासनिक शुल्क">
              <p>धनवापसी पर 10% प्रशासनिक शुल्क काटा जाएगा। शेष 90% राशि आपके मूल भुगतान माध्यम (UPI/बैंक खाता) में वापस की जाएगी।</p>
            </Section>
            <Section title="4. अपवाद">
              <p>यदि पूजा हमारी ओर से रद्द की जाती है (प्राकृतिक आपदा, मंदिर प्रशासन का निर्णय आदि), तो पूर्ण धनवापसी बिना किसी कटौती के की जाएगी, या आपको वैकल्पिक तिथि पर पूजा का विकल्प दिया जाएगा।</p>
            </Section>
            <Section title="5. संपर्क">
              <p>धनवापसी संबंधी किसी भी प्रश्न के लिए संपर्क करें:</p>
              <p style={{ marginTop: 8 }}>🌐 shreedattarajgurumauli.com<br/>📱 Facebook: facebook.com/shreedattarajgurumauli</p>
            </Section>
          </>
        ) : (
          <>
            <Section title="1. Refund Eligibility">
              <p>You are eligible for a refund if the cancellation request is made at least 48 hours before the puja date. No refund will be provided for cancellations made within 48 hours of the puja date.</p>
            </Section>
            <Section title="2. Refund Process">
              <p>To request a refund, contact us through our Facebook page or WhatsApp. Provide your registration details and payment information. Refund will be processed within 7-10 business days after verification.</p>
            </Section>
            <Section title="3. Administrative Charges">
              <p>A 10% administrative charge will be deducted from the refund amount. The remaining 90% will be returned to your original payment method (UPI/bank account).</p>
            </Section>
            <Section title="4. Exceptions">
              <p>If the puja is cancelled from our side (natural disaster, temple administration decision, etc.), a full refund without any deduction will be provided, or you will be offered an alternative date for the puja.</p>
            </Section>
            <Section title="5. Contact">
              <p>For any refund-related queries, please contact:</p>
              <p style={{ marginTop: 8 }}>🌐 shreedattarajgurumauli.com<br/>📱 Facebook: facebook.com/shreedattarajgurumauli</p>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Contact Page ───
export function ContactPage() {
  const [lang, setLang] = useState("hi");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.message) {
      alert(lang === "hi" ? "कृपया नाम और संदेश भरें" : "Please fill name and message");
      return;
    }
    // Open WhatsApp with pre-filled message
    const text = `🙏 संपर्क / Contact\n\nनाम: ${form.name}\n📱: ${form.phone || "—"}\n📧: ${form.email || "—"}\n\nसंदेश:\n${form.message}`;
    window.open(`https://wa.me/919930363756?text=${encodeURIComponent(text)}`, "_blank");
    setSent(true);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "0 0 8px" }}>📞 {lang === "hi" ? "संपर्क करें" : "Contact Us"}</h2>
        <p style={{ fontFamily: sansFont, fontSize: 15, color: C.light }}>{lang === "hi" ? "हमसे जुड़ें — हम आपकी सेवा में तत्पर हैं" : "We're here to help — reach out to us"}</p>
      </div>
      <LangToggle lang={lang} setLang={setLang} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        {[
          { icon: "📱", title: lang === "hi" ? "व्हाट्सएप" : "WhatsApp", detail: "+91 99303 63756", link: "https://wa.me/919930363756?text=🙏 नमस्कार" },
          { icon: "📘", title: "Facebook", detail: "Shree Dattaraj Gurumauli", link: "https://www.facebook.com/shreedattarajgurumauli" },
          { icon: "🌐", title: lang === "hi" ? "वेबसाइट" : "Website", detail: "shreedattarajgurumauli.com", link: "https://shreedattarajgurumauli.com" },
          { icon: "📧", title: lang === "hi" ? "ईमेल" : "Email", detail: "info@shreedattarajgurumauli.com", link: "mailto:info@shreedattarajgurumauli.com" },
        ].map(item => (
          <a key={item.title} href={item.link} target="_blank" rel="noopener noreferrer"
            style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}`, textDecoration: "none", display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.saffron; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <div>
              <h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, color: C.dark, margin: "0 0 2px" }}>{item.title}</h4>
              <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: 0 }}>{item.detail}</p>
            </div>
          </a>
        ))}
      </div>

      {!sent ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", border: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: font, fontSize: 20, color: C.saffron, margin: "0 0 18px" }}>✉️ {lang === "hi" ? "संदेश भेजें" : "Send a Message"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>{lang === "hi" ? "नाम" : "Name"} *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={lang === "hi" ? "आपका नाम" : "Your name"} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{lang === "hi" ? "फ़ोन" : "Phone"}</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" style={inputStyle} type="tel" />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{lang === "hi" ? "ईमेल" : "Email"}</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" style={inputStyle} type="email" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>{lang === "hi" ? "संदेश" : "Message"} *</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder={lang === "hi" ? "आपका संदेश लिखें..." : "Write your message..."} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <button onClick={handleSubmit}
            style={{ fontFamily: sansFont, fontSize: 15, fontWeight: 700, padding: "13px 32px", borderRadius: 10, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {lang === "hi" ? "व्हाट्सएप पर भेजें" : "Send via WhatsApp"}
          </button>
          <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, marginTop: 10 }}>{lang === "hi" ? "यह संदेश व्हाट्सएप के माध्यम से भेजा जाएगा" : "This will send your message via WhatsApp"}</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, padding: "40px 32px", border: `1px solid ${C.border}`, textAlign: "center" }}>
          <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>✅</span>
          <h3 style={{ fontFamily: font, fontSize: 22, color: C.maroon, margin: "0 0 8px" }}>{lang === "hi" ? "धन्यवाद!" : "Thank You!"}</h3>
          <p style={{ fontFamily: sansFont, fontSize: 15, color: C.mid, margin: "0 0 20px" }}>{lang === "hi" ? "आपका संदेश व्हाट्सएप पर भेजा गया। हम जल्द ही आपसे संपर्क करेंगे।" : "Your message was sent via WhatsApp. We'll get back to you soon."}</p>
          <button onClick={() => setSent(false)} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, padding: "10px 24px", borderRadius: 10, border: `2px solid ${C.saffron}`, cursor: "pointer", background: "transparent", color: C.saffron }}>{lang === "hi" ? "एक और संदेश भेजें" : "Send Another Message"}</button>
        </div>
      )}

      <div style={{ background: `linear-gradient(135deg, ${C.maroon}, ${C.saffronDark})`, borderRadius: 16, padding: "24px 28px", marginTop: 28, color: "#fff", textAlign: "center" }}>
        <p style={{ fontFamily: font, fontSize: 16, color: C.gold, margin: "0 0 6px" }}>🙏 श्री दत्तराज गुरुमाऊली</p>
        <p style={{ fontFamily: sansFont, fontSize: 13, opacity: 0.8, margin: 0 }}>{lang === "hi" ? "भक्तों की सेवा में सदैव तत्पर" : "Always at the service of devotees"}</p>
      </div>
    </div>
  );
}

// ─── Footer Links Component ───
export function LegalFooterLinks({ dispatch }) {
  const linkStyle = { fontFamily: sansFont, fontSize: 12, color: C.light, textDecoration: "none", cursor: "pointer", borderBottom: `1px dotted ${C.border}` };
  return (
    <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
      <span onClick={() => dispatch({ type: "SET_VIEW", payload: "privacy" })} style={linkStyle}>गोपनीयता नीति / Privacy</span>
      <span style={{ color: C.border }}>|</span>
      <span onClick={() => dispatch({ type: "SET_VIEW", payload: "terms" })} style={linkStyle}>शर्तें / Terms</span>
      <span style={{ color: C.border }}>|</span>
      <span onClick={() => dispatch({ type: "SET_VIEW", payload: "refund" })} style={linkStyle}>वापसी / Refund</span>
    </div>
  );
}
