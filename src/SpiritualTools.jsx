import { useState } from "react";
import { useLang } from "./LangContext.jsx";

const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4", success: "#2d7a4f", successBg: "#e8f5ee" };
const inputStyle = { fontFamily: sansFont, fontSize: 14, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, width: "100%", boxSizing: "border-box", outline: "none", color: C.dark, background: "#fff" };

const st = {
  toolsTitle: { en: "🔮 Spiritual Tools", hi: "🔮 आध्यात्मिक उपकरण", mr: "🔮 आध्यात्मिक साधने" },
  toolsSubtitle: { en: "Explore your spiritual journey with these tools", hi: "इन उपकरणों से अपनी आध्यात्मिक यात्रा का अन्वेषण करें", mr: "या साधनांनी तुमचा आध्यात्मिक प्रवास शोधा" },
  panchang: { en: "📅 Panchang", hi: "📅 पंचांग", mr: "📅 पंचांग" },
  rashi: { en: "♈ Rashi & Puja", hi: "♈ राशि और पूजा", mr: "♈ राशी आणि पूजा" },
  festivals: { en: "🎪 Festivals", hi: "🎪 त्योहार", mr: "🎪 सण" },
  muhurat: { en: "🕉️ Muhurat", hi: "🕉️ मुहूर्त", mr: "🕉️ मुहूर्त" },
};
function t(key, lang) { return st[key]?.[lang] || st[key]?.["en"] || key; }

// ─── Accurate Moon Longitude (Meeus Algorithm) ───
function toRad(d) { return d * Math.PI / 180; }
function sinD(d) { return Math.sin(toRad(d)); }
function cosD(d) { return Math.cos(toRad(d)); }

function dateToJD(year, month, day, hours) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hours / 24 + B - 1524.5;
}

function getMoonLongitude(jd) {
  // Julian centuries from J2000.0
  const T = (jd - 2451545.0) / 36525;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  // Moon's mean longitude (L')
  let Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
  Lp = ((Lp % 360) + 360) % 360;

  // Moon's mean anomaly (M')
  let Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
  Mp = ((Mp % 360) + 360) % 360;

  // Sun's mean anomaly (M)
  let M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
  M = ((M % 360) + 360) % 360;

  // Moon's argument of latitude (F)
  let F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;
  F = ((F % 360) + 360) % 360;

  // Mean elongation of the Moon (D)
  let D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
  D = ((D % 360) + 360) % 360;

  // Longitude of ascending node
  let Om = 125.0445479 - 1934.1362891 * T + 0.0020754 * T2 + T3 / 467441 - T4 / 60616000;
  Om = ((Om % 360) + 360) % 360;

  // Sum of principal terms for longitude (Meeus Table 47.A)
  let sumL = 0;
  const terms = [
    [0, 0, 1, 0, 6288774],
    [2, 0, -1, 0, 1274027],
    [2, 0, 0, 0, 658314],
    [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116],
    [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793],
    [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758],
    [0, 1, -1, 0, -40923],
    [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383],
    [2, 0, 0, -2, 15327],
    [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675],
    [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548],
    [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766],
    [1, 0, -1, 0, -5163],
    [1, 1, 0, 0, 4987],
    [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994],
    [4, 0, 0, 0, 3861],
    [2, 0, -3, 0, 3665],
    [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602],
    [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348],
    [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120],
    [0, 2, 0, 0, -2069],
    [2, -2, -1, 0, 2048],
    [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595],
    [4, -1, -1, 0, 1215],
    [0, 0, 2, 2, -1110],
    [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810],
    [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713],
    [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691],
    [2, -1, 0, -2, 596],
    [4, 0, 1, 0, 549],
    [0, 0, 4, 0, 537],
    [4, -1, 0, 0, 520],
    [1, 0, -2, 0, -487],
  ];

  // Eccentricity correction
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const E2 = E * E;

  for (const [d, m, mp, f, coeff] of terms) {
    let arg = d * D + m * M + mp * Mp + f * F;
    let c = coeff;
    if (Math.abs(m) === 1) c *= E;
    if (Math.abs(m) === 2) c *= E2;
    sumL += c * sinD(arg);
  }

  // Additional additive terms
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.290 * T;
  const A3 = 313.45 + 481266.484 * T;
  sumL += 3958 * sinD(A1) + 1962 * sinD(Lp - F) + 318 * sinD(A2);

  // Moon's ecliptic longitude (tropical)
  let moonLng = Lp + sumL / 1000000;
  moonLng = ((moonLng % 360) + 360) % 360;

  return moonLng;
}

function getLahiriAyanamsa(jd) {
  const T = (jd - 2451545.0) / 36525;
  // Lahiri ayanamsa (approximate but good)
  return 23.85 + 0.01397 * (((jd - 2451545.0) / 365.25));
}

function getSiderealMoonLongitude(jd) {
  const tropical = getMoonLongitude(jd);
  const ayanamsa = getLahiriAyanamsa(jd);
  let sidereal = tropical - ayanamsa;
  sidereal = ((sidereal % 360) + 360) % 360;
  return sidereal;
}

