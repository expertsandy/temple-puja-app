import { useState } from "react";
import { useLang } from "./LangContext.jsx";

const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4", success: "#2d7a4f", successBg: "#e8f5ee" };
const inputStyle = { fontFamily: sansFont, fontSize: 14, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, width: "100%", boxSizing: "border-box", outline: "none", color: C.dark, background: "#fff" };

// ─── Translations ───
const st = {
  toolsTitle: { en: "🔮 Spiritual Tools", hi: "🔮 आध्यात्मिक उपकरण", mr: "🔮 आध्यात्मिक साधने" },
  toolsSubtitle: { en: "Explore your spiritual journey with these tools", hi: "इन उपकरणों से अपनी आध्यात्मिक यात्रा का अन्वेषण करें", mr: "या साधनांनी तुमचा आध्यात्मिक प्रवास शोधा" },
  panchang: { en: "📅 Panchang", hi: "📅 पंचांग", mr: "📅 पंचांग" },
  rashi: { en: "♈ Rashi & Puja", hi: "♈ राशि और पूजा", mr: "♈ राशी आणि पूजा" },
  festivals: { en: "🎪 Festivals", hi: "🎪 त्योहार", mr: "🎪 सण" },
  muhurat: { en: "🕉️ Muhurat", hi: "🕉️ मुहूर्त", mr: "🕉️ मुहूर्त" },
};
function t(key, lang) { return st[key]?.[lang] || st[key]?.["en"] || key; }

