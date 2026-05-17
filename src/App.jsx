import { useState, useEffect, useReducer, useCallback } from "react";
import {
  fetchTemples, addTemple as dbAddTemple, updateTemple as dbUpdateTemple, deleteTemple as dbDeleteTemple,
  addPuja as dbAddPuja, deletePuja as dbDeletePuja,
  fetchRegistrations, addRegistration as dbAddRegistration, updateRegistrationStatus as dbUpdateStatus, deleteRegistration as dbDeleteRegistration,
  fetchDevoteeBookings,
  fetchSocialLinks, addSocialLink as dbAddSocial, updateSocialLink as dbUpdateSocial, deleteSocialLink as dbDeleteSocial,
  fetchBlogPosts, addBlogPost as dbAddPost, updateBlogPost as dbUpdatePost, deleteBlogPost as dbDeletePost,
  fetchPriests, addPriest as dbAddPriest, updatePriest as dbUpdatePriest, deletePriest as dbDeletePriest, assignPriestToRegistration as dbAssignPriest,
  signIn, signOut, getSession, onAuthChange,
} from "./supabase.js";
import { BlogPage, BlogPostView, BlogAdmin } from "./Blog.jsx";
import { PrivacyPolicyPage, TermsPage, RefundPolicyPage, LegalFooterLinks } from "./Legal.jsx";
import { DevoteeDashboard } from "./DevoteeDashboard.jsx";
import { PriestsAdmin, PriestAssignment } from "./Priests.jsx";
import { useLang, LangSwitcher } from "./LangContext.jsx";

// ─── Logo ───
const LOGO_SRC = "/logo.png";

// ─── State ───
const initialState = {
  temples: [], registrations: [], socialLinks: [], blogPosts: [], priests: [],
  view: "home", selectedTemple: null, selectedPujas: [],
  selectedPostId: null,
  adminTab: "registrations", editingTempleId: null,
  notification: null, loading: true, error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_DATA": return { ...state, temples: action.payload.temples, registrations: action.payload.registrations, socialLinks: action.payload.socialLinks || [], blogPosts: action.payload.blogPosts || [], priests: action.payload.priests || [], loading: false };
    case "SET_LOADING": return { ...state, loading: action.payload };
    case "SET_ERROR": return { ...state, error: action.payload, loading: false };
    case "SET_VIEW": return { ...state, view: action.payload, selectedPostId: null };
    case "SELECT_POST": return { ...state, selectedPostId: action.payload };
    case "SET_ADMIN_TAB": return { ...state, adminTab: action.payload, editingTempleId: null };
    case "SELECT_TEMPLE": return { ...state, selectedTemple: action.payload, selectedPujas: [] };
    case "TOGGLE_PUJA": {
      const ex = state.selectedPujas.includes(action.payload);
      return { ...state, selectedPujas: ex ? state.selectedPujas.filter(id => id !== action.payload) : [...state.selectedPujas, action.payload] };
    }
    case "SET_TEMPLES": return { ...state, temples: action.payload };
    case "SET_REGISTRATIONS": return { ...state, registrations: action.payload };
    case "SET_EDITING_TEMPLE": return { ...state, editingTempleId: action.payload, adminTab: action.payload ? "edit-temple" : "temples" };
    case "SET_NOTIFICATION": return { ...state, notification: action.payload };
    case "CLEAR_NOTIFICATION": return { ...state, notification: null };
    case "SUBMITTED": return { ...state, view: "success", selectedPujas: [], notification: "Registration submitted!" };
    default: return state;
  }
}

// ─── Styles ───
const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4", success: "#2d7a4f", successBg: "#e8f5ee", pending: "#b8860b", pendingBg: "#fff8e1", cancelled: "#c0392b", cancelledBg: "#fde8e8" };
const inputStyle = { fontFamily: sansFont, fontSize: 14, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, width: "100%", boxSizing: "border-box", outline: "none", color: C.dark, background: "#fff" };
const labelStyle = { fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" };

function getPujaNames(t, ids) { return t ? t.pujas.filter(p => ids.includes(p.id)).map(p => p.name) : []; }

// ─── Photo Upload ───
function PhotoUpload({ label, value, onChange, size = 120 }) {
  const handleFile = (e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = (ev) => onChange(ev.target.result); r.readAsDataURL(f); } };
  const uid = "photo_" + label.replace(/\s/g, "_") + Math.random().toString(36).slice(2, 6);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div onClick={() => document.getElementById(uid).click()} style={{ width: size, height: size, borderRadius: 14, border: `2px dashed ${value ? C.saffron : C.border}`, background: value ? "transparent" : C.cream, cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <input type="file" id={uid} accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        {value ? (<><img src={value} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /><div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "#fff", fontFamily: sansFont, fontSize: 10, textAlign: "center", padding: "4px 0" }}>Change</div></>) : (<div style={{ textAlign: "center" }}><span style={{ fontSize: 28, display: "block" }}>📷</span><span style={{ fontFamily: sansFont, fontSize: 11, color: C.light }}>Upload</span></div>)}
      </div>
      {value && <button onClick={(e) => { e.stopPropagation(); onChange(null); }} style={{ fontFamily: sansFont, fontSize: 11, color: C.cancelled, background: "none", border: "none", cursor: "pointer", marginTop: 4, padding: 0 }}>Remove photo</button>}
    </div>
  );
}