// ─── Rashi Data ───
const RASHIS = [
  { id: 0, en: "Aries", hi: "मेष", mr: "मेष", symbol: "♈", planet: { en: "Mars", hi: "मंगल", mr: "मंगळ" }, element: { en: "Fire", hi: "अग्नि", mr: "अग्नी" }, deity: { en: "Lord Hanuman", hi: "हनुमान जी", mr: "हनुमान" }, color: "#FF4444",
    pujas: { en: ["Hanuman Puja", "Mangal Shanti", "Rudrabhishek"], hi: ["हनुमान पूजा", "मंगल शांति", "रुद्राभिषेक"], mr: ["हनुमान पूजा", "मंगळ शांती", "रुद्राभिषेक"] },
    advice: { en: "Chant Hanuman Chalisa on Tuesdays. Wear red coral.", hi: "मंगलवार को हनुमान चालीसा पढ़ें। मूंगा धारण करें।", mr: "मंगळवारी हनुमान चालीसा म्हणा. मूंगा धारण करा." } },
  { id: 1, en: "Taurus", hi: "वृषभ", mr: "वृषभ", symbol: "♉", planet: { en: "Venus", hi: "शुक्र", mr: "शुक्र" }, element: { en: "Earth", hi: "पृथ्वी", mr: "पृथ्वी" }, deity: { en: "Goddess Lakshmi", hi: "लक्ष्मी माता", mr: "लक्ष्मी माता" }, color: "#4CAF50",
    pujas: { en: ["Lakshmi Puja", "Shukra Shanti", "Satyanarayan Puja"], hi: ["लक्ष्मी पूजा", "शुक्र शांति", "सत्यनारायण पूजा"], mr: ["लक्ष्मी पूजा", "शुक्र शांती", "सत्यनारायण पूजा"] },
    advice: { en: "Worship Goddess Lakshmi on Fridays. Wear diamond or opal.", hi: "शुक्रवार को लक्ष्मी पूजा करें। हीरा धारण करें।", mr: "शुक्रवारी लक्ष्मी पूजा करा. हिरा धारण करा." } },
  { id: 2, en: "Gemini", hi: "मिथुन", mr: "मिथुन", symbol: "♊", planet: { en: "Mercury", hi: "बुध", mr: "बुध" }, element: { en: "Air", hi: "वायु", mr: "वायू" }, deity: { en: "Lord Vishnu", hi: "भगवान विष्णु", mr: "भगवान विष्णू" }, color: "#FFD700",
    pujas: { en: ["Vishnu Puja", "Budh Shanti", "Dattatreya Puja"], hi: ["विष्णु पूजा", "बुध शांति", "दत्तात्रेय पूजा"], mr: ["विष्णू पूजा", "बुध शांती", "दत्तात्रेय पूजा"] },
    advice: { en: "Chant Vishnu Sahasranama on Wednesdays. Wear emerald.", hi: "बुधवार को विष्णु सहस्रनाम पढ़ें। पन्ना धारण करें।", mr: "बुधवारी विष्णू सहस्रनाम म्हणा. पाचू धारण करा." } },
  { id: 3, en: "Cancer", hi: "कर्क", mr: "कर्क", symbol: "♋", planet: { en: "Moon", hi: "चंद्र", mr: "चंद्र" }, element: { en: "Water", hi: "जल", mr: "जल" }, deity: { en: "Lord Shiva", hi: "भगवान शिव", mr: "भगवान शिव" }, color: "#90CAF9",
    pujas: { en: ["Shiv Abhishek", "Chandra Shanti", "Rudrabhishek"], hi: ["शिव अभिषेक", "चंद्र शांति", "रुद्राभिषेक"], mr: ["शिव अभिषेक", "चंद्र शांती", "रुद्राभिषेक"] },
    advice: { en: "Offer water to Shivling on Mondays. Wear pearl.", hi: "सोमवार को शिवलिंग पर जल चढ़ाएं। मोती धारण करें।", mr: "सोमवारी शिवलिंगावर जल अर्पण करा. मोती धारण करा." } },
  { id: 4, en: "Leo", hi: "सिंह", mr: "सिंह", symbol: "♌", planet: { en: "Sun", hi: "सूर्य", mr: "सूर्य" }, element: { en: "Fire", hi: "अग्नि", mr: "अग्नी" }, deity: { en: "Lord Surya", hi: "सूर्य देव", mr: "सूर्य देव" }, color: "#FF9800",
    pujas: { en: ["Surya Puja", "Aditya Hridayam", "Rudrabhishek"], hi: ["सूर्य पूजा", "आदित्य हृदयम", "रुद्राभिषेक"], mr: ["सूर्य पूजा", "आदित्य हृदयम", "रुद्राभिषेक"] },
    advice: { en: "Offer water to Sun at sunrise. Wear ruby.", hi: "सूर्योदय पर सूर्य को जल अर्पित करें। माणिक्य धारण करें।", mr: "सूर्योदयावेळी सूर्याला जल अर्पण करा. माणिक धारण करा." } },
  { id: 5, en: "Virgo", hi: "कन्या", mr: "कन्या", symbol: "♍", planet: { en: "Mercury", hi: "बुध", mr: "बुध" }, element: { en: "Earth", hi: "पृथ्वी", mr: "पृथ्वी" }, deity: { en: "Lord Ganesha", hi: "गणेश जी", mr: "गणेश" }, color: "#8BC34A",
    pujas: { en: ["Ganesh Puja", "Budh Shanti", "Ganapati Atharvashirsha"], hi: ["गणेश पूजा", "बुध शांति", "गणपति अथर्वशीर्ष"], mr: ["गणेश पूजा", "बुध शांती", "गणपती अथर्वशीर्ष"] },
    advice: { en: "Worship Lord Ganesha on Wednesdays. Wear emerald.", hi: "बुधवार को गणेश पूजा करें। पन्ना धारण करें।", mr: "बुधवारी गणेशपूजा करा. पाचू धारण करा." } },
  { id: 6, en: "Libra", hi: "तुला", mr: "तूळ", symbol: "♎", planet: { en: "Venus", hi: "शुक्र", mr: "शुक्र" }, element: { en: "Air", hi: "वायु", mr: "वायू" }, deity: { en: "Goddess Durga", hi: "दुर्गा माता", mr: "दुर्गा माता" }, color: "#E91E63",
    pujas: { en: ["Durga Puja", "Shukra Shanti", "Navchandi Havan"], hi: ["दुर्गा पूजा", "शुक्र शांति", "नवचंडी हवन"], mr: ["दुर्गा पूजा", "शुक्र शांती", "नवचंडी हवन"] },
    advice: { en: "Worship Goddess Durga on Fridays. Wear diamond.", hi: "शुक्रवार को दुर्गा पूजा करें। हीरा धारण करें।", mr: "शुक्रवारी दुर्गा पूजा करा. हिरा धारण करा." } },
  { id: 7, en: "Scorpio", hi: "वृश्चिक", mr: "वृश्चिक", symbol: "♏", planet: { en: "Mars", hi: "मंगल", mr: "मंगळ" }, element: { en: "Water", hi: "जल", mr: "जल" }, deity: { en: "Lord Hanuman", hi: "हनुमान जी", mr: "हनुमान" }, color: "#B71C1C",
    pujas: { en: ["Hanuman Puja", "Mangal Shanti", "Mahamrityunjaya Japa"], hi: ["हनुमान पूजा", "मंगल शांति", "महामृत्युंजय जप"], mr: ["हनुमान पूजा", "मंगळ शांती", "महामृत्युंजय जप"] },
    advice: { en: "Chant Hanuman Chalisa on Tuesdays. Wear red coral.", hi: "मंगलवार को हनुमान चालीसा पढ़ें। मूंगा धारण करें।", mr: "मंगळवारी हनुमान चालीसा म्हणा. मूंगा धारण करा." } },
  { id: 8, en: "Sagittarius", hi: "धनु", mr: "धनु", symbol: "♐", planet: { en: "Jupiter", hi: "बृहस्पति", mr: "बृहस्पती" }, element: { en: "Fire", hi: "अग्नि", mr: "अग्नी" }, deity: { en: "Lord Dattatreya", hi: "भगवान दत्तात्रेय", mr: "भगवान दत्तात्रेय" }, color: "#9C27B0",
    pujas: { en: ["Dattatreya Puja", "Guru Shanti", "Gurucharitra Parayan"], hi: ["दत्तात्रेय पूजा", "गुरु शांति", "गुरुचरित्र पारायण"], mr: ["दत्तात्रेय पूजा", "गुरू शांती", "गुरुचरित्र पारायण"] },
    advice: { en: "Worship Lord Dattatreya on Thursdays. Wear yellow sapphire.", hi: "गुरुवार को दत्तात्रेय पूजा करें। पुखराज धारण करें।", mr: "गुरुवारी दत्तात्रेय पूजा करा. पुष्कराज धारण करा." } },
  { id: 9, en: "Capricorn", hi: "मकर", mr: "मकर", symbol: "♑", planet: { en: "Saturn", hi: "शनि", mr: "शनी" }, element: { en: "Earth", hi: "पृथ्वी", mr: "पृथ्वी" }, deity: { en: "Lord Shani", hi: "शनि देव", mr: "शनी देव" }, color: "#607D8B",
    pujas: { en: ["Shani Puja", "Shani Shanti", "Hanuman Puja"], hi: ["शनि पूजा", "शनि शांति", "हनुमान पूजा"], mr: ["शनी पूजा", "शनी शांती", "हनुमान पूजा"] },
    advice: { en: "Light sesame oil lamp on Saturdays. Wear blue sapphire after consultation.", hi: "शनिवार को तिल तेल का दीपक जलाएं। नीलम सलाह से धारण करें।", mr: "शनिवारी तीळ तेलाचा दिवा लावा. नीलम सल्ल्याने धारण करा." } },
  { id: 10, en: "Aquarius", hi: "कुंभ", mr: "कुंभ", symbol: "♒", planet: { en: "Saturn", hi: "शनि", mr: "शनी" }, element: { en: "Air", hi: "वायु", mr: "वायू" }, deity: { en: "Lord Shiva", hi: "भगवान शिव", mr: "भगवान शिव" }, color: "#00BCD4",
    pujas: { en: ["Shiv Puja", "Shani Shanti", "Rudrabhishek"], hi: ["शिव पूजा", "शनि शांति", "रुद्राभिषेक"], mr: ["शिव पूजा", "शनी शांती", "रुद्राभिषेक"] },
    advice: { en: "Worship Lord Shiva on Mondays and Saturdays. Wear amethyst.", hi: "सोमवार और शनिवार को शिव पूजा करें। नीलम धारण करें।", mr: "सोमवार आणि शनिवारी शिव पूजा करा. नीलम धारण करा." } },
  { id: 11, en: "Pisces", hi: "मीन", mr: "मीन", symbol: "♓", planet: { en: "Jupiter", hi: "बृहस्पति", mr: "बृहस्पती" }, element: { en: "Water", hi: "जल", mr: "जल" }, deity: { en: "Lord Vishnu", hi: "भगवान विष्णु", mr: "भगवान विष्णू" }, color: "#3F51B5",
    pujas: { en: ["Vishnu Puja", "Guru Shanti", "Satyanarayan Puja"], hi: ["विष्णु पूजा", "गुरु शांति", "सत्यनारायण पूजा"], mr: ["विष्णू पूजा", "गुरू शांती", "सत्यनारायण पूजा"] },
    advice: { en: "Worship Lord Vishnu on Thursdays. Wear yellow sapphire.", hi: "गुरुवार को विष्णु पूजा करें। पुखराज धारण करें।", mr: "गुरुवारी विष्णू पूजा करा. पुष्कराज धारण करा." } },
];