// ─── Rashi Data (used by both Vedic & Western) ───
const RASHIS = [
  { id: 0, en: "Aries", hi: "मेष", mr: "मेष", symbol: "♈", planet: { en: "Mars", hi: "मंगल", mr: "मंगळ" }, element: { en: "Fire", hi: "अग्नि", mr: "अग्नी" }, deity: { en: "Lord Hanuman", hi: "हनुमान जी", mr: "हनुमान" }, color: "#FF4444",
    pujas: { en: ["Hanuman Puja", "Mangal Shanti", "Rudrabhishek"], hi: ["हनुमान पूजा", "मंगल शांति", "रुद्राभिषेक"], mr: ["हनुमान पूजा", "मंगळ शांती", "रुद्राभिषेक"] },
    advice: { en: "Chant Hanuman Chalisa on Tuesdays. Wear red coral for strength.", hi: "मंगलवार को हनुमान चालीसा पढ़ें। शक्ति के लिए मूंगा धारण करें।", mr: "मंगळवारी हनुमान चालीसा म्हणा. शक्तीसाठी मूंगा धारण करा." } },
  { id: 1, en: "Taurus", hi: "वृषभ", mr: "वृषभ", symbol: "♉", planet: { en: "Venus", hi: "शुक्र", mr: "शुक्र" }, element: { en: "Earth", hi: "पृथ्वी", mr: "पृथ्वी" }, deity: { en: "Goddess Lakshmi", hi: "लक्ष्मी माता", mr: "लक्ष्मी माता" }, color: "#4CAF50",
    pujas: { en: ["Lakshmi Puja", "Shukra Shanti", "Satyanarayan Puja"], hi: ["लक्ष्मी पूजा", "शुक्र शांति", "सत्यनारायण पूजा"], mr: ["लक्ष्मी पूजा", "शुक्र शांती", "सत्यनारायण पूजा"] },
    advice: { en: "Worship Goddess Lakshmi on Fridays. Wear diamond or opal.", hi: "शुक्रवार को लक्ष्मी माता की पूजा करें। हीरा या ओपल धारण करें।", mr: "शुक्रवारी लक्ष्मी मातेची पूजा करा. हिरा किंवा ओपल धारण करा." } },
  { id: 2, en: "Gemini", hi: "मिथुन", mr: "मिथुन", symbol: "♊", planet: { en: "Mercury", hi: "बुध", mr: "बुध" }, element: { en: "Air", hi: "वायु", mr: "वायू" }, deity: { en: "Lord Vishnu", hi: "भगवान विष्णु", mr: "भगवान विष्णू" }, color: "#FFD700",
    pujas: { en: ["Vishnu Puja", "Budh Shanti", "Dattatreya Puja"], hi: ["विष्णु पूजा", "बुध शांति", "दत्तात्रेय पूजा"], mr: ["विष्णू पूजा", "बुध शांती", "दत्तात्रेय पूजा"] },
    advice: { en: "Chant Vishnu Sahasranama on Wednesdays. Wear emerald.", hi: "बुधवार को विष्णु सहस्रनाम पढ़ें। पन्ना धारण करें।", mr: "बुधवारी विष्णू सहस्रनाम म्हणा. पाचू धारण करा." } },
  { id: 3, en: "Cancer", hi: "कर्क", mr: "कर्क", symbol: "♋", planet: { en: "Moon", hi: "चंद्र", mr: "चंद्र" }, element: { en: "Water", hi: "जल", mr: "जल" }, deity: { en: "Lord Shiva", hi: "भगवान शिव", mr: "भगवान शिव" }, color: "#90CAF9",
    pujas: { en: ["Shiv Abhishek", "Chandra Shanti", "Rudrabhishek"], hi: ["शिव अभिषेक", "चंद्र शांति", "रुद्राभिषेक"], mr: ["शिव अभिषेक", "चंद्र शांती", "रुद्राभिषेक"] },
    advice: { en: "Offer water to Shivling on Mondays. Wear pearl or moonstone.", hi: "सोमवार को शिवलिंग पर जल चढ़ाएं। मोती धारण करें।", mr: "सोमवारी शिवलिंगावर जल अर्पण करा. मोती धारण करा." } },
  { id: 4, en: "Leo", hi: "सिंह", mr: "सिंह", symbol: "♌", planet: { en: "Sun", hi: "सूर्य", mr: "सूर्य" }, element: { en: "Fire", hi: "अग्नि", mr: "अग्नी" }, deity: { en: "Lord Surya", hi: "सूर्य देव", mr: "सूर्य देव" }, color: "#FF9800",
    pujas: { en: ["Surya Puja", "Aditya Hridayam", "Rudrabhishek"], hi: ["सूर्य पूजा", "आदित्य हृदयम", "रुद्राभिषेक"], mr: ["सूर्य पूजा", "आदित्य हृदयम", "रुद्राभिषेक"] },
    advice: { en: "Offer water to Sun at sunrise. Wear ruby.", hi: "सूर्योदय पर सूर्य को जल अर्पित करें। माणिक्य धारण करें।", mr: "सूर्योदयावेळी सूर्याला जल अर्पण करा. माणिक धारण करा." } },
  { id: 5, en: "Virgo", hi: "कन्या", mr: "कन्या", symbol: "♍", planet: { en: "Mercury", hi: "बुध", mr: "बुध" }, element: { en: "Earth", hi: "पृथ्वी", mr: "पृथ्वी" }, deity: { en: "Lord Ganesha", hi: "गणेश जी", mr: "गणेश" }, color: "#8BC34A",
    pujas: { en: ["Ganesh Puja", "Budh Shanti", "Ganapati Atharvashirsha"], hi: ["गणेश पूजा", "बुध शांति", "गणपति अथर्वशीर्ष"], mr: ["गणेश पूजा", "बुध शांती", "गणपती अथर्वशीर्ष"] },
    advice: { en: "Worship Lord Ganesha on Wednesdays. Wear emerald.", hi: "बुधवार को गणेश जी की पूजा करें। पन्ना धारण करें।", mr: "बुधवारी गणेशपूजा करा. पाचू धारण करा." } },
  { id: 6, en: "Libra", hi: "तुला", mr: "तूळ", symbol: "♎", planet: { en: "Venus", hi: "शुक्र", mr: "शुक्र" }, element: { en: "Air", hi: "वायु", mr: "वायू" }, deity: { en: "Goddess Durga", hi: "दुर्गा माता", mr: "दुर्गा माता" }, color: "#E91E63",
    pujas: { en: ["Durga Puja", "Shukra Shanti", "Navchandi Havan"], hi: ["दुर्गा पूजा", "शुक्र शांति", "नवचंडी हवन"], mr: ["दुर्गा पूजा", "शुक्र शांती", "नवचंडी हवन"] },
    advice: { en: "Worship Goddess Durga on Fridays. Wear diamond or zircon.", hi: "शुक्रवार को दुर्गा माता की पूजा करें। हीरा या जिरकॉन धारण करें।", mr: "शुक्रवारी दुर्गा मातेची पूजा करा. हिरा किंवा झिरकॉन धारण करा." } },
  { id: 7, en: "Scorpio", hi: "वृश्चिक", mr: "वृश्चिक", symbol: "♏", planet: { en: "Mars", hi: "मंगल", mr: "मंगळ" }, element: { en: "Water", hi: "जल", mr: "जल" }, deity: { en: "Lord Hanuman", hi: "हनुमान जी", mr: "हनुमान" }, color: "#B71C1C",
    pujas: { en: ["Hanuman Puja", "Mangal Shanti", "Mahamrityunjaya Japa"], hi: ["हनुमान पूजा", "मंगल शांति", "महामृत्युंजय जप"], mr: ["हनुमान पूजा", "मंगळ शांती", "महामृत्युंजय जप"] },
    advice: { en: "Chant Hanuman Chalisa on Tuesdays. Wear red coral.", hi: "मंगलवार को हनुमान चालीसा पढ़ें। मूंगा धारण करें।", mr: "मंगळवारी हनुमान चालीसा म्हणा. मूंगा धारण करा." } },
  { id: 8, en: "Sagittarius", hi: "धनु", mr: "धनु", symbol: "♐", planet: { en: "Jupiter", hi: "बृहस्पति", mr: "बृहस्पती" }, element: { en: "Fire", hi: "अग्नि", mr: "अग्नी" }, deity: { en: "Lord Dattatreya", hi: "भगवान दत्तात्रेय", mr: "भगवान दत्तात्रेय" }, color: "#9C27B0",
    pujas: { en: ["Dattatreya Puja", "Guru Shanti", "Gurucharitra Parayan"], hi: ["दत्तात्रेय पूजा", "गुरु शांति", "गुरुचरित्र पारायण"], mr: ["दत्तात्रेय पूजा", "गुरू शांती", "गुरुचरित्र पारायण"] },
    advice: { en: "Worship Lord Dattatreya on Thursdays. Wear yellow sapphire.", hi: "गुरुवार को दत्तात्रेय पूजा करें। पुखराज धारण करें।", mr: "गुरुवारी दत्तात्रेय पूजा करा. पुष्कराज धारण करा." } },
  { id: 9, en: "Capricorn", hi: "मकर", mr: "मकर", symbol: "♑", planet: { en: "Saturn", hi: "शनि", mr: "शनी" }, element: { en: "Earth", hi: "पृथ्वी", mr: "पृथ्वी" }, deity: { en: "Lord Shani", hi: "शनि देव", mr: "शनी देव" }, color: "#607D8B",
    pujas: { en: ["Shani Puja", "Shani Shanti", "Hanuman Puja"], hi: ["शनि पूजा", "शनि शांति", "हनुमान पूजा"], mr: ["शनी पूजा", "शनी शांती", "हनुमान पूजा"] },
    advice: { en: "Light sesame oil lamp on Saturdays. Wear blue sapphire after consultation.", hi: "शनिवार को तिल तेल का दीपक जलाएं। नीलम विशेषज्ञ की सलाह से धारण करें।", mr: "शनिवारी तीळ तेलाचा दिवा लावा. नीलम तज्ञांच्या सल्ल्याने धारण करा." } },
  { id: 10, en: "Aquarius", hi: "कुंभ", mr: "कुंभ", symbol: "♒", planet: { en: "Saturn", hi: "शनि", mr: "शनी" }, element: { en: "Air", hi: "वायु", mr: "वायू" }, deity: { en: "Lord Shiva", hi: "भगवान शिव", mr: "भगवान शिव" }, color: "#00BCD4",
    pujas: { en: ["Shiv Puja", "Shani Shanti", "Rudrabhishek"], hi: ["शिव पूजा", "शनि शांति", "रुद्राभिषेक"], mr: ["शिव पूजा", "शनी शांती", "रुद्राभिषेक"] },
    advice: { en: "Worship Lord Shiva on Mondays and Saturdays. Wear amethyst.", hi: "सोमवार और शनिवार को शिव पूजा करें। नीलम धारण करें।", mr: "सोमवार आणि शनिवारी शिव पूजा करा. नीलम धारण करा." } },
  { id: 11, en: "Pisces", hi: "मीन", mr: "मीन", symbol: "♓", planet: { en: "Jupiter", hi: "बृहस्पति", mr: "बृहस्पती" }, element: { en: "Water", hi: "जल", mr: "जल" }, deity: { en: "Lord Vishnu", hi: "भगवान विष्णु", mr: "भगवान विष्णू" }, color: "#3F51B5",
    pujas: { en: ["Vishnu Puja", "Guru Shanti", "Satyanarayan Puja"], hi: ["विष्णु पूजा", "गुरु शांति", "सत्यनारायण पूजा"], mr: ["विष्णू पूजा", "गुरू शांती", "सत्यनारायण पूजा"] },
    advice: { en: "Worship Lord Vishnu on Thursdays. Wear yellow sapphire.", hi: "गुरुवार को विष्णु पूजा करें। पुखराज धारण करें।", mr: "गुरुवारी विष्णू पूजा करा. पुष्कराज धारण करा." } },
];