// ─── Temple Banner ───
function TempleBanner({ temple, height = 120, style: extra = {} }) {
  const photo = temple.templePhoto || temple.deityPhoto;
  if (photo) return (
    <div style={{ height, position: "relative", overflow: "hidden", ...extra }}>
      <img src={photo} alt={temple.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
      {temple.deityPhoto && temple.templePhoto && <div style={{ position: "absolute", bottom: 10, right: 10, width: 48, height: 48, borderRadius: 10, overflow: "hidden", border: "2px solid rgba(255,255,255,0.7)" }}><img src={temple.deityPhoto} alt="Deity" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
    </div>
  );
  return <div style={{ height, background: `linear-gradient(135deg, ${C.maroon}, ${C.saffronDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, ...extra }}>{temple.icon}</div>;
}

// ─── Notification ───
function Notification({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [message]);
  return <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, background: C.success, color: "#fff", padding: "14px 24px", borderRadius: 10, fontFamily: sansFont, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", animation: "slideIn 0.3s ease" }}>✓ {message}</div>;
}

// ─── Header ───
function Header({ state, dispatch, adminUser, onLogout }) {
  const { t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const publicNav = [{ label: t("navHome"), view: "home" }, { label: t("navRegister"), view: "register" }, { label: t("navMyBookings"), view: "my-bookings" }, { label: t("navBlog"), view: "blog" }, { label: t("navAbout"), view: "about" }];
  const adminNav = adminUser ? [{ label: "⚙️ Admin", view: "admin" }] : [];
  const nav = [...publicNav, ...adminNav];
  return (
    <header style={{ background: `linear-gradient(135deg, ${C.maroon} 0%, ${C.saffronDark} 50%, ${C.saffron} 100%)`, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }} onClick={() => { dispatch({ type: "SET_VIEW", payload: "home" }); dispatch({ type: "SELECT_TEMPLE", payload: null }); setMenuOpen(false); }}>
          <img src={LOGO_SRC} alt="Logo" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "contain", flexShrink: 0, background: "#fff", padding: 3 }} />
          <div>
            <h1 style={{ fontFamily: font, fontSize: 16, color: C.gold, margin: 0, whiteSpace: "nowrap" }}>{t("appName")}</h1>
            <p style={{ fontFamily: sansFont, fontSize: 9, color: "rgba(255,255,255,0.6)", margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>{t("appSubtitle")}</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {nav.map(n => <button key={n.view} onClick={() => { dispatch({ type: "SET_VIEW", payload: n.view }); if (n.view === "home") dispatch({ type: "SELECT_TEMPLE", payload: null }); }} style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: state.view === n.view ? "rgba(255,255,255,0.2)" : "transparent", color: state.view === n.view ? "#fff" : "rgba(255,255,255,0.75)", whiteSpace: "nowrap" }}>{n.label}</button>)}
          {!adminUser ? (
            <button onClick={() => dispatch({ type: "SET_VIEW", payload: "login" })} style={{ fontFamily: sansFont, fontSize: 11, fontWeight: 600, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.6)" }}>{t("navAdmin")}</button>
          ) : (
            <button onClick={onLogout} style={{ fontFamily: sansFont, fontSize: 11, fontWeight: 600, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.6)" }}>{t("navLogout")}</button>
          )}
          <LangSwitcher style={{ marginLeft: 4 }} />
        </div>

        {/* Mobile: Lang + Hamburger */}
        <div className="mobile-nav-toggle" style={{ display: "none", alignItems: "center", gap: 6 }}>
          <LangSwitcher />
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
              {menuOpen
                ? <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                : <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="mobile-menu" style={{ padding: "8px 16px 16px", display: "none", flexDirection: "column", gap: 4, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          {nav.map(n => (
            <button key={n.view} onClick={() => { dispatch({ type: "SET_VIEW", payload: n.view }); if (n.view === "home") dispatch({ type: "SELECT_TEMPLE", payload: null }); setMenuOpen(false); }}
              style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: state.view === n.view ? "rgba(255,255,255,0.2)" : "transparent", color: state.view === n.view ? "#fff" : "rgba(255,255,255,0.8)", textAlign: "left", width: "100%" }}>
              {n.label}
            </button>
          ))}
          {!adminUser ? (
            <button onClick={() => { dispatch({ type: "SET_VIEW", payload: "login" }); setMenuOpen(false); }} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.7)", textAlign: "left", width: "100%" }}>{t("navAdmin")}</button>
          ) : (
            <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.7)", textAlign: "left", width: "100%" }}>{t("navLogout")}</button>
          )}
        </div>
      )}
    </header>
  );
}

// ─── Admin Login ───
function AdminLogin({ dispatch, onLogin }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Enter email and password"); return; }
    setLoading(true); setError("");
    try {
      await signIn(email, password);
      onLogin();
      dispatch({ type: "SET_VIEW", payload: "admin" });
    } catch (e) {
      setError(e.message || "Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
      <h2 style={{ fontFamily: font, fontSize: 24, color: C.maroon, margin: "0 0 8px" }}>{t("loginTitle")}</h2>
      <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light, margin: "0 0 28px" }}>{t("loginSubtitle")}</p>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: `1px solid ${C.border}`, textAlign: "left" }}>
        {error && <div style={{ fontFamily: sansFont, fontSize: 13, color: C.cancelled, background: C.cancelledBg, padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>⚠️ {error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" style={inputStyle} type="email" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" style={inputStyle} type="password" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", fontFamily: sansFont, fontSize: 15, fontWeight: 700, padding: "13px", borderRadius: 10, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff", opacity: loading ? 0.5 : 1 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
      <button onClick={() => dispatch({ type: "SET_VIEW", payload: "home" })} style={{ fontFamily: sansFont, fontSize: 13, color: C.saffron, background: "none", border: "none", cursor: "pointer", marginTop: 16, fontWeight: 600 }}>← Back to Home</button>
    </div>
  );
}

// ─── Social Icons Map ───
const SOCIAL_ICONS = {
  facebook: { color: "#1877F2", svg: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>' },
  instagram: { color: "#E4405F", svg: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>' },
  youtube: { color: "#FF0000", svg: '<path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>' },
  twitter: { color: "#000000", svg: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' },
  whatsapp: { color: "#25D366", svg: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' },
  telegram: { color: "#0088CC", svg: '<path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>' },
  linkedin: { color: "#0A66C2", svg: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>' },
  website: { color: "#e8621e", svg: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>' },
};

function SocialIcon({ platform, size = 22 }) {
  const icon = SOCIAL_ICONS[platform] || SOCIAL_ICONS.website;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={icon.color} dangerouslySetInnerHTML={{ __html: icon.svg }} />;
}

// ─── About Page ───
function AboutPage({ socialLinks = [] }) {
  const { t } = useLang();
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 140, height: 140, margin: "0 auto 20px" }}><img src={LOGO_SRC} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>
        <h2 style={{ fontFamily: font, fontSize: 30, color: C.maroon, margin: "0 0 6px" }}>{t("appName")}</h2>
        <p style={{ fontFamily: font, fontSize: 18, color: C.gold, margin: "0 0 4px" }}>{t("aboutTitle")}</p>
        <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light }}>{t("aboutSubtitle")}</p>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", border: `1px solid ${C.border}`, marginBottom: 20 }}>
        <h3 style={{ fontFamily: font, fontSize: 20, color: C.saffron, margin: "0 0 14px" }}>{t("missionTitle")}</h3>
        <p style={{ fontFamily: sansFont, fontSize: 15, color: C.mid, lineHeight: 1.7, margin: "0 0 14px" }}>{t("missionText1")}</p>
        <p style={{ fontFamily: sansFont, fontSize: 15, color: C.mid, lineHeight: 1.7, margin: 0 }}>{t("missionText2")}</p>
      </div>
      {socialLinks.length > 0 && (
        <div style={{ background: `linear-gradient(135deg, ${C.maroon}, ${C.saffronDark})`, borderRadius: 16, padding: "28px 32px", marginBottom: 20, color: "#fff", textAlign: "center" }}>
          <h3 style={{ fontFamily: font, fontSize: 20, margin: "0 0 12px", color: C.gold }}>{t("connectTitle")}</h3>
          <p style={{ fontFamily: sansFont, fontSize: 14, opacity: 0.85, margin: "0 0 20px", lineHeight: 1.7 }}>{t("connectSubtitle")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {socialLinks.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 24px", borderRadius: 12, background: "#fff", color: C.maroon, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", transition: "transform 0.2s" }}>
                <SocialIcon platform={link.platform} />
                {link.label || link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Temple Card ───
function TempleCard({ temple, onSelect }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={() => onSelect(temple)}
      style={{ background: "#fff", borderRadius: 16, overflow: "hidden", cursor: "pointer", border: `1px solid ${h ? C.saffron : C.border}`, boxShadow: h ? "0 12px 36px rgba(232,98,30,0.12)" : "0 2px 12px rgba(0,0,0,0.04)", transition: "all 0.3s ease", transform: h ? "translateY(-4px)" : "none" }}>
      <TempleBanner temple={temple} height={140} />
      <div style={{ padding: "18px 20px" }}>
        <h3 style={{ fontFamily: font, fontSize: 17, color: C.dark, margin: "0 0 4px" }}>{temple.name}</h3>
        <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: "0 0 4px" }}>📍 {temple.location}</p>
        {temple.description && <p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: "0 0 10px", lineHeight: 1.5 }}>{temple.description}</p>}
        <div style={{ fontFamily: sansFont, fontSize: 12, color: C.saffron, fontWeight: 600, background: C.saffronLight, padding: "6px 12px", borderRadius: 20, display: "inline-block" }}>{temple.pujas.length} Puja{temple.pujas.length !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}

// ─── Puja Checkbox Card ───
function PujaCheckCard({ puja, selected, onToggle }) {
  return (
    <div onClick={onToggle} style={{ background: selected ? C.saffronLight : "#fff", borderRadius: 12, padding: "16px 20px", cursor: "pointer", border: `2px solid ${selected ? C.saffron : C.border}`, display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s" }}>
      <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, border: `2px solid ${selected ? C.saffron : C.border}`, background: selected ? C.saffron : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{selected && <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>✓</span>}</div>
      <div style={{ flex: 1, minWidth: 0 }}><h4 style={{ fontFamily: font, fontSize: 15, color: C.dark, margin: "0 0 3px" }}>{puja.name}</h4><p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: 0 }}>{puja.description}</p></div>
      <div style={{ textAlign: "right", flexShrink: 0 }}><span style={{ fontFamily: sansFont, fontSize: 16, fontWeight: 700, color: C.saffron }}>₹{puja.price}</span><br /><span style={{ fontFamily: sansFont, fontSize: 11, color: C.light }}>⏱ {puja.duration}</span></div>
    </div>
  );
}

// ─── Home Page ───
function HomePage({ state, dispatch }) {
  const { t } = useLang();
  const sel = state.selectedTemple ? state.temples.find(t => t.id === state.selectedTemple) : null;
  const cnt = state.selectedPujas.length;
  const total = sel ? sel.pujas.filter(p => state.selectedPujas.includes(p.id)).reduce((s, p) => s + p.price, 0) : 0;
  return (
    <div>
      {!sel ? (<>
        <div style={{ textAlign: "center", marginBottom: 32 }}><h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "0 0 8px" }}>{t("homeTitle")}</h2><p style={{ fontFamily: sansFont, fontSize: 15, color: C.light }}>{t("homeSubtitle")}</p></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>{state.temples.map(t => <TempleCard key={t.id} temple={t} onSelect={() => dispatch({ type: "SELECT_TEMPLE", payload: t.id })} />)}</div>
        {state.temples.length === 0 && !state.loading && <div style={{ textAlign: "center", padding: 60, color: C.light, fontFamily: sansFont }}><p style={{ fontSize: 48 }}>🛕</p><p>{t("noTemples")}</p></div>}
      </>) : (<>
        <button onClick={() => dispatch({ type: "SELECT_TEMPLE", payload: null })} style={{ fontFamily: sansFont, fontSize: 13, color: C.saffron, background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0, fontWeight: 600 }}>{t("backToTemples")}</button>
        <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 28 }}><TempleBanner temple={sel} height={180} /><div style={{ background: `linear-gradient(135deg, ${C.maroon}, ${C.saffronDark})`, padding: "20px 32px", color: "#fff" }}><h2 style={{ fontFamily: font, fontSize: 26, margin: "0 0 4px" }}>{sel.name}</h2><p style={{ fontFamily: sansFont, fontSize: 14, opacity: 0.8, margin: 0 }}>📍 {sel.location}</p></div></div>
        <h3 style={{ fontFamily: font, fontSize: 20, color: C.maroon, margin: "0 0 18px" }}>{t("selectPujasTitle")}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{sel.pujas.map(p => <PujaCheckCard key={p.id} puja={p} selected={state.selectedPujas.includes(p.id)} onToggle={() => dispatch({ type: "TOGGLE_PUJA", payload: p.id })} />)}</div>
        {cnt > 0 && <div style={{ position: "sticky", bottom: 16, marginTop: 24, background: "#fff", borderRadius: 14, padding: "16px 24px", border: `2px solid ${C.saffron}`, boxShadow: "0 -4px 24px rgba(232,98,30,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><span style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: C.dark }}>{cnt} Puja{cnt > 1 ? "s" : ""}</span><br /><span style={{ fontFamily: sansFont, fontSize: 12, color: C.light }}>{getPujaNames(sel, state.selectedPujas).join(", ")}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><span style={{ fontFamily: sansFont, fontSize: 20, fontWeight: 700, color: C.saffron }}>₹{total}</span><button onClick={() => dispatch({ type: "SET_VIEW", payload: "register" })} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "11px 28px", borderRadius: 10, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff" }}>Proceed →</button></div>
        </div>}
      </>)}
    </div>
  );
}

// ─── UPI Config ───
const UPI_ID = "shreedattarajgurumauli@kotak";
const UPI_NAME = "Shree Dattaraj Gurumauli";

// ─── UPI QR Code Generator (SVG-based, no external dependency) ───
function UpiQrCode({ amount, size = 200 }) {
  const { t } = useLang();
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("Puja Registration")}`;

  // Generate QR using a canvas-free approach via external API (reliable, no dependencies)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiUrl)}&margin=8`;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: `2px solid ${C.gold}`, display: "inline-block" }}>
        <img src={qrImageUrl} alt="UPI QR Code" width={size} height={size} style={{ borderRadius: 8, display: "block" }} />
        <div style={{ marginTop: 12 }}>
          <p style={{ fontFamily: sansFont, fontSize: 18, fontWeight: 700, color: C.saffron, margin: "0 0 4px" }}>₹{amount}</p>
          <p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: "0 0 2px" }}>{t("scanWithUpi")}</p>
          <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: 0 }}>GPay • PhonePe • Paytm • BHIM</p>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: "0 0 4px" }}>{t("payToUpi")}</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.cream, padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}` }}>
          <span style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: C.dark }}>{UPI_ID}</span>
          <button onClick={() => { navigator.clipboard.writeText(UPI_ID); }} style={{ fontFamily: sansFont, fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", color: C.saffron, cursor: "pointer", fontWeight: 600 }}>{t("copy")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Registration Form ───
function RegistrationForm({ state, dispatch, onRefresh }) {
  const { t } = useLang();
  const [form, setForm] = useState({ devoteeName: "", phone: "", email: "", gotra: "", templeId: state.selectedTemple || "", pujaIds: [...state.selectedPujas], date: "", time: "", members: 1, paymentScreenshot: null, screenshotName: "" });
  const [saving, setSaving] = useState(false);
  const temple = state.temples.find(t => t.id === form.templeId);
  const selPujas = temple ? temple.pujas.filter(p => form.pujaIds.includes(p.id)) : [];
  const grandTotal = selPujas.reduce((s, p) => s + p.price, 0) * form.members;
  const togglePuja = (id) => setForm(f => ({ ...f, pujaIds: f.pujaIds.includes(id) ? f.pujaIds.filter(x => x !== id) : [...f.pujaIds, id] }));

  const handleSubmit = async () => {
    if (!form.devoteeName || !form.phone || !form.templeId || form.pujaIds.length === 0 || !form.date) { alert(t("fillRequired")); return; }
    setSaving(true);
    try {
      await dbAddRegistration({ id: "r" + Date.now(), ...form });
      await onRefresh();
      dispatch({ type: "SUBMITTED" });
    } catch (e) { alert("Error: " + e.message); }
    setSaving(false);
  };

  const handleFile = (e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setForm(fm => ({ ...fm, paymentScreenshot: ev.target.result, screenshotName: f.name })); r.readAsDataURL(f); } };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}><h2 style={{ fontFamily: font, fontSize: 26, color: C.maroon, margin: "0 0 6px" }}>{t("regTitle")}</h2></div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
        <div style={{ marginBottom: 24, padding: "18px 20px", background: C.saffronLight, borderRadius: 12 }}>
          <h3 style={{ fontFamily: font, fontSize: 16, color: C.saffron, margin: "0 0 14px" }}>{t("templeAndPujas")}</h3>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>{t("temple")} *</label><select value={form.templeId} onChange={e => setForm(f => ({ ...f, templeId: e.target.value, pujaIds: [] }))} style={{ ...inputStyle, cursor: "pointer" }}><option value="">{t("selectTemple")}</option>{state.temples.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          {temple && <div><label style={{ ...labelStyle, marginBottom: 10 }}>{t("selectPujas")} * <span style={{ fontWeight: 400, color: C.light }}>{t("pickOneOrMore")}</span></label><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{temple.pujas.map(p => { const ck = form.pujaIds.includes(p.id); return (<div key={p.id} onClick={() => togglePuja(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, cursor: "pointer", background: ck ? "#fff" : "#fefcfa", border: `1.5px solid ${ck ? C.saffron : C.border}` }}><div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `2px solid ${ck ? C.saffron : C.border}`, background: ck ? C.saffron : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{ck && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}</div><div style={{ flex: 1 }}><span style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: C.dark }}>{p.name}</span></div><span style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, color: C.saffron }}>₹{p.price}</span></div>); })}</div></div>}
          {selPujas.length > 0 && <div style={{ marginTop: 14, padding: "14px 16px", background: "#fff", borderRadius: 10, border: `1px solid ${C.gold}`, fontFamily: sansFont, fontSize: 13 }}><div style={{ fontWeight: 700, color: C.maroon, marginBottom: 6 }}>{t("bookingSummary")}</div>{selPujas.map(p => <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: C.mid }}><span>{p.name}</span><span>₹{p.price}</span></div>)}<div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}><span style={{ color: C.light }}>× {form.members} {t("member")}</span><span style={{ fontWeight: 700, fontSize: 16, color: C.saffron }}>{t("total")}: ₹{grandTotal}</span></div></div>}
        </div>
        <div style={{ marginBottom: 24 }}><h3 style={{ fontFamily: font, fontSize: 16, color: C.saffron, margin: "0 0 14px" }}>{t("devoteeDetails")}</h3><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><div><label style={labelStyle}>{t("fullName")} *</label><input value={form.devoteeName} onChange={e => setForm(f => ({ ...f, devoteeName: e.target.value }))} placeholder={t("enterFullName")} style={inputStyle} /></div><div><label style={labelStyle}>{t("gotra")}</label><input value={form.gotra} onChange={e => setForm(f => ({ ...f, gotra: e.target.value }))} placeholder={t("egGotra")} style={inputStyle} /></div><div><label style={labelStyle}>{t("phone")} *</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder={t("tenDigit")} style={inputStyle} type="tel" /></div><div><label style={labelStyle}>{t("email")}</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" style={inputStyle} type="email" /></div></div></div>
        <div style={{ marginBottom: 24 }}><h3 style={{ fontFamily: font, fontSize: 16, color: C.saffron, margin: "0 0 14px" }}>{t("schedule")}</h3><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}><div><label style={labelStyle}>{t("date")} *</label><input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} type="date" /></div><div><label style={labelStyle}>{t("time")}</label><input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} type="time" /></div><div><label style={labelStyle}>{t("members")}</label><input value={form.members} onChange={e => setForm(f => ({ ...f, members: Math.max(1, parseInt(e.target.value) || 1) }))} style={inputStyle} type="number" min="1" /></div></div></div>
        <div style={{ marginBottom: 28 }}><h3 style={{ fontFamily: font, fontSize: 16, color: C.saffron, margin: "0 0 14px" }}>{t("payment")}</h3>{selPujas.length > 0 && <div style={{ background: C.goldLight, borderRadius: 10, padding: "14px 18px", marginBottom: 14, fontFamily: sansFont, fontSize: 14, border: `1px solid ${C.gold}` }}><strong>{t("total")}: ₹{grandTotal}</strong><br /><span style={{ fontSize: 12, color: C.light }}>{t("scanToPay")}</span></div>}{grandTotal > 0 && <div style={{ marginBottom: 18 }}><UpiQrCode amount={grandTotal} /></div>}<label style={labelStyle}>{t("paymentScreenshot")} *</label><div style={{ border: `2px dashed ${form.paymentScreenshot ? C.success : C.border}`, borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer", background: form.paymentScreenshot ? C.successBg : C.cream }} onClick={() => document.getElementById("fileInput").click()}><input type="file" id="fileInput" accept="image/*" onChange={handleFile} style={{ display: "none" }} />{form.paymentScreenshot ? <div>✅ <span style={{ fontFamily: sansFont, fontSize: 13, color: C.success }}>{form.screenshotName}</span></div> : <div>📤 <span style={{ fontFamily: sansFont, fontSize: 13, color: C.light }}>{t("uploadAfterPayment")}</span></div>}</div></div>
        <button onClick={handleSubmit} disabled={form.pujaIds.length === 0 || saving} style={{ width: "100%", fontFamily: sansFont, fontSize: 16, fontWeight: 700, padding: 14, borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronDark})`, color: "#fff", opacity: form.pujaIds.length === 0 || saving ? 0.5 : 1 }}>{saving ? t("submitting") : `${t("submit")} (${selPujas.length} ${t("puja")})`}</button>
      </div>
    </div>
  );
}

