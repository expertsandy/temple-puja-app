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
    { code: "hi", label: "हि" },
    { code: "mr", label: "म" },
  ];

  return (
    <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: 2, ...style }}>
      {langs.map(l => (
        <button key={l.code} onClick={() => setLang(l.code)}
          style={{
            fontFamily: sansFont, fontSize: 11, fontWeight: 700,
            padding: "4px 8px", borderRadius: 4, border: "none", cursor: "pointer",
            background: lang === l.code ? "rgba(255,255,255,0.9)" : "transparent",
            color: lang === l.code ? "#7b1a2c" : "rgba(255,255,255,0.7)",
            transition: "all 0.15s",
          }}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