const NAKSHATRAS = [
  { en: "Ashwini", hi: "अश्विनी", mr: "अश्विनी", rashi: 0 },
  { en: "Bharani", hi: "भरणी", mr: "भरणी", rashi: 0 },
  { en: "Krittika", hi: "कृत्तिका", mr: "कृत्तिका", rashi: 0 }, // 1/4 Aries, 3/4 Taurus
  { en: "Rohini", hi: "रोहिणी", mr: "रोहिणी", rashi: 1 },
  { en: "Mrigashira", hi: "मृगशिरा", mr: "मृगशीर्ष", rashi: 1 },
  { en: "Ardra", hi: "आर्द्रा", mr: "आर्द्रा", rashi: 2 },
  { en: "Punarvasu", hi: "पुनर्वसु", mr: "पुनर्वसू", rashi: 2 },
  { en: "Pushya", hi: "पुष्य", mr: "पुष्य", rashi: 3 },
  { en: "Ashlesha", hi: "अश्लेषा", mr: "आश्लेषा", rashi: 3 },
  { en: "Magha", hi: "मघा", mr: "मघा", rashi: 4 },
  { en: "P.Phalguni", hi: "पूर्व फाल्गुनी", mr: "पूर्व फाल्गुनी", rashi: 4 },
  { en: "U.Phalguni", hi: "उत्तर फाल्गुनी", mr: "उत्तर फाल्गुनी", rashi: 4 },
  { en: "Hasta", hi: "हस्त", mr: "हस्त", rashi: 5 },
  { en: "Chitra", hi: "चित्रा", mr: "चित्रा", rashi: 5 },
  { en: "Swati", hi: "स्वाति", mr: "स्वाती", rashi: 6 },
  { en: "Vishakha", hi: "विशाखा", mr: "विशाखा", rashi: 6 },
  { en: "Anuradha", hi: "अनुराधा", mr: "अनुराधा", rashi: 7 },
  { en: "Jyeshtha", hi: "ज्येष्ठा", mr: "ज्येष्ठा", rashi: 7 },
  { en: "Moola", hi: "मूल", mr: "मूळ", rashi: 8 },
  { en: "P.Ashadha", hi: "पूर्वाषाढा", mr: "पूर्वाषाढा", rashi: 8 },
  { en: "U.Ashadha", hi: "उत्तराषाढा", mr: "उत्तराषाढा", rashi: 8 },
  { en: "Shravana", hi: "श्रवण", mr: "श्रवण", rashi: 9 },
  { en: "Dhanishta", hi: "धनिष्ठा", mr: "धनिष्ठा", rashi: 9 },
  { en: "Shatabhisha", hi: "शतभिषा", mr: "शतभिषा", rashi: 10 },
  { en: "P.Bhadrapada", hi: "पूर्व भाद्रपद", mr: "पूर्व भाद्रपदा", rashi: 10 },
  { en: "U.Bhadrapada", hi: "उत्तर भाद्रपद", mr: "उत्तर भाद्रपदा", rashi: 11 },
  { en: "Revati", hi: "रेवती", mr: "रेवती", rashi: 11 },
];

// ─── Major Indian cities with coordinates + timezone offset ───
const CITIES = [
  { name: "Mumbai", lat: 19.076, lng: 72.877 },
  { name: "Delhi", lat: 28.613, lng: 77.209 },
  { name: "Pune", lat: 18.520, lng: 73.856 },
  { name: "Kolhapur", lat: 16.705, lng: 74.243 },
  { name: "Nashik", lat: 19.997, lng: 73.790 },
  { name: "Nagpur", lat: 21.146, lng: 79.088 },
  { name: "Bangalore", lat: 12.971, lng: 77.594 },
  { name: "Hyderabad", lat: 17.385, lng: 78.486 },
  { name: "Chennai", lat: 13.082, lng: 80.270 },
  { name: "Kolkata", lat: 22.572, lng: 88.363 },
  { name: "Ahmedabad", lat: 23.022, lng: 72.571 },
  { name: "Jaipur", lat: 26.912, lng: 75.787 },
  { name: "Varanasi", lat: 25.317, lng: 83.010 },
  { name: "Lucknow", lat: 26.846, lng: 80.946 },
  { name: "Indore", lat: 22.719, lng: 75.857 },
  { name: "Bhopal", lat: 23.259, lng: 77.412 },
  { name: "Chandigarh", lat: 30.733, lng: 76.779 },
  { name: "Goa", lat: 15.299, lng: 74.123 },
  { name: "Aurangabad", lat: 19.876, lng: 75.343 },
  { name: "Gulbarga", lat: 17.329, lng: 76.834 },
  { name: "Solapur", lat: 17.659, lng: 75.910 },
  { name: "Sangli", lat: 16.854, lng: 74.564 },
  { name: "Satara", lat: 17.680, lng: 74.000 },
  { name: "Thane", lat: 19.218, lng: 72.978 },
  { name: "Navi Mumbai", lat: 19.033, lng: 73.029 },
];