function SuccessPage({ dispatch }) {
  const { t } = useLang();
  return (<div style={{ textAlign: "center", padding: "60px 20px" }}><span style={{ fontSize: 72 }}>🎉</span><h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "16px 0 8px" }}>{t("successTitle")}</h2><p style={{ fontFamily: sansFont, fontSize: 15, color: C.light, maxWidth: 420, margin: "0 auto 28px" }}>{t("successMessage")}</p><div style={{ display: "flex", gap: 12, justifyContent: "center" }}><button onClick={() => dispatch({ type: "SET_VIEW", payload: "home" })} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, padding: "12px 28px", borderRadius: 10, border: `2px solid ${C.saffron}`, cursor: "pointer", background: "transparent", color: C.saffron }}>{t("backHome")}</button></div></div>);
}

function StatusBadge({ status }) {
  const m = { confirmed: { bg: C.successBg, c: C.success, l: "✓ Confirmed" }, pending: { bg: C.pendingBg, c: C.pending, l: "⏳ Pending" }, cancelled: { bg: C.cancelledBg, c: C.cancelled, l: "✗ Cancelled" } };
  const s = m[status] || m.pending;
  return <span style={{ fontFamily: sansFont, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: s.bg, color: s.c, textTransform: "uppercase" }}>{s.l}</span>;
}