const NAKSHATRAS = [
  { en: "Ashwini", hi: "अश्विनी", mr: "अश्विनी" }, { en: "Bharani", hi: "भरणी", mr: "भरणी" },
  { en: "Krittika", hi: "कृत्तिका", mr: "कृत्तिका" }, { en: "Rohini", hi: "रोहिणी", mr: "रोहिणी" },
  { en: "Mrigashira", hi: "मृगशिरा", mr: "मृगशीर्ष" }, { en: "Ardra", hi: "आर्द्रा", mr: "आर्द्रा" },
  { en: "Punarvasu", hi: "पुनर्वसु", mr: "पुनर्वसू" }, { en: "Pushya", hi: "पुष्य", mr: "पुष्य" },
  { en: "Ashlesha", hi: "अश्लेषा", mr: "आश्लेषा" }, { en: "Magha", hi: "मघा", mr: "मघा" },
  { en: "P.Phalguni", hi: "पूर्व फाल्गुनी", mr: "पूर्व फाल्गुनी" }, { en: "U.Phalguni", hi: "उत्तर फाल्गुनी", mr: "उत्तर फाल्गुनी" },
  { en: "Hasta", hi: "हस्त", mr: "हस्त" }, { en: "Chitra", hi: "चित्रा", mr: "चित्रा" },
  { en: "Swati", hi: "स्वाति", mr: "स्वाती" }, { en: "Vishakha", hi: "विशाखा", mr: "विशाखा" },
  { en: "Anuradha", hi: "अनुराधा", mr: "अनुराधा" }, { en: "Jyeshtha", hi: "ज्येष्ठा", mr: "ज्येष्ठा" },
  { en: "Moola", hi: "मूल", mr: "मूळ" }, { en: "P.Ashadha", hi: "पूर्वाषाढा", mr: "पूर्वाषाढा" },
  { en: "U.Ashadha", hi: "उत्तराषाढा", mr: "उत्तराषाढा" }, { en: "Shravana", hi: "श्रवण", mr: "श्रवण" },
  { en: "Dhanishta", hi: "धनिष्ठा", mr: "धनिष्ठा" }, { en: "Shatabhisha", hi: "शतभिषा", mr: "शतभिषा" },
  { en: "P.Bhadrapada", hi: "पूर्व भाद्रपद", mr: "पूर्व भाद्रपदा" }, { en: "U.Bhadrapada", hi: "उत्तर भाद्रपद", mr: "उत्तर भाद्रपदा" },
  { en: "Revati", hi: "रेवती", mr: "रेवती" },
];