// ─── Vedic Moon Sign Calculation (Approximate) ───
// Uses simplified astronomical calculation based on moon's average motion
function calculateMoonLongitude(date, hours, lng) {
  // Reference: Known moon longitude on Jan 1, 2026 00:00 UTC ≈ 150° (approx Leo/Simha)
  const refDate = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
  const refMoonLng = 150.0; // degrees (approximate)

  // Convert birth date+time to UTC equivalent
  // IST = UTC + 5:30, but we adjust for actual longitude
  const localTimeCorrection = (lng - 82.5) / 15; // hours difference from IST standard meridian
  const utcHours = hours - 5.5 + localTimeCorrection;
  const birthUTC = new Date(date);
  birthUTC.setUTCHours(Math.floor(utcHours), Math.round((utcHours % 1) * 60));

  // Days since reference
  const daysSinceRef = (birthUTC - refDate) / (1000 * 60 * 60 * 24);

  // Moon's average daily motion: 13.176358° per day
  const moonDailyMotion = 13.176358;
  let moonLng = (refMoonLng + daysSinceRef * moonDailyMotion) % 360;
  if (moonLng < 0) moonLng += 360;

  // Ayanamsa correction (Lahiri) for sidereal position
  // Ayanamsa for 2026 ≈ 24.2°
  const year = date.getFullYear();
  const ayanamsa = 23.85 + (year - 2000) * 0.01397; // approximate Lahiri ayanamsa
  let siderealMoonLng = (moonLng - ayanamsa) % 360;
  if (siderealMoonLng < 0) siderealMoonLng += 360;

  return siderealMoonLng;
}

function getVedicRashi(moonLongitude) {
  // Each rashi = 30°
  return Math.floor(moonLongitude / 30) % 12;
}

function getNakshatra(moonLongitude) {
  // Each nakshatra = 13.333°
  return Math.floor(moonLongitude / (360 / 27)) % 27;
}

function getNakshatraPada(moonLongitude) {
  const nakshatraDeg = 360 / 27;
  const withinNakshatra = moonLongitude % nakshatraDeg;
  return Math.floor(withinNakshatra / (nakshatraDeg / 4)) + 1;
}

// ─── Western Sun Sign (Tropical) ───
function getWesternRashi(month, day) {
  const dates = [
    [1,20], [2,19], [3,21], [4,20], [5,21], [6,21],
    [7,23], [8,23], [9,23], [10,23], [11,22], [12,22]
  ];
  // Signs: Aquarius=10, Pisces=11, Aries=0, Taurus=1, ...
  const signs = [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 12; i++) {
    const [m, d] = dates[i];
    if (month === m && day >= d) {
      return signs[i];
    }
    if (i > 0) {
      const [pm, pd] = dates[i-1];
      if (month === m && day < d) {
        return signs[i === 0 ? 11 : i - 1];
      }
    }
  }
  // Default for Jan 1-19
  return 9; // Capricorn
}

// ─── Panchang Data ───
const TITHIS = [
  { en: "Pratipada", hi: "प्रतिपदा", mr: "प्रतिपदा" }, { en: "Dwitiya", hi: "द्वितीया", mr: "द्वितीया" },
  { en: "Tritiya", hi: "तृतीया", mr: "तृतीया" }, { en: "Chaturthi", hi: "चतुर्थी", mr: "चतुर्थी" },
  { en: "Panchami", hi: "पंचमी", mr: "पंचमी" }, { en: "Shashthi", hi: "षष्ठी", mr: "षष्ठी" },
  { en: "Saptami", hi: "सप्तमी", mr: "सप्तमी" }, { en: "Ashtami", hi: "अष्टमी", mr: "अष्टमी" },
  { en: "Navami", hi: "नवमी", mr: "नवमी" }, { en: "Dashami", hi: "दशमी", mr: "दशमी" },
  { en: "Ekadashi", hi: "एकादशी", mr: "एकादशी" }, { en: "Dwadashi", hi: "द्वादशी", mr: "द्वादशी" },
  { en: "Trayodashi", hi: "त्रयोदशी", mr: "त्रयोदशी" }, { en: "Chaturdashi", hi: "चतुर्दशी", mr: "चतुर्दशी" },
  { en: "Purnima/Amavasya", hi: "पूर्णिमा/अमावस्या", mr: "पौर्णिमा/अमावस्या" },
];

const VAARS = [
  { en: "Sunday", hi: "रविवार", mr: "रविवार", deity: { en: "Sun/Surya", hi: "सूर्य", mr: "सूर्य" } },
  { en: "Monday", hi: "सोमवार", mr: "सोमवार", deity: { en: "Moon/Chandra", hi: "चंद्र", mr: "चंद्र" } },
  { en: "Tuesday", hi: "मंगलवार", mr: "मंगळवार", deity: { en: "Mars/Mangal", hi: "मंगल", mr: "मंगळ" } },
  { en: "Wednesday", hi: "बुधवार", mr: "बुधवार", deity: { en: "Mercury/Budh", hi: "बुध", mr: "बुध" } },
  { en: "Thursday", hi: "गुरुवार", mr: "गुरुवार", deity: { en: "Jupiter/Guru", hi: "गुरु/बृहस्पति", mr: "गुरू/बृहस्पती" } },
  { en: "Friday", hi: "शुक्रवार", mr: "शुक्रवार", deity: { en: "Venus/Shukra", hi: "शुक्र", mr: "शुक्र" } },
  { en: "Saturday", hi: "शनिवार", mr: "शनिवार", deity: { en: "Saturn/Shani", hi: "शनि", mr: "शनी" } },
];

function getPanchang(date) {
  const dayOfWeek = date.getDay();
  const newMoon = new Date(2026, 0, 29);
  const daysSinceNew = Math.floor((date - newMoon) / (1000 * 60 * 60 * 24));
  const lunarDay = ((daysSinceNew % 29.53) + 29.53) % 29.53;
  const tithiIndex = Math.floor(lunarDay / 2) % 15;
  const paksha = lunarDay < 15 ? "shukla" : "krishna";
  const moonLng = calculateMoonLongitude(date, 12, 82.5);
  const nakshatraIndex = getNakshatra(moonLng);
  const rahuKaal = ["4:30-6:00 PM", "7:30-9:00 AM", "3:00-4:30 PM", "12:00-1:30 PM", "1:30-3:00 PM", "10:30-12:00 PM", "9:00-10:30 AM"];
  return { vaar: VAARS[dayOfWeek], tithi: TITHIS[tithiIndex], paksha, nakshatra: NAKSHATRAS[nakshatraIndex], rahuKaal: rahuKaal[dayOfWeek] };
}