// ─── Admin ───
function AdminPanel({ state, dispatch, onRefresh }) {
  const tabs = [{ key: "registrations", label: "📋 Registrations", count: state.registrations.length }, { key: "temples", label: "🛕 Temples", count: state.temples.length }, { key: "add-temple", label: "➕ Add Temple" }, { key: "add-puja", label: "➕ Add Puja" }, { key: "priests", label: "👨‍🦱 Priests", count: state.priests.length }, { key: "blog", label: "📝 Blog", count: state.blogPosts.length }, { key: "social-links", label: "🔗 Social Links" }];
  return (
    <div>
      <h2 style={{ fontFamily: font, fontSize: 26, color: C.maroon, margin: "0 0 20px" }}>⚙️ Admin Dashboard</h2>
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>{tabs.map(t => <button key={t.key} onClick={() => dispatch({ type: "SET_ADMIN_TAB", payload: t.key })} style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${state.adminTab === t.key ? C.saffron : C.border}`, cursor: "pointer", background: state.adminTab === t.key ? C.saffronLight : "#fff", color: state.adminTab === t.key ? C.saffron : C.mid }}>{t.label} {t.count !== undefined && <span style={{ background: C.saffron, color: "#fff", borderRadius: 10, padding: "2px 8px", marginLeft: 6, fontSize: 11 }}>{t.count}</span>}</button>)}</div>
      {state.adminTab === "registrations" && <RegistrationsList state={state} dispatch={dispatch} onRefresh={onRefresh} dbAssignPriest={dbAssignPriest} />}
      {state.adminTab === "temples" && <TemplesList state={state} dispatch={dispatch} onRefresh={onRefresh} />}
      {state.adminTab === "add-temple" && <AddTempleForm dispatch={dispatch} onRefresh={onRefresh} />}
      {state.adminTab === "edit-temple" && <EditTempleForm state={state} dispatch={dispatch} onRefresh={onRefresh} />}
      {state.adminTab === "add-puja" && <AddPujaForm state={state} dispatch={dispatch} onRefresh={onRefresh} />}
      {state.adminTab === "priests" && <PriestsAdmin priests={state.priests} temples={state.temples} registrations={state.registrations} onRefresh={onRefresh} dbAddPriest={dbAddPriest} dbUpdatePriest={dbUpdatePriest} dbDeletePriest={dbDeletePriest} dbAssignPriest={dbAssignPriest} dispatch={dispatch} />}
      {state.adminTab === "social-links" && <SocialLinksManager state={state} dispatch={dispatch} onRefresh={onRefresh} />}
      {state.adminTab === "blog" && <BlogAdmin posts={state.blogPosts} onRefresh={onRefresh} dbAddPost={dbAddPost} dbUpdatePost={dbUpdatePost} dbDeletePost={dbDeletePost} dispatch={dispatch} />}
    </div>
  );
}

// ─── Registrations List ───
function RegistrationsList({ state, dispatch, onRefresh, dbAssignPriest }) {
  const [exp, setExp] = useState(null);
  const handleStatus = async (id, status) => {
    try { await dbUpdateStatus(id, status); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: `Status: ${status}` }); }
    catch (e) { alert("Error: " + e.message); }
  };
  const handleDelete = async (id) => {
    if (!confirm("Delete this registration? This cannot be undone.")) return;
    try { await dbDeleteRegistration(id); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: "Registration deleted" }); }
    catch (e) { alert("Error: " + e.message); }
  };
  return (
    <div>{state.registrations.length === 0 ? <div style={{ textAlign: "center", padding: 48, color: C.light, fontFamily: sansFont }}>No registrations yet.</div> : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{state.registrations.map(r => {
      const temple = state.temples.find(t => t.id === r.templeId); const ids = r.pujaIds || []; const bk = temple ? temple.pujas.filter(p => ids.includes(p.id)) : []; const amt = bk.reduce((s, p) => s + p.price, 0) * (r.members || 1); const open = exp === r.id;
      return (<div key={r.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div onClick={() => setExp(open ? null : r.id)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}><div style={{ width: 40, height: 40, borderRadius: 10, background: C.saffronLight, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, fontSize: 18, color: C.saffron, fontWeight: 700 }}>{r.devoteeName.charAt(0)}</div><div><h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: C.dark, margin: 0 }}>{r.devoteeName}</h4><p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: 0 }}>{temple?.name || "—"} — {bk.map(p => p.name).join(", ") || "—"}</p></div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{bk.length > 1 && <span style={{ fontFamily: sansFont, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: C.goldLight, color: C.gold }}>{bk.length}</span>}<span style={{ fontFamily: sansFont, fontSize: 12, color: C.light }}>{r.date}</span><StatusBadge status={r.status} /><span style={{ fontSize: 12, color: C.light }}>{open ? "▲" : "▼"}</span></div>
        </div>
        {open && <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ marginTop: 16, marginBottom: 16, padding: "14px 16px", background: C.saffronLight, borderRadius: 10, fontFamily: sansFont, fontSize: 13 }}><div style={{ fontWeight: 700, color: C.maroon, marginBottom: 8 }}>🪔 Booked Pujas</div>{bk.map(p => <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: C.mid }}><span>{p.name}</span><span>₹{p.price}</span></div>)}<div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}><span style={{ color: C.light }}>× {r.members || 1}</span><span style={{ fontWeight: 700, color: C.saffron }}>₹{amt}</span></div></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>{[{ l: "Phone", v: r.phone }, { l: "Email", v: r.email || "—" }, { l: "Gotra", v: r.gotra || "—" }, { l: "Time", v: r.time || "Flexible" }].map(i => <div key={i.l}><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>{i.l}</p><p style={{ fontFamily: sansFont, fontSize: 14, color: C.dark, margin: 0, fontWeight: 500 }}>{i.v}</p></div>)}</div>
          {r.paymentScreenshot && <div style={{ marginTop: 14 }}><img src={r.paymentScreenshot} alt="Payment" style={{ maxWidth: 240, borderRadius: 8, border: `1px solid ${C.border}` }} /></div>}
          <PriestAssignment registration={r} priests={state.priests} temples={state.temples} onAssign={async (regId, priestId, notes) => { await dbAssignPriest(regId, priestId, notes); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: priestId ? "Priest assigned!" : "Priest unassigned" }); }} />
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>{["confirmed", "pending", "cancelled"].map(s => <button key={s} onClick={() => handleStatus(r.id, s)} style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 8, cursor: "pointer", textTransform: "capitalize", border: r.status === s ? "none" : `1px solid ${C.border}`, background: r.status === s ? C.saffron : "#fff", color: r.status === s ? "#fff" : C.mid }}>{s}</button>)}<div style={{ flex: 1 }} /><button onClick={() => handleDelete(r.id)} style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 8, cursor: "pointer", border: `1px solid ${C.cancelled}`, background: "transparent", color: C.cancelled }}>🗑️ Delete</button></div>
        </div>}
      </div>);
    })}</div>}</div>
  );
}

// ─── Temples List ───
function TemplesList({ state, dispatch, onRefresh }) {
  const handleDelete = async (id) => {
    const regCount = state.registrations.filter(r => r.templeId === id).length;
    const msg = regCount > 0
      ? `This temple has ${regCount} registration${regCount > 1 ? 's' : ''}. Deleting will remove the temple AND all its registrations. Continue?`
      : "Remove this temple?";
    if (!confirm(msg)) return;
    try { await dbDeleteTemple(id); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: "Temple removed" }); } catch (e) { alert(e.message); }
  };
  const handleDeletePuja = async (id) => { try { await dbDeletePuja(id); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: "Puja removed" }); } catch (e) { alert(e.message); } };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{state.temples.map(t => (
      <div key={t.id} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {(t.templePhoto || t.deityPhoto) && <TempleBanner temple={t} height={100} />}
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{!t.templePhoto && !t.deityPhoto && <span style={{ fontSize: 32 }}>{t.icon}</span>}<div><h3 style={{ fontFamily: font, fontSize: 17, color: C.dark, margin: 0 }}>{t.name}</h3><p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: 0 }}>📍 {t.location}</p></div></div>
            <div style={{ display: "flex", gap: 6 }}><button onClick={() => dispatch({ type: "SET_EDITING_TEMPLE", payload: t.id })} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.saffron}`, background: "transparent", color: C.saffron, cursor: "pointer" }}>✏️ Edit</button><button onClick={() => handleDelete(t.id)} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.cancelled}`, background: "transparent", color: C.cancelled, cursor: "pointer" }}>Remove</button></div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{t.pujas.map(p => <div key={p.id} style={{ fontFamily: sansFont, fontSize: 13, padding: "8px 14px", borderRadius: 8, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}><span>{p.name} — ₹{p.price}</span><button onClick={() => handleDeletePuja(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.cancelled, fontSize: 14 }}>✕</button></div>)}</div>
        </div>
      </div>
    ))}</div>
  );
}

// ─── Add Temple ───
function AddTempleForm({ dispatch, onRefresh }) {
  const [f, setF] = useState({ name: "", location: "", icon: "🛕", description: "", deityPhoto: null, templePhoto: null });
  const [saving, setSaving] = useState(false);
  const emojis = ["🛕", "🕉️", "🪷", "🔱", "⛩️", "🙏", "🪔", "📿"];
  const handleSubmit = async () => {
    if (!f.name || !f.location) { alert("Fill name & location"); return; }
    setSaving(true);
    try { await dbAddTemple({ id: "t" + Date.now(), ...f, pujas: [] }); await onRefresh(); dispatch({ type: "SET_ADMIN_TAB", payload: "temples" }); dispatch({ type: "SET_NOTIFICATION", payload: "Temple added!" }); }
    catch (e) { alert(e.message); }
    setSaving(false);
  };
  return (
    <div style={{ maxWidth: 560, background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${C.border}` }}>
      <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: "0 0 18px" }}>➕ Add New Temple</h3>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Name *</label><input value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} placeholder="e.g. Shree Kashi Vishwanath" style={inputStyle} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Location *</label><input value={f.location} onChange={e => setF(x => ({ ...x, location: e.target.value }))} placeholder="e.g. Varanasi, UP" style={inputStyle} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Description</label><textarea value={f.description} onChange={e => setF(x => ({ ...x, description: e.target.value }))} placeholder="Brief description" rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Icon</label><div style={{ display: "flex", gap: 6 }}>{emojis.map(e => <button key={e} onClick={() => setF(x => ({ ...x, icon: e }))} style={{ fontSize: 24, padding: "6px 10px", borderRadius: 8, cursor: "pointer", border: f.icon === e ? `2px solid ${C.saffron}` : `1px solid ${C.border}`, background: f.icon === e ? C.saffronLight : "#fff" }}>{e}</button>)}</div></div>
      <div style={{ display: "flex", gap: 24, marginBottom: 20 }}><PhotoUpload label="Deity Photo" value={f.deityPhoto} onChange={v => setF(x => ({ ...x, deityPhoto: v }))} /><PhotoUpload label="Temple Photo" value={f.templePhoto} onChange={v => setF(x => ({ ...x, templePhoto: v }))} /></div>
      <button onClick={handleSubmit} disabled={saving} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff", opacity: saving ? 0.5 : 1 }}>{saving ? "Adding..." : "➕ Add Temple"}</button>
    </div>
  );
}