const CITIES = [
  { name: "Mumbai", lat: 19.076, lng: 72.877 }, { name: "Pune", lat: 18.520, lng: 73.856 },
  { name: "Kolhapur", lat: 16.705, lng: 74.243 }, { name: "Nashik", lat: 19.997, lng: 73.790 },
  { name: "Nagpur", lat: 21.146, lng: 79.088 }, { name: "Aurangabad", lat: 19.876, lng: 75.343 },
  { name: "Solapur", lat: 17.659, lng: 75.910 }, { name: "Thane", lat: 19.218, lng: 72.978 },
  { name: "Sangli", lat: 16.854, lng: 74.564 }, { name: "Satara", lat: 17.680, lng: 74.000 },
  { name: "Delhi", lat: 28.613, lng: 77.209 }, { name: "Bangalore", lat: 12.971, lng: 77.594 },
  { name: "Hyderabad", lat: 17.385, lng: 78.486 }, { name: "Chennai", lat: 13.082, lng: 80.270 },
  { name: "Kolkata", lat: 22.572, lng: 88.363 }, { name: "Ahmedabad", lat: 23.022, lng: 72.571 },
  { name: "Jaipur", lat: 26.912, lng: 75.787 }, { name: "Varanasi", lat: 25.317, lng: 83.010 },
  { name: "Lucknow", lat: 26.846, lng: 80.946 }, { name: "Indore", lat: 22.719, lng: 75.857 },
  { name: "Bhopal", lat: 23.259, lng: 77.412 }, { name: "Goa", lat: 15.299, lng: 74.123 },
  { name: "Gulbarga", lat: 17.329, lng: 76.834 }, { name: "Navi Mumbai", lat: 19.033, lng: 73.029 },
  { name: "Chandigarh", lat: 30.733, lng: 76.779 },
];

// Western sun sign from month/day
function getWesternRashi(month, day) {
  if ((month===3 && day>=21)||(month===4 && day<=19)) return 0;
  if ((month===4 && day>=20)||(month===5 && day<=20)) return 1;
  if ((month===5 && day>=21)||(month===6 && day<=20)) return 2;
  if ((month===6 && day>=21)||(month===7 && day<=22)) return 3;
  if ((month===7 && day>=23)||(month===8 && day<=22)) return 4;
  if ((month===8 && day>=23)||(month===9 && day<=22)) return 5;
  if ((month===9 && day>=23)||(month===10 && day<=22)) return 6;
  if ((month===10 && day>=23)||(month===11 && day<=21)) return 7;
  if ((month===11 && day>=22)||(month===12 && day<=21)) return 8;
  if ((month===12 && day>=22)||(month===1 && day<=19)) return 9;
  if ((month===1 && day>=20)||(month===2 && day<=18)) return 10;
  return 11; // Pisces
}

// ─── Panchang ───
const VAARS = [
  { en: "Sunday", hi: "रविवार", mr: "रविवार", deity: { en: "Surya", hi: "सूर्य", mr: "सूर्य" } },
  { en: "Monday", hi: "सोमवार", mr: "सोमवार", deity: { en: "Chandra", hi: "चंद्र", mr: "चंद्र" } },
  { en: "Tuesday", hi: "मंगलवार", mr: "मंगळवार", deity: { en: "Mangal", hi: "मंगल", mr: "मंगळ" } },
  { en: "Wednesday", hi: "बुधवार", mr: "बुधवार", deity: { en: "Budh", hi: "बुध", mr: "बुध" } },
  { en: "Thursday", hi: "गुरुवार", mr: "गुरुवार", deity: { en: "Guru", hi: "बृहस्पति", mr: "बृहस्पती" } },
  { en: "Friday", hi: "शुक्रवार", mr: "शुक्रवार", deity: { en: "Shukra", hi: "शुक्र", mr: "शुक्र" } },
  { en: "Saturday", hi: "शनिवार", mr: "शनिवार", deity: { en: "Shani", hi: "शनि", mr: "शनी" } },
];
const TITHIS = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima/Amavasya"];