// ─── Festival Calendar ───
const FESTIVALS_2026 = [
  { date: "2026-01-14", name: { en: "Makar Sankranti", hi: "मकर संक्रांति", mr: "मकर संक्रांती" }, type: "major", desc: { en: "Sun enters Capricorn.", hi: "सूर्य मकर राशि में प्रवेश।", mr: "सूर्य मकर राशीत प्रवेश." } },
  { date: "2026-02-26", name: { en: "Maha Shivaratri", hi: "महा शिवरात्रि", mr: "महा शिवरात्री" }, type: "major", desc: { en: "Night of Lord Shiva.", hi: "भगवान शिव की रात्रि।", mr: "भगवान शिवाची रात्र." } },
  { date: "2026-03-10", name: { en: "Holi", hi: "होली", mr: "होळी" }, type: "major", desc: { en: "Festival of colors.", hi: "रंगों का त्योहार।", mr: "रंगांचा सण." } },
  { date: "2026-03-28", name: { en: "Gudi Padwa", hi: "गुड़ी पड़वा", mr: "गुढीपाडवा" }, type: "major", desc: { en: "Marathi New Year.", hi: "मराठी नववर्ष।", mr: "मराठी नववर्ष." } },
  { date: "2026-04-02", name: { en: "Ram Navami", hi: "राम नवमी", mr: "राम नवमी" }, type: "major", desc: { en: "Birthday of Lord Rama.", hi: "भगवान राम का जन्मदिन।", mr: "भगवान रामांचा जन्मदिवस." } },
  { date: "2026-07-11", name: { en: "Guru Purnima", hi: "गुरु पूर्णिमा", mr: "गुरू पौर्णिमा" }, type: "datta", desc: { en: "Day to honor the Guru.", hi: "गुरु को सम्मानित करने का दिन।", mr: "गुरूंना सन्मान देण्याचा दिवस." } },
  { date: "2026-08-22", name: { en: "Ganesh Chaturthi", hi: "गणेश चतुर्थी", mr: "गणेश चतुर्थी" }, type: "major", desc: { en: "Birthday of Lord Ganesha.", hi: "गणेश जी का जन्मदिन।", mr: "गणेशोत्सव." } },
  { date: "2026-10-02", name: { en: "Navratri Begins", hi: "नवरात्रि आरंभ", mr: "नवरात्री सुरुवात" }, type: "major", desc: { en: "Nine nights of worship.", hi: "नौ रातों की पूजा।", mr: "नऊ रात्रींची पूजा." } },
  { date: "2026-10-11", name: { en: "Dussehra", hi: "दशहरा", mr: "दसरा" }, type: "major", desc: { en: "Victory of good over evil.", hi: "बुराई पर अच्छाई की विजय।", mr: "वाईटावर चांगल्याचा विजय." } },
  { date: "2026-10-31", name: { en: "Diwali", hi: "दीवाली", mr: "दिवाळी" }, type: "major", desc: { en: "Festival of lights.", hi: "दीपों का त्योहार।", mr: "दिव्यांचा सण." } },
  { date: "2026-12-05", name: { en: "Datta Jayanti", hi: "दत्त जयंती", mr: "दत्त जयंती" }, type: "datta", desc: { en: "Birthday of Lord Dattatreya.", hi: "दत्तात्रेय जन्मदिन।", mr: "दत्तात्रेय जन्मदिवस." } },
];

