import { useState, useEffect } from "react";
import { useLang } from "./LangContext.jsx";

const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4", success: "#2d7a4f", successBg: "#e8f5ee", pending: "#b8860b", pendingBg: "#fff8e1", cancelled: "#c0392b", cancelledBg: "#fde8e8" };
const inputStyle = { fontFamily: sansFont, fontSize: 14, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, width: "100%", boxSizing: "border-box", outline: "none", color: C.dark, background: "#fff" };
const labelStyle = { fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" };

// ─── Translations for devotee dashboard ───
const dt = {
  myBookings: { en: "📋 My Bookings", hi: "📋 मेरी बुकिंग", mr: "📋 माझ्या बुकिंग्ज" },
  trackSubtitle: { en: "Track your puja registrations and upcoming schedules", hi: "अपनी पूजा पंजीकरण और आगामी कार्यक्रम देखें", mr: "तुमच्या पूजा नोंदणी आणि आगामी वेळापत्रक पहा" },
  enterPhone: { en: "Enter your registered phone number", hi: "अपना पंजीकृत फ़ोन नंबर दर्ज करें", mr: "तुमचा नोंदणीकृत फोन नंबर प्रविष्ट करा" },
  enterPin: { en: "Enter your 4-digit PIN", hi: "अपना 4 अंकों का पिन दर्ज करें", mr: "तुमचा 4 अंकी पिन प्रविष्ट करा" },
  viewBookings: { en: "View My Bookings", hi: "मेरी बुकिंग देखें", mr: "माझ्या बुकिंग्ज पहा" },
  noBookings: { en: "No bookings found for this phone number.", hi: "इस फ़ोन नंबर के लिए कोई बुकिंग नहीं मिली।", mr: "या फोन नंबरसाठी कोणतीही बुकिंग सापडली नाही." },
  upcoming: { en: "🔔 Upcoming Pujas", hi: "🔔 आगामी पूजाएं", mr: "🔔 आगामी पूजा" },
  past: { en: "📜 Past Pujas", hi: "📜 पिछली पूजाएं", mr: "📜 मागील पूजा" },
  all: { en: "All", hi: "सभी", mr: "सर्व" },
  daysLeft: { en: "days left", hi: "दिन शेष", mr: "दिवस बाकी" },
  today: { en: "Today!", hi: "आज!", mr: "आज!" },
  tomorrow: { en: "Tomorrow", hi: "कल", mr: "उद्या" },
  completed: { en: "Completed", hi: "संपन्न", mr: "पूर्ण" },
  logout: { en: "← Change Number", hi: "← नंबर बदलें", mr: "← नंबर बदला" },
  welcome: { en: "Welcome back", hi: "पुनः स्वागत है", mr: "पुन्हा स्वागत" },
  phone: { en: "Phone Number", hi: "फ़ोन नंबर", mr: "फोन नंबर" },
  pin: { en: "PIN", hi: "पिन", mr: "पिन" },
  checking: { en: "Checking...", hi: "जांच रहा है...", mr: "तपासत आहे..." },
  wrongPin: { en: "Incorrect PIN. Please try again.", hi: "गलत पिन। कृपया पुन्हा प्रयास करें।", mr: "चुकीचा पिन. कृपया पुन्हा प्रयत्न करा." },
  setPin: { en: "Set a 4-digit PIN for future access", hi: "भविष्य की पहुंच के लिए 4 अंकों का पिन सेट करें", mr: "भविष्यातील प्रवेशासाठी 4 अंकी पिन सेट करा" },
  pinSaved: { en: "PIN saved!", hi: "पिन सेव हो गया!", mr: "पिन सेव झाला!" },
  savePin: { en: "Save PIN", hi: "पिन सेव करें", mr: "पिन सेव करा" },
  skipPin: { en: "Skip for now", hi: "अभी छोड़ें", mr: "आता सोडा" },
  firstTime: { en: "First time? Enter your phone number to find your bookings.", hi: "पहली बार? अपनी बुकिंग खोजने के लिए फ़ोन नंबर दर्ज करें।", mr: "पहिल्यांदा? तुमच्या बुकिंग्ज शोधण्यासाठी फोन नंबर प्रविष्ट करा." },
  bookingId: { en: "Booking ID", hi: "बुकिंग आईडी", mr: "बुकिंग आयडी" },
};

function t(key, lang) {
  return dt[key]?.[lang] || dt[key]?.["en"] || key;
}

function StatusBadge({ status, lang }) {
  const labels = {
    confirmed: { en: "✓ Confirmed", hi: "✓ पुष्टि", mr: "✓ पुष्टी" },
    pending: { en: "⏳ Pending", hi: "⏳ लंबित", mr: "⏳ प्रलंबित" },
    cancelled: { en: "✗ Cancelled", hi: "✗ रद्द", mr: "✗ रद्द" },
  };
  const colors = { confirmed: { bg: C.successBg, c: C.success }, pending: { bg: C.pendingBg, c: C.pending }, cancelled: { bg: C.cancelledBg, c: C.cancelled } };
  const s = colors[status] || colors.pending;
  const label = labels[status]?.[lang] || labels[status]?.["en"] || status;
  return <span style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: s.bg, color: s.c }}>{label}</span>;
}