function getPanchang(date) {
  const jd = dateToJD(date.getFullYear(), date.getMonth()+1, date.getDate(), 12);
  const moonLng = getSiderealMoonLongitude(jd);
  const nIdx = Math.floor(moonLng / (360/27)) % 27;
  const newMoon = new Date(2026, 0, 29);
  const daysSinceNew = Math.floor((date - newMoon) / 86400000);
  const lunarDay = ((daysSinceNew % 29.53) + 29.53) % 29.53;
  const tithiIdx = Math.floor(lunarDay / 2) % 15;
  const paksha = lunarDay < 15 ? "shukla" : "krishna";
  const rahuKaal = ["4:30-6:00 PM","7:30-9:00 AM","3:00-4:30 PM","12:00-1:30 PM","1:30-3:00 PM","10:30-12:00 PM","9:00-10:30 AM"];
  return { vaar: VAARS[date.getDay()], tithi: TITHIS[tithiIdx], paksha, nakshatra: NAKSHATRAS[nIdx], rahuKaal: rahuKaal[date.getDay()] };
}

// ─── Festivals ───
const FESTIVALS_2026 = [
  { date: "2026-01-14", name: { en: "Makar Sankranti", hi: "मकर संक्रांति", mr: "मकर संक्रांती" }, type: "major", desc: { en: "Sun enters Capricorn.", hi: "सूर्य मकर राशि में।", mr: "सूर्य मकर राशीत." } },
  { date: "2026-02-26", name: { en: "Maha Shivaratri", hi: "महा शिवरात्रि", mr: "महा शिवरात्री" }, type: "major", desc: { en: "Night of Lord Shiva.", hi: "शिव की रात्रि।", mr: "शिवाची रात्र." } },
  { date: "2026-03-10", name: { en: "Holi", hi: "होली", mr: "होळी" }, type: "major", desc: { en: "Festival of colors.", hi: "रंगों का त्योहार।", mr: "रंगांचा सण." } },
  { date: "2026-03-28", name: { en: "Gudi Padwa", hi: "गुड़ी पड़वा", mr: "गुढीपाडवा" }, type: "major", desc: { en: "Marathi New Year.", hi: "मराठी नववर्ष।", mr: "मराठी नववर्ष." } },
  { date: "2026-07-11", name: { en: "Guru Purnima", hi: "गुरु पूर्णिमा", mr: "गुरू पौर्णिमा" }, type: "datta", desc: { en: "Honor the Guru. Datta Sampradaya.", hi: "गुरु सम्मान। दत्त संप्रदाय।", mr: "गुरू सन्मान. दत्त संप्रदाय." } },
  { date: "2026-08-22", name: { en: "Ganesh Chaturthi", hi: "गणेश चतुर्थी", mr: "गणेश चतुर्थी" }, type: "major", desc: { en: "Lord Ganesha festival.", hi: "गणेश उत्सव।", mr: "गणेशोत्सव." } },
  { date: "2026-10-02", name: { en: "Navratri", hi: "नवरात्रि", mr: "नवरात्री" }, type: "major", desc: { en: "Nine nights of worship.", hi: "नौ रातों की पूजा।", mr: "नऊ रात्रींची पूजा." } },
  { date: "2026-10-31", name: { en: "Diwali", hi: "दीवाली", mr: "दिवाळी" }, type: "major", desc: { en: "Festival of lights.", hi: "दीपों का त्योहार।", mr: "दिव्यांचा सण." } },
  { date: "2026-12-05", name: { en: "Datta Jayanti", hi: "दत्त जयंती", mr: "दत्त जयंती" }, type: "datta", desc: { en: "Birthday of Lord Dattatreya.", hi: "दत्तात्रेय जन्मदिन।", mr: "दत्तात्रेय जन्मदिवस." } },
];