// ─── Main Component ───
export function SpiritualTools() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState("panchang");
  const tabs = [
    { key: "panchang", label: t("panchang", lang) },
    { key: "rashi", label: t("rashi", lang) },
    { key: "festivals", label: t("festivals", lang) },
    { key: "muhurat", label: t("muhurat", lang) },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: "0 0 8px" }}>{t("toolsTitle", lang)}</h2>
        <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light }}>{t("toolsSubtitle", lang)}</p>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${activeTab === tab.key ? C.saffron : C.border}`, cursor: "pointer", background: activeTab === tab.key ? C.saffronLight : "#fff", color: activeTab === tab.key ? C.saffron : C.mid }}>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "panchang" && <PanchangView lang={lang} />}
      {activeTab === "rashi" && <RashiView lang={lang} />}
      {activeTab === "festivals" && <FestivalView lang={lang} />}
      {activeTab === "muhurat" && <MuhuratView lang={lang} />}
    </div>
  );
}

// ─── Panchang View ───
function PanchangView({ lang }) {
  const today = new Date();
  const panchang = getPanchang(today);
  const pakshaLabel = panchang.paksha === "shukla" ? { en: "Shukla Paksha (Bright Half)", hi: "शुक्ल पक्ष", mr: "शुक्ल पक्ष" } : { en: "Krishna Paksha (Dark Half)", hi: "कृष्ण पक्ष", mr: "कृष्ण पक्ष" };
  const items = [
    { icon: "📅", label: { en: "Day", hi: "वार", mr: "वार" }, value: panchang.vaar[lang] || panchang.vaar.en, sub: `${lang === "en" ? "Deity" : "देवता"}: ${panchang.vaar.deity[lang] || panchang.vaar.deity.en}` },
    { icon: "🌙", label: { en: "Tithi", hi: "तिथि", mr: "तिथी" }, value: panchang.tithi[lang] || panchang.tithi.en, sub: pakshaLabel[lang] || pakshaLabel.en },
    { icon: "⭐", label: { en: "Nakshatra", hi: "नक्षत्र", mr: "नक्षत्र" }, value: panchang.nakshatra[lang] || panchang.nakshatra.en },
    { icon: "⚠️", label: { en: "Rahu Kaal", hi: "राहु काल", mr: "राहू काळ" }, value: panchang.rahuKaal },
  ];
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontFamily: font, fontSize: 20, color: C.maroon, margin: "0 0 4px" }}>{today.toLocaleDateString(lang === "en" ? "en-IN" : "hi-IN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</p>
        <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light }}>{lang === "en" ? "Today's Panchang (approximate)" : lang === "hi" ? "आज का पंचांग (अनुमानित)" : "आजचे पंचांग (अंदाजे)"}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {items.map(item => (
          <div key={item.icon} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
            <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: "0 0 4px", textTransform: "uppercase" }}>{item.label[lang] || item.label.en}</p>
            <p style={{ fontFamily: font, fontSize: 18, color: C.dark, margin: "0 0 2px", fontWeight: 600 }}>{item.value}</p>
            {item.sub && <p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: 0 }}>{item.sub}</p>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "14px 18px", background: C.goldLight, borderRadius: 10, fontFamily: sansFont, fontSize: 12, color: C.mid, textAlign: "center" }}>
        {lang === "en" ? "⚠️ Approximate calculation. For precise panchang, consult a priest." : lang === "hi" ? "⚠️ अनुमानित गणना। सटीक पंचांग के लिए पंडित जी से संपर्क करें।" : "⚠️ अंदाजे गणन. अचूक पंचांगासाठी पंडितजींशी संपर्क करा."}
      </div>
    </div>
  );
}

// ─── Rashi View (Vedic + Western) ───
function RashiView({ lang }) {
  const [system, setSystem] = useState("vedic"); // vedic | western
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("06:00");
  const [city, setCity] = useState("Mumbai");

  let vedicRashi = null, westernRashi = null, nakshatra = null, pada = null, moonDeg = null;

  if (dob) {
    const d = new Date(dob);
    const m = d.getMonth() + 1;
    const day = d.getDate();

    // Western (Sun Sign)
    westernRashi = RASHIS[getWesternRashi(m, day)];

    // Vedic (Moon Sign)
    const [h, min] = tob.split(":").map(Number);
    const hours = h + min / 60;
    const cityData = CITIES.find(c => c.name === city) || CITIES[0];
    moonDeg = calculateMoonLongitude(d, hours, cityData.lng);
    const vRashiIdx = getVedicRashi(moonDeg);
    vedicRashi = RASHIS[vRashiIdx];
    const nakIdx = getNakshatra(moonDeg);
    nakshatra = NAKSHATRAS[nakIdx];
    pada = getNakshatraPada(moonDeg);
  }

  const activeRashi = system === "vedic" ? vedicRashi : westernRashi;

  return (
    <div>
      {/* System Toggle */}
      <div style={{ display: "flex", gap: 4, background: C.cream, borderRadius: 10, padding: 4, marginBottom: 20, maxWidth: 400 }}>
        <button onClick={() => setSystem("vedic")}
          style={{ flex: 1, fontFamily: sansFont, fontSize: 13, fontWeight: 600, padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: system === "vedic" ? C.saffron : "transparent", color: system === "vedic" ? "#fff" : C.mid }}>
          🌙 {lang === "en" ? "Vedic (Moon Sign)" : lang === "hi" ? "वैदिक (चंद्र राशि)" : "वैदिक (चंद्र राशी)"}
        </button>
        <button onClick={() => setSystem("western")}
          style={{ flex: 1, fontFamily: sansFont, fontSize: 13, fontWeight: 600, padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: system === "western" ? C.saffron : "transparent", color: system === "western" ? "#fff" : C.mid }}>
          ☀️ {lang === "en" ? "Western (Sun Sign)" : lang === "hi" ? "पश्चिमी (सूर्य राशि)" : "पश्चिमी (सूर्य राशी)"}
        </button>
      </div>

      {/* Input Form */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", border: `1px solid ${C.border}`, marginBottom: 20 }}>
        <h3 style={{ fontFamily: font, fontSize: 18, color: C.saffron, margin: "0 0 14px" }}>
          {system === "vedic"
            ? (lang === "en" ? "🌙 Find Your Vedic Moon Sign (Chandra Rashi)" : lang === "hi" ? "🌙 अपनी वैदिक चंद्र राशि जानें" : "🌙 तुमची वैदिक चंद्र राशी जाणा")
            : (lang === "en" ? "☀️ Find Your Western Sun Sign" : lang === "hi" ? "☀️ अपनी पश्चिमी सूर्य राशि जानें" : "☀️ तुमची पश्चिमी सूर्य राशी जाणा")}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: system === "vedic" ? "1fr 1fr 1fr" : "1fr", gap: 14 }}>
          <div>
            <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>
              {lang === "en" ? "Date of Birth *" : lang === "hi" ? "जन्म तिथि *" : "जन्मतारीख *"}
            </label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle} />
          </div>

          {system === "vedic" && (
            <>
              <div>
                <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>
                  {lang === "en" ? "Time of Birth *" : lang === "hi" ? "जन्म समय *" : "जन्मवेळ *"}
                </label>
                <input type="time" value={tob} onChange={e => setTob(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" }}>
                  {lang === "en" ? "Place of Birth *" : lang === "hi" ? "जन्म स्थान *" : "जन्मस्थान *"}
                </label>
                <select value={city} onChange={e => setCity(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        {system === "vedic" && (
          <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, marginTop: 8 }}>
            {lang === "en" ? "Accurate birth time is important for Vedic moon sign calculation" : lang === "hi" ? "वैदिक चंद्र राशि गणना के लिए सटीक जन्म समय महत्वपूर्ण है" : "वैदिक चंद्र राशी गणनासाठी अचूक जन्मवेळ महत्त्वाची आहे"}
          </p>
        )}
      </div>

      {/* Results */}
      {activeRashi && (
        <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(135deg, ${activeRashi.color}22, ${activeRashi.color}11)`, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 48 }}>{activeRashi.symbol}</span>
              <div>
                <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>
                  {system === "vedic" ? (lang === "en" ? "Vedic Moon Sign" : lang === "hi" ? "वैदिक चंद्र राशि" : "वैदिक चंद्र राशी") : (lang === "en" ? "Western Sun Sign" : lang === "hi" ? "पश्चिमी सूर्य राशि" : "पश्चिमी सूर्य राशी")}
                </p>
                <h3 style={{ fontFamily: font, fontSize: 24, color: C.dark, margin: "0 0 4px" }}>{activeRashi[lang] || activeRashi.en}</h3>
                <p style={{ fontFamily: sansFont, fontSize: 14, color: C.mid, margin: 0 }}>
                  {lang === "en" ? `Planet: ${activeRashi.planet.en} • Element: ${activeRashi.element.en}` : lang === "hi" ? `ग्रह: ${activeRashi.planet.hi} • तत्व: ${activeRashi.element.hi}` : `ग्रह: ${activeRashi.planet.mr} • तत्त्व: ${activeRashi.element.mr}`}
                </p>
              </div>
            </div>
            {/* Show Vedic details */}
            {system === "vedic" && nakshatra && (
              <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 16px" }}>
                  <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px" }}>⭐ {lang === "en" ? "Nakshatra" : "नक्षत्र"}</p>
                  <p style={{ fontFamily: font, fontSize: 16, color: C.dark, margin: 0, fontWeight: 600 }}>{nakshatra[lang] || nakshatra.en}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 16px" }}>
                  <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px" }}>{lang === "en" ? "Pada" : "पाद"}</p>
                  <p style={{ fontFamily: font, fontSize: 16, color: C.dark, margin: 0, fontWeight: 600 }}>{pada}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 16px" }}>
                  <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px" }}>{lang === "en" ? "Moon Position" : lang === "hi" ? "चंद्र स्थिति" : "चंद्र स्थिती"}</p>
                  <p style={{ fontFamily: sansFont, fontSize: 14, color: C.dark, margin: 0, fontWeight: 600 }}>{moonDeg.toFixed(1)}°</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: "20px 28px" }}>
            {/* Show both signs for comparison */}
            {system === "vedic" && westernRashi && westernRashi.id !== vedicRashi.id && (
              <div style={{ marginBottom: 16, padding: "12px 16px", background: C.cream, borderRadius: 10, fontFamily: sansFont, fontSize: 13, color: C.mid }}>
                ☀️ {lang === "en" ? `Your Western Sun Sign is ${westernRashi.en} (${westernRashi.symbol})` : lang === "hi" ? `आपकी पश्चिमी सूर्य राशि ${westernRashi.hi} (${westernRashi.symbol}) है` : `तुमची पश्चिमी सूर्य राशी ${westernRashi.mr} (${westernRashi.symbol}) आहे`}
              </div>
            )}
            {system === "western" && vedicRashi && vedicRashi.id !== westernRashi.id && dob && tob && (
              <div style={{ marginBottom: 16, padding: "12px 16px", background: C.cream, borderRadius: 10, fontFamily: sansFont, fontSize: 13, color: C.mid }}>
                🌙 {lang === "en" ? `Your Vedic Moon Sign is ${vedicRashi.en} (${vedicRashi.symbol})` : lang === "hi" ? `आपकी वैदिक चंद्र राशि ${vedicRashi.hi} (${vedicRashi.symbol}) है` : `तुमची वैदिक चंद्र राशी ${vedicRashi.mr} (${vedicRashi.symbol}) आहे`}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, color: C.saffron, margin: "0 0 8px" }}>🛕 {lang === "en" ? "Presiding Deity" : "अधिष्ठाता देवता"}</h4>
              <p style={{ fontFamily: font, fontSize: 16, color: C.dark, margin: 0 }}>{activeRashi.deity[lang] || activeRashi.deity.en}</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, color: C.saffron, margin: "0 0 8px" }}>🪔 {lang === "en" ? "Recommended Pujas" : lang === "hi" ? "अनुशंसित पूजाएं" : "शिफारस केलेल्या पूजा"}</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(activeRashi.pujas[lang] || activeRashi.pujas.en).map(p => (
                  <span key={p} style={{ fontFamily: sansFont, fontSize: 13, padding: "8px 14px", borderRadius: 8, background: C.saffronLight, color: C.saffron, fontWeight: 600 }}>{p}</span>
                ))}
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
          {RASHIS.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, textAlign: "center" }}>
              <span style={{ fontSize: 32, display: "block", marginBottom: 6 }}>{r.symbol}</span>
              <p style={{ fontFamily: font, fontSize: 14, color: C.dark, margin: 0, fontWeight: 600 }}>{r[lang] || r.en}</p>
              <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "2px 0 0" }}>{r.planet[lang] || r.planet.en}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, padding: "14px 18px", background: C.goldLight, borderRadius: 10, fontFamily: sansFont, fontSize: 12, color: C.mid, textAlign: "center" }}>
        {lang === "en" ? "⚠️ This is an approximate calculation. For precise kundli, consult a Vedic astrologer." : lang === "hi" ? "⚠️ यह अनुमानित गणना है। सटीक कुंडली के लिए ज्योतिषी से संपर्क करें।" : "⚠️ हे अंदाजे गणन आहे. अचूक कुंडलीसाठी ज्योतिषाशी संपर्क करा."}
      </div>
    </div>
  );
}

