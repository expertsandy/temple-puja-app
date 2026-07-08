import { createContext, useContext, useState } from "react";
import translations from "./i18n.js";

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return window.localStorage?.getItem("puja-app-lang") || "hi";
    } catch { return "hi"; }
  });

  const changeLang = (newLang) => {
    setLang(newLang);
    try { window.localStorage?.setItem("puja-app-lang", newLang); } catch {}
  };

  const t = (key) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry["en"] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

// ─── Language Switcher Component ───
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";

export function LangSwitcher({ style }) {
  const { lang, setLang } = useLang();
  const langs = [
    { code: "en", label: "EN" },
    { code: "hi", label: "हिं" },
    { code: "mr", label: "मरा" },
  ];
  const current = langs.find(l => l.code === lang) || langs[1];

  return (
    <select value={lang} onChange={e => setLang(e.target.value)}
      style={{
        fontFamily: sansFont, fontSize: 12, fontWeight: 700,
        padding: "5px 8px", borderRadius: 6, border: "1px solid rgba(123,26,44,0.3)",
        cursor: "pointer", background: "rgba(255,255,255,0.5)", color: "#5c2d1a",
        outline: "none", appearance: "auto", ...style,
      }}>
      {langs.map(l => (
        <option key={l.code} value={l.code} style={{ color: "#333", background: "#fff" }}>{l.label}</option>
      ))}
    </select>
  );
}