// ─── Edit Temple ───
function EditTempleForm({ state, dispatch, onRefresh }) {
  const temple = state.temples.find(t => t.id === state.editingTempleId);
  const [f, setF] = useState(temple ? { name: temple.name, location: temple.location, icon: temple.icon, description: temple.description || "", deityPhoto: temple.deityPhoto, templePhoto: temple.templePhoto } : {});
  const [saving, setSaving] = useState(false);
  const emojis = ["🛕", "🕉️", "🪷", "🔱", "⛩️", "🙏", "🪔", "📿"];
  if (!temple) return <p>Temple not found.</p>;
  const handleSave = async () => {
    if (!f.name || !f.location) { alert("Fill name & location"); return; }
    setSaving(true);
    try { await dbUpdateTemple({ id: temple.id, ...f }); await onRefresh(); dispatch({ type: "SET_ADMIN_TAB", payload: "temples" }); dispatch({ type: "SET_NOTIFICATION", payload: "Temple updated!" }); }
    catch (e) { alert(e.message); }
    setSaving(false);
  };
  return (
    <div style={{ maxWidth: 560, background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}><h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: 0 }}>✏️ Edit Temple</h3><button onClick={() => dispatch({ type: "SET_EDITING_TEMPLE", payload: null })} style={{ fontFamily: sansFont, fontSize: 13, color: C.saffron, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>← Back</button></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Name *</label><input value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} style={inputStyle} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Location *</label><input value={f.location} onChange={e => setF(x => ({ ...x, location: e.target.value }))} style={inputStyle} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Description</label><textarea value={f.description} onChange={e => setF(x => ({ ...x, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Icon</label><div style={{ display: "flex", gap: 6 }}>{emojis.map(e => <button key={e} onClick={() => setF(x => ({ ...x, icon: e }))} style={{ fontSize: 24, padding: "6px 10px", borderRadius: 8, cursor: "pointer", border: f.icon === e ? `2px solid ${C.saffron}` : `1px solid ${C.border}`, background: f.icon === e ? C.saffronLight : "#fff" }}>{e}</button>)}</div></div>
      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}><PhotoUpload label="Deity Photo" value={f.deityPhoto} onChange={v => setF(x => ({ ...x, deityPhoto: v }))} /><PhotoUpload label="Temple Photo" value={f.templePhoto} onChange={v => setF(x => ({ ...x, templePhoto: v }))} /></div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleSave} disabled={saving} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff", opacity: saving ? 0.5 : 1 }}>{saving ? "Saving..." : "💾 Save"}</button>
        <button onClick={() => dispatch({ type: "SET_EDITING_TEMPLE", payload: null })} style={{ fontFamily: sansFont, fontSize: 14, padding: "12px 24px", borderRadius: 10, border: `1.5px solid ${C.border}`, cursor: "pointer", background: "#fff", color: C.mid }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Add Puja ───
function AddPujaForm({ state, dispatch, onRefresh }) {
  const [f, setF] = useState({ templeId: "", name: "", price: "", duration: "", description: "" });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async () => {
    if (!f.templeId || !f.name || !f.price) { alert("Fill required fields"); return; }
    setSaving(true);
    try { await dbAddPuja(f.templeId, { id: "p" + Date.now(), name: f.name, price: parseInt(f.price), duration: f.duration || "30 min", description: f.description }); await onRefresh(); dispatch({ type: "SET_ADMIN_TAB", payload: "temples" }); dispatch({ type: "SET_NOTIFICATION", payload: "Puja added!" }); }
    catch (e) { alert(e.message); }
    setSaving(false);
  };
  return (
    <div style={{ maxWidth: 480, background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${C.border}` }}>
      <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: "0 0 18px" }}>➕ Add Puja</h3>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Temple *</label><select value={f.templeId} onChange={e => setF(x => ({ ...x, templeId: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}><option value="">Select</option>{state.temples.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      <div style={{ marginBottom: 16 }}><label style={labelStyle}>Puja Name *</label><input value={f.name} onChange={e => setF(x => ({ ...x, name: e.target.value }))} placeholder="e.g. Rudrabhishek" style={inputStyle} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}><div><label style={labelStyle}>Price (₹) *</label><input value={f.price} onChange={e => setF(x => ({ ...x, price: e.target.value }))} placeholder="1100" style={inputStyle} type="number" /></div><div><label style={labelStyle}>Duration</label><input value={f.duration} onChange={e => setF(x => ({ ...x, duration: e.target.value }))} placeholder="1 hr" style={inputStyle} /></div></div>
      <div style={{ marginBottom: 20 }}><label style={labelStyle}>Description</label><textarea value={f.description} onChange={e => setF(x => ({ ...x, description: e.target.value }))} placeholder="Brief description" rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
      <button onClick={handleSubmit} disabled={saving} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff", opacity: saving ? 0.5 : 1 }}>{saving ? "Adding..." : "➕ Add Puja"}</button>
    </div>
  );
}

// ─── Social Links Manager ───
function SocialLinksManager({ state, dispatch, onRefresh }) {
  const platforms = ["facebook", "instagram", "youtube", "twitter", "whatsapp", "telegram", "linkedin", "website"];
  const [f, setF] = useState({ platform: "facebook", url: "", label: "" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!f.url) { alert("Enter a URL"); return; }
    setSaving(true);
    try {
      await dbAddSocial({ id: "sl" + Date.now(), platform: f.platform, url: f.url, label: f.label, sort_order: state.socialLinks.length });
      await onRefresh();
      setF({ platform: "facebook", url: "", label: "" });
      dispatch({ type: "SET_NOTIFICATION", payload: "Social link added!" });
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await dbDeleteSocial(id); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: "Link removed" }); }
    catch (e) { alert(e.message); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: "0 0 18px" }}>🔗 Manage Social Links</h3>
      <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: "0 0 20px" }}>These links appear on the About page for devotees to follow you.</p>

      {/* Existing links */}
      {state.socialLinks.length > 0 && (
        <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          {state.socialLinks.map(link => (
            <div key={link.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
              <SocialIcon platform={link.platform} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, color: C.dark, margin: "0 0 2px", textTransform: "capitalize" }}>{link.label || link.platform}</h4>
                <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{link.url}</p>
              </div>
              <button onClick={() => handleDelete(link.id)} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.cancelled}`, background: "transparent", color: C.cancelled, cursor: "pointer" }}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {state.socialLinks.length === 0 && (
        <div style={{ textAlign: "center", padding: 32, background: C.cream, borderRadius: 12, marginBottom: 24, fontFamily: sansFont, color: C.light }}>
          <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>🔗</span>
          No social links yet. Add your first one below.
        </div>
      )}

      {/* Add new link */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: `1px solid ${C.border}` }}>
        <h4 style={{ fontFamily: sansFont, fontSize: 15, fontWeight: 700, color: C.dark, margin: "0 0 16px" }}>➕ Add New Link</h4>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Platform</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {platforms.map(p => (
              <button key={p} onClick={() => setF(x => ({ ...x, platform: p }))}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontFamily: sansFont, fontSize: 13, fontWeight: 600, textTransform: "capitalize", border: f.platform === p ? `2px solid ${C.saffron}` : `1px solid ${C.border}`, background: f.platform === p ? C.saffronLight : "#fff", color: f.platform === p ? C.saffron : C.mid }}>
                <SocialIcon platform={p} size={18} /> {p}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>URL *</label>
          <input value={f.url} onChange={e => setF(x => ({ ...x, url: e.target.value }))} placeholder="https://www.facebook.com/yourpage" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Button Label <span style={{ fontWeight: 400, color: C.light }}>(optional, defaults to platform name)</span></label>
          <input value={f.label} onChange={e => setF(x => ({ ...x, label: e.target.value }))} placeholder="e.g. Follow on Facebook" style={inputStyle} />
        </div>
        <button onClick={handleAdd} disabled={saving}
          style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff", opacity: saving ? 0.5 : 1 }}>
          {saving ? "Adding..." : "➕ Add Social Link"}
        </button>
      </div>
    </div>
  );
}

// ─── WhatsApp Floating Button ───
const WHATSAPP_NUMBER = "919930576556"; // Shree Dattaraj Gurumauli WhatsApp

function WhatsAppFloatingButton() {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("whatsappMessage"))}`;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
      {expanded && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: `1px solid ${C.border}`, maxWidth: 260, animation: "slideIn 0.2s ease" }}>
          <p style={{ fontFamily: sansFont, fontSize: 14, color: C.dark, margin: "0 0 8px", fontWeight: 600 }}>{t("whatsappTitle")}</p>
          <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: "0 0 12px", lineHeight: 1.5 }}>{t("whatsappDesc")}</p>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            style={{ display: "block", textAlign: "center", fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: 10, background: "#25D366", color: "#fff", textDecoration: "none" }}>
            {t("whatsappStart")}
          </a>
        </div>
      )}
      <button onClick={() => setExpanded(!expanded)}
        style={{ width: 60, height: 60, borderRadius: 30, border: "none", cursor: "pointer", background: "#25D366", boxShadow: "0 4px 20px rgba(37,211,102,0.4)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s", transform: expanded ? "rotate(45deg)" : "none" }}>
        {expanded
          ? <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          : <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        }
      </button>
    </div>
  );
}

// ─── App ───
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { t } = useLang();

  const refreshData = useCallback(async () => {
    try {
      const [temples, registrations, socialLinks, blogPosts, priests] = await Promise.all([fetchTemples(), fetchRegistrations(), fetchSocialLinks(), fetchBlogPosts(), fetchPriests()]);
      dispatch({ type: "SET_DATA", payload: { temples, registrations, socialLinks, blogPosts, priests } });
    } catch (e) {
      dispatch({ type: "SET_ERROR", payload: e.message });
    }
  }, []);

  // Check existing session & listen for auth changes
  useEffect(() => {
    getSession().then(session => {
      setAdminUser(session?.user || null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = onAuthChange(session => {
      setAdminUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleLogout = async () => {
    await signOut();
    setAdminUser(null);
    dispatch({ type: "SET_VIEW", payload: "home" });
    dispatch({ type: "SET_NOTIFICATION", payload: "Logged out" });
  };

  const handleLoginSuccess = async () => {
    const session = await getSession();
    setAdminUser(session?.user || null);
  };

  if (state.loading || authLoading) return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <img src={LOGO_SRC} alt="Loading" style={{ width: 80, height: 80, borderRadius: 20, border: `3px solid ${C.gold}`, animation: "pulse 1.5s infinite" }} />
      <p style={{ fontFamily: sansFont, fontSize: 15, color: C.mid }}>Loading...</p>
      <style>{`@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(0.95); } }`}</style>
    </div>
  );

  if (state.error) return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 40, textAlign: "center" }}>
      <span style={{ fontSize: 48 }}>⚠️</span>
      <h2 style={{ fontFamily: font, fontSize: 22, color: C.maroon }}>Connection Error</h2>
      <p style={{ fontFamily: sansFont, fontSize: 14, color: C.mid, maxWidth: 400 }}>Could not connect to database. Check your .env.local file has the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.</p>
      <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light }}>{state.error}</p>
      <button onClick={refreshData} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff" }}>Retry</button>
    </div>
  );

  // If someone tries to access admin without login, redirect to login
  const showAdmin = state.view === "admin" && adminUser;
  const showLogin = state.view === "admin" && !adminUser || state.view === "login";

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: sansFont }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@400;600;700&display=swap');
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: #e8621e !important; box-shadow: 0 0 0 3px rgba(232,98,30,0.1); }
        button:hover { opacity: 0.92; }

        /* Desktop: show nav, hide hamburger */
        .desktop-nav { display: flex !important; }
        .mobile-nav-toggle { display: none !important; }
        .mobile-menu { display: none !important; }

        /* Mobile */
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
          .mobile-menu { display: flex !important; }
          main { padding: 16px 12px 40px !important; }
        }
        @media (max-width: 520px) {
          h1 { font-size: 15px !important; }
          h2 { font-size: 22px !important; }
        }
      `}</style>
      {state.notification && <Notification message={state.notification} onClose={() => dispatch({ type: "CLEAR_NOTIFICATION" })} />}
      <Header state={state} dispatch={dispatch} adminUser={adminUser} onLogout={handleLogout} />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 60px" }}>
        {state.view === "home" && <HomePage state={state} dispatch={dispatch} />}
        {state.view === "register" && <RegistrationForm state={state} dispatch={dispatch} onRefresh={refreshData} />}
        {state.view === "my-bookings" && <DevoteeDashboard temples={state.temples} fetchDevoteeBookings={fetchDevoteeBookings} />}
        {state.view === "blog" && !state.selectedPostId && <BlogPage posts={state.blogPosts} onSelectPost={(id) => dispatch({ type: "SELECT_POST", payload: id })} />}
        {state.view === "blog" && state.selectedPostId && <BlogPostView post={state.blogPosts.find(p => p.id === state.selectedPostId)} onBack={() => dispatch({ type: "SELECT_POST", payload: null })} />}
        {state.view === "about" && <AboutPage socialLinks={state.socialLinks} />}
        {showLogin && <AdminLogin dispatch={dispatch} onLogin={handleLoginSuccess} />}
        {showAdmin && <AdminPanel state={state} dispatch={dispatch} onRefresh={refreshData} />}
        {state.view === "success" && <SuccessPage dispatch={dispatch} />}
        {state.view === "privacy" && <PrivacyPolicyPage />}
        {state.view === "terms" && <TermsPage />}
        {state.view === "refund" && <RefundPolicyPage />}
      </main>
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "28px 24px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
            <img src={LOGO_SRC} alt="" style={{ width: 30, height: 30, objectFit: "contain", verticalAlign: "middle", marginRight: 8 }} />
            <span style={{ fontFamily: font, fontSize: 16, color: C.maroon }}>{t("appName")}</span>
          </div>
          {state.socialLinks.length > 0 && (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14 }}>
              {state.socialLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" title={link.label || link.platform}
                  style={{ width: 36, height: 36, borderRadius: 10, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.saffronLight; e.currentTarget.style.borderColor = C.saffron; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.cream; e.currentTarget.style.borderColor = C.border; }}>
                  <SocialIcon platform={link.platform} size={18} />
                </a>
              ))}
            </div>
          )}
          <LegalFooterLinks dispatch={dispatch} />
          <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, marginTop: 10 }}>© {new Date().getFullYear()} Shree Dattaraj Gurumauli. All rights reserved.</p>
        </div>
      </footer>
      <WhatsAppFloatingButton />
    </div>
  );
}