// ─── Festival View ───
function FestivalView({ lang }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = FESTIVALS_2026.filter(f => new Date(f.date) >= today);
  return (
    <div>
      <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: "0 0 16px" }}>{lang === "en" ? "🎪 Upcoming Festivals 2026" : lang === "hi" ? "🎪 आगामी त्योहार 2026" : "🎪 आगामी सण 2026"}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {upcoming.map(f => {
          const fDate = new Date(f.date);
          const daysLeft = Math.ceil((fDate - today) / (1000*60*60*24));
          return (
            <div key={f.date} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: `1px solid ${f.type === "datta" ? C.gold : C.border}`, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "center", minWidth: 50 }}>
                <p style={{ fontFamily: sansFont, fontSize: 22, fontWeight: 700, color: f.type === "datta" ? C.saffron : C.maroon, margin: 0 }}>{fDate.getDate()}</p>
                <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: 0 }}>{fDate.toLocaleDateString(lang === "en" ? "en-IN" : "hi-IN", { month: "short" })}</p>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontFamily: font, fontSize: 15, color: C.dark, margin: "0 0 3px" }}>{f.name[lang] || f.name.en}</h4>
                <p style={{ fontFamily: sansFont, fontSize: 12, color: C.mid, margin: 0 }}>{f.desc[lang] || f.desc.en}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {f.type === "datta" && <span style={{ fontFamily: sansFont, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: C.goldLight, color: C.gold, display: "block", marginBottom: 4 }}>दत्त</span>}
                <span style={{ fontFamily: sansFont, fontSize: 12, fontWeight: 600, color: daysLeft <= 7 ? C.saffron : C.light }}>{daysLeft === 0 ? "Today!" : `${daysLeft}d`}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Muhurat View ───