// ─── Main Component ───
export function SpiritualTools() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState("panchang");
  const tabs = [{ key: "panchang", label: t("panchang", lang) }, { key: "rashi", label: t("rashi", lang) }, { key: "festivals", label: t("festivals", lang) }, { key: "muhurat", label: t("muhurat", lang) }];
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "0 0 8px" }}>{t("toolsTitle", lang)}</h2>
        <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light }}>{t("toolsSubtitle", lang)}</p>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {tabs.map(tab => <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${activeTab === tab.key ? C.saffron : C.border}`, cursor: "pointer", background: activeTab === tab.key ? C.saffronLight : "#fff", color: activeTab === tab.key ? C.saffron : C.mid }}>{tab.label}</button>)}
      </div>
      {activeTab === "panchang" && <PanchangView lang={lang} />}
      {activeTab === "rashi" && <RashiView lang={lang} />}
      {activeTab === "festivals" && <FestivalView lang={lang} />}
      {activeTab === "muhurat" && <MuhuratView lang={lang} />}
    </div>
  );
}

// ─── Panchang ───
function PanchangView({ lang }) {
  const today = new Date();
  const p = getPanchang(today);
  const pk = p.paksha === "shukla" ? { en: "Shukla Paksha", hi: "शुक्ल पक्ष", mr: "शुक्ल पक्ष" } : { en: "Krishna Paksha", hi: "कृष्ण पक्ष", mr: "कृष्ण पक्ष" };
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontFamily: font, fontSize: 20, color: C.maroon, margin: "0 0 4px" }}>{today.toLocaleDateString(lang === "en" ? "en-IN" : "hi-IN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          { icon: "📅", lbl: { en: "Day", hi: "वार", mr: "वार" }, val: p.vaar[lang]||p.vaar.en, sub: p.vaar.deity[lang]||p.vaar.deity.en },
          { icon: "🌙", lbl: { en: "Tithi", hi: "तिथि", mr: "तिथी" }, val: p.tithi, sub: pk[lang]||pk.en },
          { icon: "⭐", lbl: { en: "Nakshatra", hi: "नक्षत्र", mr: "नक्षत्र" }, val: p.nakshatra[lang]||p.nakshatra.en },
          { icon: "⚠️", lbl: { en: "Rahu Kaal", hi: "राहु काल", mr: "राहू काळ" }, val: p.rahuKaal },
        ].map(item => (
          <div key={item.icon} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
            <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: "0 0 4px", textTransform: "uppercase" }}>{item.lbl[lang]||item.lbl.en}</p>
            <p style={{ fontFamily: font, fontSize: 18, color: C.dark, margin: "0 0 2px", fontWeight: 600 }}>{item.val}</p>
            {item.sub && <p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: 0 }}>{item.sub}</p>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "14px 18px", background: C.goldLight, borderRadius: 10, fontFamily: sansFont, fontSize: 12, color: C.mid, textAlign: "center" }}>
        ⚠️ {lang === "en" ? "Approximate calculation. Consult a priest for precise panchang." : lang === "hi" ? "अनुमानित गणना। सटीक पंचांग हेतु पंडित जी से संपर्क करें।" : "अंदाजे गणन. अचूक पंचांगासाठी पंडितजींशी संपर्क करा."}
      </div>
    </div>
  );
}

// ─── Rashi (Vedic + Western) ───
function RashiView({ lang }) {
  const [system, setSystem] = useState("vedic");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("06:00");
  const [city, setCity] = useState("Mumbai");

  let vedicRashi = null, westernRashi = null, nakshatra = null, pada = null, moonDeg = null;

  if (dob) {
    const d = new Date(dob);
    const m = d.getMonth() + 1, day = d.getDate(), yr = d.getFullYear();
    westernRashi = RASHIS[getWesternRashi(m, day)];

    const [h, min] = tob.split(":").map(Number);
    const hours = h + min / 60;
    const cityData = CITIES.find(c => c.name === city) || CITIES[0];
    // Convert local time to UT: IST is UTC+5:30
    const utHours = hours - 5.5;
    const jd = dateToJD(yr, m, day, utHours);
    moonDeg = getSiderealMoonLongitude(jd);
    const vIdx = Math.floor(moonDeg / 30) % 12;
    vedicRashi = RASHIS[vIdx];
    const nIdx = Math.floor(moonDeg / (360 / 27)) % 27;
    nakshatra = NAKSHATRAS[nIdx];
    pada = Math.floor((moonDeg % (360 / 27)) / (360 / 27 / 4)) + 1;
  }

  const activeRashi = system === "vedic" ? vedicRashi : westernRashi;

  return (
    <div>
      <div style={{ display: "flex", gap: 4, background: C.cream, borderRadius: 10, padding: 4, marginBottom: 20, maxWidth: 420 }}>
        <button onClick={() => setSystem("vedic")} style={{ flex: 1, fontFamily: sansFont, fontSize: 13, fontWeight: 600, padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: system === "vedic" ? C.saffron : "transparent", color: system === "vedic" ? "#fff" : C.mid }}>
          🌙 {lang === "en" ? "Vedic (Moon Sign)" : lang === "hi" ? "वैदिक (चंद्र राशि)" : "वैदिक (चंद्र राशी)"}
        </button>
        <button onClick={() => setSystem("western")} style={{ flex: 1, fontFamily: sansFont, fontSize: 13, fontWeight: 600, padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: system === "western" ? C.saffron : "transparent", color: system === "western" ? "#fff" : C.mid }}>
          ☀️ {lang === "en" ? "Western (Sun Sign)" : lang === "hi" ? "पश्चिमी (सूर्य राशि)" : "पश्चिमी (सूर्य राशी)"}
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", border: `1px solid ${C.border}`, marginBottom: 20 }}>
        <h3 style={{ fontFamily: font, fontSize: 18, color: C.saffron, margin: "0 0 14px" }}>
          {system === "vedic" ? (lang === "en" ? "🌙 Find Your Vedic Moon Sign" : lang === "hi" ? "🌙 वैदिक चंद्र राशि जानें" : "🌙 वैदिक चंद्र राशी जाणा") : (lang === "en" ? "☀️ Find Your Western Sun Sign" : lang === "hi" ? "☀️ पश्चिमी सूर्य राशि" : "☀️ पश्चिमी सूर्य राशी")}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: system === "vedic" ? "1fr 1fr 1fr" : "1fr", gap: 14 }}>
          <div>
            <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>{lang === "en" ? "Date of Birth *" : lang === "hi" ? "जन्म तिथि *" : "जन्मतारीख *"}</label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle} />
          </div>
          {system === "vedic" && <>
            <div>
              <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>{lang === "en" ? "Time of Birth *" : lang === "hi" ? "जन्म समय *" : "जन्मवेळ *"}</label>
              <input type="time" value={tob} onChange={e => setTob(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>{lang === "en" ? "Place of Birth *" : lang === "hi" ? "जन्म स्थान *" : "जन्मस्थान *"}</label>
              <select value={city} onChange={e => setCity(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>{CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
            </div>
          </>}
        </div>
        {system === "vedic" && <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, marginTop: 8 }}>{lang === "en" ? "Accurate birth time is crucial for Vedic moon sign" : lang === "hi" ? "वैदिक चंद्र राशि के लिए सटीक जन्म समय आवश्यक" : "वैदिक चंद्र राशीसाठी अचूक जन्मवेळ आवश्यक"}</p>}
      </div>

      {activeRashi && (
        <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(135deg, ${activeRashi.color}22, ${activeRashi.color}11)`, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 48 }}>{activeRashi.symbol}</span>
              <div>
                <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>
                  {system === "vedic" ? (lang === "en" ? "Vedic Moon Sign (Chandra Rashi)" : lang === "hi" ? "वैदिक चंद्र राशि" : "वैदिक चंद्र राशी") : (lang === "en" ? "Western Sun Sign" : lang === "hi" ? "पश्चिमी सूर्य राशि" : "पश्चिमी सूर्य राशी")}
                </p>
                <h3 style={{ fontFamily: font, fontSize: 24, color: C.dark, margin: "0 0 4px" }}>{activeRashi[lang] || activeRashi.en}</h3>
                <p style={{ fontFamily: sansFont, fontSize: 14, color: C.mid, margin: 0 }}>
                  {lang === "en" ? `Planet: ${activeRashi.planet.en} • Element: ${activeRashi.element.en}` : lang === "hi" ? `ग्रह: ${activeRashi.planet.hi} • तत्व: ${activeRashi.element.hi}` : `ग्रह: ${activeRashi.planet.mr} • तत्त्व: ${activeRashi.element.mr}`}
                </p>
              </div>
            </div>
            {system === "vedic" && nakshatra && (
              <div style={{ marginTop: 14, display: "flex", gap: 14, flexWrap: "wrap" }}>
                <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 16px" }}>
                  <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px" }}>⭐ {lang === "en" ? "Nakshatra" : "नक्षत्र"}</p>
                  <p style={{ fontFamily: font, fontSize: 16, color: C.dark, margin: 0, fontWeight: 600 }}>{nakshatra[lang] || nakshatra.en}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 16px" }}>
                  <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px" }}>{lang === "en" ? "Pada" : "पाद"}</p>
                  <p style={{ fontFamily: font, fontSize: 16, color: C.dark, margin: 0, fontWeight: 600 }}>{pada}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 16px" }}>
                  <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px" }}>{lang === "en" ? "Moon at" : lang === "hi" ? "चंद्र स्थिति" : "चंद्र स्थिती"}</p>
                  <p style={{ fontFamily: sansFont, fontSize: 14, color: C.dark, margin: 0, fontWeight: 600 }}>{moonDeg.toFixed(2)}°</p>
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: "20px 28px" }}>
            {system === "vedic" && westernRashi && westernRashi.id !== vedicRashi.id && (
              <div style={{ marginBottom: 16, padding: "12px 16px", background: C.cream, borderRadius: 10, fontFamily: sansFont, fontSize: 13, color: C.mid }}>
                ☀️ {lang === "en" ? `Western Sun Sign: ${westernRashi.en} (${westernRashi.symbol})` : lang === "hi" ? `पश्चिमी सूर्य राशि: ${westernRashi.hi} (${westernRashi.symbol})` : `पश्चिमी सूर्य राशी: ${westernRashi.mr} (${westernRashi.symbol})`}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, color: C.saffron, margin: "0 0 8px" }}>🛕 {lang === "en" ? "Presiding Deity" : "अधिष्ठाता देवता"}</h4>
              <p style={{ fontFamily: font, fontSize: 16, color: C.dark, margin: 0 }}>{activeRashi.deity[lang] || activeRashi.deity.en}</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, color: C.saffron, margin: "0 0 8px" }}>🪔 {lang === "en" ? "Recommended Pujas" : lang === "hi" ? "अनुशंसित पूजाएं" : "शिफारस केलेल्या पूजा"}</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(activeRashi.pujas[lang] || activeRashi.pujas.en).map(p => <span key={p} style={{ fontFamily: sansFont, fontSize: 13, padding: "8px 14px", borderRadius: 8, background: C.saffronLight, color: C.saffron, fontWeight: 600 }}>{p}</span>)}
              </div>
            </div>
            <div style={{ padding: "14px 18px", background: C.goldLight, borderRadius: 10 }}>
              <h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, color: C.maroon, margin: "0 0 6px" }}>💡 {lang === "en" ? "Spiritual Advice" : lang === "hi" ? "आध्यात्मिक सलाह" : "आध्यात्मिक सल्ला"}</h4>
              <p style={{ fontFamily: sansFont, fontSize: 14, color: C.mid, margin: 0, lineHeight: 1.6 }}>{activeRashi.advice[lang] || activeRashi.advice.en}</p>
            </div>
          </div>
        </div>
      )}
      {!dob && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          {RASHIS.map(r => <div key={r.id} style={{ background: "#fff", borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, textAlign: "center" }}><span style={{ fontSize: 32, display: "block", marginBottom: 6 }}>{r.symbol}</span><p style={{ fontFamily: font, fontSize: 14, color: C.dark, margin: 0, fontWeight: 600 }}>{r[lang]||r.en}</p><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "2px 0 0" }}>{r.planet[lang]||r.planet.en}</p></div>)}
        </div>
      )}
      <div style={{ marginTop: 16, padding: "14px 18px", background: C.goldLight, borderRadius: 10, fontFamily: sansFont, fontSize: 12, color: C.mid, textAlign: "center" }}>
        ⚠️ {lang === "en" ? "Approximate calculation using Meeus algorithm. For precise kundli, consult a Vedic astrologer." : lang === "hi" ? "मीयस एल्गोरिदम द्वारा अनुमानित गणना। सटीक कुंडली के लिए ज्योतिषी से संपर्क करें।" : "मीयस अल्गोरिदमद्वारे अंदाजे गणन. अचूक कुंडलीसाठी ज्योतिषाशी संपर्क करा."}
      </div>
    </div>
  );
}

