// ─── Devotee Local Storage Utility ───
// Saves and retrieves devotee preferences, profile and session data

const KEYS = {
  PROFILE: "sdgm_devotee_profile",
  ACCESS_CODE: "sdgm_access_code",
  CHAT_HISTORY: "sdgm_chat_history",
  LANGUAGE: "sdgm_language",
  RASHI_DETAILS: "sdgm_rashi_details",
};

// ─── Profile (name, gotra, phone, city, members) ───
export function saveDevoteeProfile(data) {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify({
      name: data.name || "",
      gotra: data.gotra || "",
      phone: data.phone || "",
      email: data.email || "",
      city: data.city || "",
      members: data.members || 1,
      savedAt: Date.now(),
    }));
  } catch (e) {}
}

export function getDevoteeProfile() {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

export function clearDevoteeProfile() {
  try { localStorage.removeItem(KEYS.PROFILE); } catch (e) {}
}

// ─── Access Code (valid 30 days) ───
export function saveAccessCode(code, description = "") {
  try {
    localStorage.setItem(KEYS.ACCESS_CODE, JSON.stringify({
      code,
      description,
      savedAt: Date.now(),
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    }));
  } catch (e) {}
}

export function getAccessCode() {
  try {
    const raw = localStorage.getItem(KEYS.ACCESS_CODE);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(KEYS.ACCESS_CODE);
      return null;
    }
    return data;
  } catch (e) { return null; }
}

export function clearAccessCode() {
  try { localStorage.removeItem(KEYS.ACCESS_CODE); } catch (e) {}
}

// ─── Chat History (last 20 messages, per tool) ───
export function saveChatHistory(toolKey, messages) {
  try {
    const key = `${KEYS.CHAT_HISTORY}_${toolKey}`;
    // Keep last 20 messages only
    const trimmed = messages.slice(-20);
    localStorage.setItem(key, JSON.stringify({
      messages: trimmed,
      savedAt: Date.now(),
    }));
  } catch (e) {}
}

export function getChatHistory(toolKey) {
  try {
    const key = `${KEYS.CHAT_HISTORY}_${toolKey}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const data = JSON.parse(raw);
    // Expire after 30 days
    if (Date.now() - data.savedAt > 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return [];
    }
    return data.messages || [];
  } catch (e) { return []; }
}

export function clearChatHistory(toolKey) {
  try {
    const key = `${KEYS.CHAT_HISTORY}_${toolKey}`;
    localStorage.removeItem(key);
  } catch (e) {}
}

// ─── Language Preference ───
export function saveLanguage(lang) {
  try { localStorage.setItem(KEYS.LANGUAGE, lang); } catch (e) {}
}

export function getSavedLanguage() {
  try { return localStorage.getItem(KEYS.LANGUAGE) || null; } catch (e) { return null; }
}

// ─── Rashi Details (DOB, time, city for Vedic calculation) ───
export function saveRashiDetails(data) {
  try {
    localStorage.setItem(KEYS.RASHI_DETAILS, JSON.stringify({
      dob: data.dob || "",
      tob: data.tob || "",
      city: data.city || "",
      system: data.system || "vedic",
      savedAt: Date.now(),
    }));
  } catch (e) {}
}

export function getRashiDetails() {
  try {
    const raw = localStorage.getItem(KEYS.RASHI_DETAILS);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

// ─── Clear all devotee data ───
export function clearAllDevoteeData() {
  try {
    Object.values(KEYS).forEach(k => {
      // Also clear chat history variants
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sdgm_")) localStorage.removeItem(key);
      }
    });
  } catch (e) {}
}

// ─── Helper: days until access code expires ───
export function accessCodeDaysLeft() {
  const code = getAccessCode();
  if (!code) return 0;
  return Math.ceil((code.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
}