function MuhuratView({ lang }) {
  const events = [
    { event: { en: "Marriage / Wedding", hi: "विवाह", mr: "विवाह / लग्न" }, months: { en: "Nov-Feb, Apr-May", hi: "नवंबर-फरवरी, अप्रैल-मई", mr: "नोव्हेंबर-फेब्रुवारी, एप्रिल-मे" }, days: { en: "Mon, Wed, Thu, Fri", hi: "सोमवार, बुधवार, गुरुवार, शुक्रवार", mr: "सोमवार, बुधवार, गुरुवार, शुक्रवार" }, tithis: { en: "2,3,5,7,10,11,13", hi: "२,३,५,७,१०,११,१३", mr: "२,३,५,७,१०,११,१३" }, icon: "💍" },
    { event: { en: "Gruhapravesh", hi: "गृहप्रवेश", mr: "गृहप्रवेश / वास्तुशांती" }, months: { en: "Jan-Jun (Uttarayan)", hi: "जनवरी-जून (उत्तरायण)", mr: "जानेवारी-जून (उत्तरायण)" }, days: { en: "Mon, Wed, Thu, Fri", hi: "सोमवार, बुधवार, गुरुवार, शुक्रवार", mr: "सोमवार, बुधवार, गुरुवार, शुक्रवार" }, tithis: { en: "2,3,5,7,10,11,13", hi: "२,३,५,७,१०,११,१३", mr: "२,३,५,७,१०,११,१३" }, icon: "🏠" },
    { event: { en: "New Business", hi: "नया व्यापार", mr: "नवीन व्यवसाय" }, months: { en: "Any month, check tithi", hi: "कोई भी महीना, तिथि देखें", mr: "कोणताही महिना, तिथी पहा" }, days: { en: "Wed, Thu, Fri", hi: "बुधवार, गुरुवार, शुक्रवार", mr: "बुधवार, गुरुवार, शुक्रवार" }, tithis: { en: "2,3,5,7,10,11", hi: "२,३,५,७,१०,११", mr: "२,३,५,७,१०,११" }, icon: "💼" },
    { event: { en: "Vehicle Purchase", hi: "वाहन खरीद", mr: "वाहन खरेदी" }, months: { en: "Any auspicious month", hi: "कोई भी शुभ माह", mr: "कोणताही शुभ महिना" }, days: { en: "Tue, Wed, Thu", hi: "मंगलवार, बुधवार, गुरुवार", mr: "मंगळवार, बुधवार, गुरुवार" }, tithis: { en: "2,3,5,7,10", hi: "२,३,५,७,१०", mr: "२,३,५,७,१०" }, icon: "🚗" },
    { event: { en: "Namkaran (Naming)", hi: "नामकरण संस्कार", mr: "नामकरण / बारसे" }, months: { en: "11th/12th day after birth", hi: "जन्म के 11-12वें दिन", mr: "जन्मानंतर ११-१२ व्या दिवशी" }, days: { en: "Mon, Wed, Thu, Fri", hi: "सोमवार, बुधवार, गुरुवार, शुक्रवार", mr: "सोमवार, बुधवार, गुरुवार, शुक्रवार" }, tithis: { en: "2,3,5,7,10,11", hi: "२,३,५,७,१०,११", mr: "२,३,५,७,१०,११" }, icon: "👶" },
    { event: { en: "Gold Purchase", hi: "सोना खरीद", mr: "सोने खरेदी" }, months: { en: "Akshaya Tritiya, Dhanteras", hi: "अक्षय तृतीया, धनतेरस", mr: "अक्षय तृतीया, धनत्रयोदशी" }, days: { en: "Any during festivals", hi: "त्योहारों में कोई भी दिन", mr: "सणांच्या वेळी कोणताही दिवस" }, tithis: { en: "Shukla Paksha preferred", hi: "शुक्ल पक्ष उत्तम", mr: "शुक्ल पक्ष उत्तम" }, icon: "💎" },
  ];
  return (
    <div>
      <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: "0 0 6px" }}>🕉️ {lang === "en" ? "Auspicious Times for Events" : lang === "hi" ? "शुभ मुहूर्त" : "शुभ मुहूर्त"}</h3>
      <p style={{ fontFamily: sansFont, fontSize: 13, color: C.light, margin: "0 0 20px" }}>{lang === "en" ? "General guidelines. For exact muhurat, consult a priest." : lang === "hi" ? "सामान्य मार्गदर्शन। सटीक मुहूर्त हेतु पंडित जी से संपर्क करें।" : "सामान्य मार्गदर्शन. अचूक मुहूर्तासाठी पंडितजींशी संपर्क करा."}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {events.map(ev => (
          <div key={ev.icon} style={{ background: "#fff", borderRadius: 14, padding: "18px 22px", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{ev.icon}</span>
              <h4 style={{ fontFamily: font, fontSize: 16, color: C.dark, margin: 0 }}>{ev.event[lang] || ev.event.en}</h4>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>📅 {lang === "en" ? "Months" : "महीने"}</p><p style={{ fontFamily: sansFont, fontSize: 13, color: C.mid, margin: 0 }}>{ev.months[lang] || ev.months.en}</p></div>
              <div><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>📆 {lang === "en" ? "Days" : "दिवस"}</p><p style={{ fontFamily: sansFont, fontSize: 13, color: C.mid, margin: 0 }}>{ev.days[lang] || ev.days.en}</p></div>
              <div><p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "0 0 2px", textTransform: "uppercase" }}>🌙 {lang === "en" ? "Tithis" : "तिथि"}</p><p style={{ fontFamily: sansFont, fontSize: 13, color: C.mid, margin: 0 }}>{ev.tithis[lang] || ev.tithis.en}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