function getDaysUntil(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const pujaDate = new Date(dateStr); pujaDate.setHours(0,0,0,0);
  return Math.ceil((pujaDate - today) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr, lang) {
  const locale = lang === "en" ? "en-IN" : "hi-IN";
  return new Date(dateStr).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", weekday: "long" });
}

// ─── Booking Card ───
function BookingCard({ reg, temples, lang, isUpcoming }) {
  const [expanded, setExpanded] = useState(false);
  const temple = temples.find(tm => tm.id === reg.templeId);
  const pujaIds = reg.pujaIds || [];
  const bookedPujas = temple ? temple.pujas.filter(p => pujaIds.includes(p.id)) : [];
  const totalAmount = bookedPujas.reduce((s, p) => s + p.price, 0) * (reg.members || 1);
  const daysLeft = getDaysUntil(reg.date);

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${isUpcoming && daysLeft <= 3 ? C.gold : C.border}`, overflow: "hidden", transition: "all 0.2s", boxShadow: isUpcoming && daysLeft <= 1 ? `0 0 0 2px ${C.gold}` : "none" }}>
      {/* Header */}
      <div onClick={() => setExpanded(!expanded)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h4 style={{ fontFamily: font, fontSize: 16, color: C.dark, margin: "0 0 4px" }}>
            {temple?.name || "—"}
          </h4>
          <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: 0 }}>
            {bookedPujas.map(p => p.name).join(", ") || "—"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {isUpcoming && (
            <span style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: daysLeft <= 0 ? C.saffronLight : C.goldLight, color: daysLeft <= 0 ? C.saffron : C.gold }}>
              {daysLeft <= 0 ? t("today", lang) : daysLeft === 1 ? t("tomorrow", lang) : `${daysLeft} ${t("daysLeft", lang)}`}
            </span>
          )}
          {!isUpcoming && <span style={{ fontFamily: sansFont, fontSize: 11, color: C.light }}>{t("completed", lang)}</span>}
          <StatusBadge status={reg.status} lang={lang} />
          <span style={{ fontSize: 12, color: C.light }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
          {/* Date & Time */}
          <div style={{ marginTop: 16, padding: "14px 18px", background: isUpcoming ? C.saffronLight : C.cream, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>📅 {lang === "hi" ? "तिथि" : lang === "mr" ? "तारीख" : "Date"}</p>
              <p style={{ fontFamily: font, fontSize: 16, color: C.dark, margin: 0, fontWeight: 600 }}>{formatDate(reg.date, lang)}</p>
            </div>
            {reg.time && (
              <div>
                <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>🕐 {lang === "hi" ? "समय" : lang === "mr" ? "वेळ" : "Time"}</p>
                <p style={{ fontFamily: sansFont, fontSize: 16, color: C.dark, margin: 0, fontWeight: 600 }}>{reg.time}</p>
              </div>
            )}
            <div>
              <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>👨‍👩‍👧‍👦 {lang === "hi" ? "सदस्य" : lang === "mr" ? "सदस्य" : "Members"}</p>
              <p style={{ fontFamily: sansFont, fontSize: 16, color: C.dark, margin: 0, fontWeight: 600 }}>{reg.members || 1}</p>
            </div>
          </div>

          {/* Pujas Breakdown */}
          <div style={{ marginTop: 14, padding: "14px 18px", background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: sansFont, fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: C.maroon, marginBottom: 8 }}>🪔 {lang === "hi" ? "पूजाएं" : lang === "mr" ? "पूजा" : "Pujas"}</div>
            {bookedPujas.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: C.mid }}>
                <span>{p.name} <span style={{ color: C.light }}>({p.duration})</span></span>
                <span style={{ fontWeight: 600 }}>₹{p.price}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.light }}>× {reg.members || 1} {lang === "hi" ? "सदस्य" : lang === "mr" ? "सदस्य" : "members"}</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: C.saffron }}>₹{totalAmount}</span>
            </div>
          </div>

          {/* Other Details */}
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {reg.gotra && <div><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>📿 {lang === "hi" ? "गोत्र" : "Gotra"}</p><p style={{ fontFamily: sansFont, fontSize: 14, color: C.dark, margin: 0, fontWeight: 500 }}>{reg.gotra}</p></div>}
            <div><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>{t("bookingId", lang)}</p><p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: 0, fontFamily: "monospace" }}>{reg.id}</p></div>
          </div>

          {/* Payment Status */}
          {reg.status === "pending" && (
            <div style={{ marginTop: 14, padding: "12px 16px", background: C.pendingBg, borderRadius: 10, fontFamily: sansFont, fontSize: 13, color: C.pending }}>
              ⏳ {lang === "hi" ? "भुगतान सत्यापन लंबित है। हमारा समन्वयक जल्द संपर्क करेंगे।" : lang === "mr" ? "पेमेंट सत्यापन प्रलंबित आहे. आमचे समन्वयक लवकरच संपर्क करतील." : "Payment verification pending. Our coordinator will contact you soon."}
            </div>
          )}
          {reg.status === "confirmed" && isUpcoming && (
            <div style={{ marginTop: 14, padding: "12px 16px", background: C.successBg, borderRadius: 10, fontFamily: sansFont, fontSize: 13, color: C.success }}>
              ✅ {lang === "hi" ? "आपकी पूजा की पुष्टि हो गई है। कृपया समय पर मंदिर पहुंचें।" : lang === "mr" ? "तुमच्या पूजेची पुष्टी झाली आहे. कृपया वेळेवर मंदिरात पोहोचा." : "Your puja is confirmed. Please reach the temple on time."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Devotee Dashboard ───
export function DevoteeDashboard({ temples, fetchDevoteeBookings }) {
  const { lang } = useLang();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showSetPin, setShowSetPin] = useState(false);
  const [newPin, setNewPin] = useState("");

  const handleLookup = async () => {
    if (!phone || phone.length < 10) { setError(lang === "hi" ? "कृपया 10 अंकों का फ़ोन नंबर दर्ज करें" : "Please enter a 10-digit phone number"); return; }
    setLoading(true); setError("");
    try {
      const results = await fetchDevoteeBookings(phone.replace(/\D/g, "").slice(-10));
      if (results.length === 0) {
        setError(t("noBookings", lang));
      } else {
        // Map to app format
        const mapped = results.map(r => ({
          id: r.id,
          devoteeName: r.devotee_name,
          phone: r.phone,
          email: r.email,
          gotra: r.gotra,
          templeId: r.temple_id,
          pujaIds: r.puja_ids,
          date: r.date,
          time: r.time,
          members: r.members,
          paymentScreenshot: r.payment_screenshot,
          status: r.status,
          createdAt: r.created_at,
          pin: r.pin,
        }));
        setBookings(mapped);
        setLoggedIn(true);
        // Check if PIN is set
        if (!mapped[0].pin) {
          setShowSetPin(true);
        }
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setBookings(null);
    setPhone("");
    setPin("");
    setError("");
  };

  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = bookings ? bookings.filter(b => new Date(b.date) >= today && b.status !== "cancelled").sort((a,b) => new Date(a.date) - new Date(b.date)) : [];
  const past = bookings ? bookings.filter(b => new Date(b.date) < today || b.status === "cancelled").sort((a,b) => new Date(b.date) - new Date(a.date)) : [];
  const devoteeName = bookings?.[0]?.devoteeName || "";

  // ─── Login Screen ───
  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 440, margin: "40px auto", textAlign: "center" }}>
        <span style={{ fontSize: 56, display: "block", marginBottom: 16 }}>🙏</span>
        <h2 style={{ fontFamily: font, fontSize: 26, color: C.maroon, margin: "0 0 8px" }}>{t("myBookings", lang)}</h2>
        <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light, margin: "0 0 28px" }}>{t("trackSubtitle", lang)}</p>

        <div style={{ background: "#fff", borderRadius: 16, padding: "28px 28px", border: `1px solid ${C.border}`, textAlign: "left" }}>
          {error && <div style={{ fontFamily: sansFont, fontSize: 13, color: C.cancelled, background: C.cancelledBg, padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>⚠️ {error}</div>}

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{t("phone", lang)} *</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={t("enterPhone", lang)} style={inputStyle} type="tel" maxLength={10}
              onKeyDown={e => e.key === "Enter" && handleLookup()} />
          </div>

          <button onClick={handleLookup} disabled={loading}
            style={{ width: "100%", fontFamily: sansFont, fontSize: 15, fontWeight: 700, padding: "13px", borderRadius: 10, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff", opacity: loading ? 0.5 : 1 }}>
            {loading ? t("checking", lang) : t("viewBookings", lang)}
          </button>

          <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, marginTop: 14, textAlign: "center" }}>{t("firstTime", lang)}</p>
        </div>
      </div>
    );
  }

  // ─── Dashboard ───
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Welcome Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: font, fontSize: 26, color: C.maroon, margin: "0 0 4px" }}>{t("myBookings", lang)}</h2>
          <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light, margin: 0 }}>{t("welcome", lang)}, <strong style={{ color: C.dark }}>{devoteeName}</strong> 🙏</p>
        </div>
        <button onClick={handleLogout} style={{ fontFamily: sansFont, fontSize: 13, color: C.saffron, background: "none", border: `1.5px solid ${C.saffron}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}>{t("logout", lang)}</button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{ background: C.saffronLight, borderRadius: 12, padding: "16px 18px", textAlign: "center" }}>
          <p style={{ fontFamily: sansFont, fontSize: 24, fontWeight: 700, color: C.saffron, margin: 0 }}>{upcoming.length}</p>
          <p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: "4px 0 0" }}>{lang === "hi" ? "आगामी" : lang === "mr" ? "आगामी" : "Upcoming"}</p>
        </div>
        <div style={{ background: C.successBg, borderRadius: 12, padding: "16px 18px", textAlign: "center" }}>
          <p style={{ fontFamily: sansFont, fontSize: 24, fontWeight: 700, color: C.success, margin: 0 }}>{bookings.filter(b => b.status === "confirmed").length}</p>
          <p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: "4px 0 0" }}>{lang === "hi" ? "पुष्टि" : lang === "mr" ? "पुष्टी" : "Confirmed"}</p>
        </div>
        <div style={{ background: C.goldLight, borderRadius: 12, padding: "16px 18px", textAlign: "center" }}>
          <p style={{ fontFamily: sansFont, fontSize: 24, fontWeight: 700, color: C.gold, margin: 0 }}>{bookings.length}</p>
          <p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: "4px 0 0" }}>{lang === "hi" ? "कुल" : lang === "mr" ? "एकूण" : "Total"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[
          { key: "upcoming", label: t("upcoming", lang), count: upcoming.length },
          { key: "past", label: t("past", lang), count: past.length },
          { key: "all", label: t("all", lang), count: bookings.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${activeTab === tab.key ? C.saffron : C.border}`, cursor: "pointer", background: activeTab === tab.key ? C.saffronLight : "#fff", color: activeTab === tab.key ? C.saffron : C.mid }}>
            {tab.label} <span style={{ background: activeTab === tab.key ? C.saffron : C.border, color: activeTab === tab.key ? "#fff" : C.mid, borderRadius: 10, padding: "2px 8px", marginLeft: 6, fontSize: 11 }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {activeTab === "upcoming" && upcoming.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, background: C.cream, borderRadius: 12, fontFamily: sansFont, color: C.light }}>
            <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>📅</span>
            {lang === "hi" ? "कोई आगामी पूजा नहीं" : lang === "mr" ? "कोणतीही आगामी पूजा नाही" : "No upcoming pujas"}
          </div>
        )}
        {activeTab === "upcoming" && upcoming.map(b => <BookingCard key={b.id} reg={b} temples={temples} lang={lang} isUpcoming={true} />)}
        {activeTab === "past" && past.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, background: C.cream, borderRadius: 12, fontFamily: sansFont, color: C.light }}>
            <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>📜</span>
            {lang === "hi" ? "कोई पिछली पूजा नहीं" : lang === "mr" ? "कोणतीही मागील पूजा नाही" : "No past pujas"}
          </div>
        )}
        {activeTab === "past" && past.map(b => <BookingCard key={b.id} reg={b} temples={temples} lang={lang} isUpcoming={false} />)}
        {activeTab === "all" && bookings.map(b => {
          const isUp = new Date(b.date) >= today && b.status !== "cancelled";
          return <BookingCard key={b.id} reg={b} temples={temples} lang={lang} isUpcoming={isUp} />;
        })}
      </div>
    </div>
  );
}