// ─── Festivals ───
function FestivalView({ lang }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = FESTIVALS_2026.filter(f => new Date(f.date) >= today);
  return (
    <div>
      <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: "0 0 16px" }}>{lang === "en" ? "🎪 Upcoming Festivals 2026" : lang === "hi" ? "🎪 आगामी त्योहार 2026" : "🎪 आगामी सण 2026"}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {upcoming.map(f => { const fd = new Date(f.date); const dl = Math.ceil((fd-today)/86400000); return (
          <div key={f.date} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: `1px solid ${f.type === "datta" ? C.gold : C.border}`, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "center", minWidth: 50 }}><p style={{ fontFamily: sansFont, fontSize: 22, fontWeight: 700, color: f.type === "datta" ? C.saffron : C.maroon, margin: 0 }}>{fd.getDate()}</p><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: 0 }}>{fd.toLocaleDateString(lang === "en" ? "en-IN" : "hi-IN", { month: "short" })}</p></div>
            <div style={{ flex: 1 }}><h4 style={{ fontFamily: font, fontSize: 15, color: C.dark, margin: "0 0 3px" }}>{f.name[lang]||f.name.en}</h4><p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: 0 }}>{f.desc[lang]||f.desc.en}</p></div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>{f.type === "datta" && <span style={{ fontFamily: sansFont, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: C.goldLight, color: C.gold, display: "block", marginBottom: 4 }}>दत्त</span>}<span style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, color: dl <= 7 ? C.saffron : C.light }}>{dl === 0 ? "Today!" : `${dl}d`}</span></div>
          </div>
        );})}
      </div>
    </div>
  );
}

// ─── Muhurat ───
function MuhuratView({ lang }) {
  const events = [
    { event: { en: "Marriage", hi: "विवाह", mr: "लग्न" }, months: { en: "Nov-Feb, Apr-May", hi: "नव-फर, अप्र-मई", mr: "नोव्हें-फेब्रु, एप्रि-मे" }, days: { en: "Mon,Wed,Thu,Fri", hi: "सोम,बुध,गुरु,शुक्र", mr: "सोम,बुध,गुरु,शुक्र" }, tithis: { en: "2,3,5,7,10,11,13", hi: "२,३,५,७,१०,११,१३", mr: "२,३,५,७,१०,११,१३" }, icon: "💍" },
    { event: { en: "Gruhapravesh", hi: "गृहप्रवेश", mr: "गृहप्रवेश" }, months: { en: "Jan-Jun (Uttarayan)", hi: "जन-जून (उत्तरायण)", mr: "जाने-जून (उत्तरायण)" }, days: { en: "Mon,Wed,Thu,Fri", hi: "सोम,बुध,गुरु,शुक्र", mr: "सोम,बुध,गुरु,शुक्र" }, tithis: { en: "2,3,5,7,10,11", hi: "२,३,५,७,१०,११", mr: "२,३,५,७,१०,११" }, icon: "🏠" },
    { event: { en: "New Business", hi: "नया व्यापार", mr: "नवीन व्यवसाय" }, months: { en: "Any, check tithi", hi: "कोई भी, तिथि देखें", mr: "कोणताही, तिथी पहा" }, days: { en: "Wed,Thu,Fri", hi: "बुध,गुरु,शुक्र", mr: "बुध,गुरु,शुक्र" }, tithis: { en: "2,3,5,7,10,11", hi: "२,३,५,७,१०,११", mr: "२,३,५,७,१०,११" }, icon: "💼" },
    { event: { en: "Vehicle Purchase", hi: "वाहन खरीद", mr: "वाहन खरेदी" }, months: { en: "Any auspicious", hi: "कोई भी शुभ", mr: "कोणताही शुभ" }, days: { en: "Tue,Wed,Thu", hi: "मंगल,बुध,गुरु", mr: "मंगळ,बुध,गुरु" }, tithis: { en: "2,3,5,7,10", hi: "२,३,५,७,१०", mr: "२,३,५,७,१०" }, icon: "🚗" },
    { event: { en: "Namkaran", hi: "नामकरण", mr: "बारसे" }, months: { en: "11th-12th day", hi: "11-12वें दिन", mr: "११-१२ वा दिवस" }, days: { en: "Mon,Wed,Thu,Fri", hi: "सोम,बुध,गुरु,शुक्र", mr: "सोम,बुध,गुरु,शुक्र" }, tithis: { en: "2,3,5,7,10,11", hi: "२,३,५,७,१०,११", mr: "२,३,५,७,१०,११" }, icon: "👶" },
    { event: { en: "Gold Purchase", hi: "सोना खरीद", mr: "सोने खरेदी" }, months: { en: "Akshaya Tritiya, Dhanteras", hi: "अक्षय तृतीया, धनतेरस", mr: "अक्षय तृतीया, धनत्रयोदशी" }, days: { en: "Any festival day", hi: "त्योहार के दिन", mr: "सणाच्या दिवशी" }, tithis: { en: "Shukla Paksha", hi: "शुक्ल पक्ष", mr: "शुक्ल पक्ष" }, icon: "💎" },
  ];
  return (
    <div>
      <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: "0 0 6px" }}>🕉️ {lang === "en" ? "Auspicious Times" : "शुभ मुहूर्त"}</h3>
      <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: "0 0 20px" }}>{lang === "en" ? "General guidelines. Consult a priest for exact muhurat." : lang === "hi" ? "सामान्य मार्गदर्शन। सटीक मुहूर्त हेतु पंडित जी से संपर्क करें।" : "सामान्य मार्गदर्शन. अचूक मुहूर्तासाठी पंडितजींशी संपर्क करा."}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {events.map(ev => (
          <div key={ev.icon} style={{ background: "#fff", borderRadius: 14, padding: "18px 22px", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}><span style={{ fontSize: 28 }}>{ev.icon}</span><h4 style={{ fontFamily: font, fontSize: 16, color: C.dark, margin: 0 }}>{ev.event[lang]||ev.event.en}</h4></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px" }}>📅 {lang === "en" ? "Months" : "महीने"}</p><p style={{ fontFamily: sansFont, fontSize: 13, color: C.mid, margin: 0 }}>{ev.months[lang]||ev.months.en}</p></div>
              <div><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px" }}>📆 {lang === "en" ? "Days" : "दिवस"}</p><p style={{ fontFamily: sansFont, fontSize: 13, color: C.mid, margin: 0 }}>{ev.days[lang]||ev.days.en}</p></div>
              <div><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px" }}>🌙 {lang === "en" ? "Tithis" : "तिथि"}</p><p style={{ fontFamily: sansFont, fontSize: 13, color: C.mid, margin: 0 }}>{ev.tithis[lang]||ev.tithis.en}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
