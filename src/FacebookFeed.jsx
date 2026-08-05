import { useEffect } from "react";
import { useLang } from "./LangContext.jsx";

const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", maroon: "#7b1a2c", gold: "#c9a84c", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4" };

const FB_PAGE_URL = "https://www.facebook.com/shreedattarajgurumauli";

export function FacebookFeed() {
  const { lang } = useLang();

  useEffect(() => {
    if (window.FB) {
      window.FB.XFBML.parse();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/hi_IN/sdk.js#xfbml=1&version=v19.0";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Subscribe CTA — TOP */}
      <div style={{ marginBottom: 24, padding: "18px 24px", background: `linear-gradient(135deg, #1877F2, #0d5bbf)`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: font, fontSize: 16, color: "#ffd700", margin: "0 0 4px", fontWeight: 700 }}>
            🔐 {lang === "hi" ? "अध्यात्मिक सेवाओं तक पहुंच पाएं" : lang === "mr" ? "अध्यात्मिक सेवांमध्ये प्रवेश मिळवा" : "Get Access to Spiritual Services"}
          </p>
          <p style={{ fontFamily: sansFont, fontSize: 13, color: "rgba(255,255,255,0.85)", margin: 0 }}>
            {lang === "hi" ? "Facebook पेज Subscribe करें और मासिक एक्सेस कोड पाएं — अध्यात्मिक सहायक और गुरुदेव चैट के लिए"
              : lang === "mr" ? "Facebook पेज Subscribe करा आणि मासिक ऍक्सेस कोड मिळवा — अध्यात्मिक सहाय्यक आणि गुरुदेव चॅटसाठी"
              : "Subscribe to Facebook page and get monthly access code for Spiritual Assistant and Gurudev Chat"}
          </p>
        </div>
        <a href="https://www.facebook.com/shreedattarajgurumauli/subscribenow" target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 700, padding: "10px 22px", borderRadius: 10, background: "#ffd700", color: "#1877F2", textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}>
          📘 Subscribe Now
        </a>
      </div>

      {/* Facebook Page Plugin */}
      <div id="fb-root"></div>
      <div style={{ display: "flex", justifyContent: "center", background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", padding: 20 }}>
        <div
          className="fb-page"
          data-href={FB_PAGE_URL}
          data-tabs="timeline"
          data-width="600"
          data-height="900"
          data-small-header="false"
          data-adapt-container-width="true"
          data-hide-cover="false"
          data-show-facepile="true"
        />
      </div>

      {/* Like button row */}
      <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: sansFont, fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 10, background: "#1877F2", color: "#fff", textDecoration: "none" }}>
          👍 {lang === "hi" ? "पेज Like करें" : lang === "mr" ? "पेज Like करा" : "Like Page"}
        </a>
        <a href="https://www.facebook.com/shreedattarajgurumauli/subscribenow" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: sansFont, fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 10, background: C.saffron, color: "#fff", textDecoration: "none" }}>
          🔔 {lang === "hi" ? "Subscribe करें" : lang === "mr" ? "Subscribe करा" : "Subscribe"}
        </a>
      </div>
    </div>
  );
}


export function FacebookFeed() {
  const { lang } = useLang();

  useEffect(() => {
    // Load Facebook SDK
    if (window.FB) {
      window.FB.XFBML.parse();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/hi_IN/sdk.js#xfbml=1&version=v19.0";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </div>
          <h2 style={{ fontFamily: font, fontSize: 26, color: C.maroon, margin: 0 }}>
            {lang === "hi" ? "Facebook पर हमें फॉलो करें" : lang === "mr" ? "Facebook वर आम्हाला फॉलो करा" : "Follow Us on Facebook"}
          </h2>
        </div>
        <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light, margin: "0 0 16px" }}>
          {lang === "hi" ? "श्री दत्तराज गुरुमाऊली के Facebook पेज पर नवीनतम समाचार, भजन और आध्यात्मिक संदेश पाएं"
            : lang === "mr" ? "श्री दत्तराज गुरुमाऊली Facebook पेजवर ताज्या बातम्या, भजन आणि अध्यात्मिक संदेश मिळवा"
            : "Get latest news, bhajans and spiritual messages on Shree Dattaraj Gurumauli Facebook page"}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: sansFont, fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 10, background: "#1877F2", color: "#fff", textDecoration: "none" }}>
            👍 {lang === "hi" ? "पेज Like करें" : lang === "mr" ? "पेज Like करा" : "Like Page"}
          </a>
          <a href="https://www.facebook.com/shreedattarajgurumauli/subscribenow" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: sansFont, fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 10, background: C.saffron, color: "#fff", textDecoration: "none" }}>
            🔔 {lang === "hi" ? "Subscribe करें" : lang === "mr" ? "Subscribe करा" : "Subscribe"}
          </a>
        </div>
      </div>

      {/* Facebook Page Plugin */}
      <div id="fb-root"></div>
      <div style={{ display: "flex", justifyContent: "center", background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", padding: 20 }}>
        <div
          className="fb-page"
          data-href={FB_PAGE_URL}
          data-tabs="timeline"
          data-width="500"
          data-height="600"
          data-small-header="false"
          data-adapt-container-width="true"
          data-hide-cover="false"
          data-show-facepile="true"
        />
      </div>

      {/* Subscribe CTA */}
      <div style={{ marginTop: 20, padding: "18px 24px", background: `linear-gradient(135deg, #1877F2, #0d5bbf)`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: font, fontSize: 16, color: "#ffd700", margin: "0 0 4px", fontWeight: 700 }}>
            🔐 {lang === "hi" ? "AI सेवाओं तक पहुंच पाएं" : lang === "mr" ? "AI सेवांमध्ये प्रवेश मिळवा" : "Get Access to AI Services"}
          </p>
          <p style={{ fontFamily: sansFont, fontSize: 13, color: "rgba(255,255,255,0.85)", margin: 0 }}>
            {lang === "hi" ? "Facebook पेज Subscribe करें और मासिक एक्सेस कोड पाएं — अध्यात्मिक सहायक और गुरुदेव चैट के लिए"
              : lang === "mr" ? "Facebook पेज Subscribe करा आणि मासिक ऍक्सेस कोड मिळवा — अध्यात्मिक सहाय्यक आणि गुरुदेव चॅटसाठी"
              : "Subscribe to Facebook page and get monthly access code for Spiritual Assistant and Gurudev Chat"}
          </p>
        </div>
        <a href="https://www.facebook.com/shreedattarajgurumauli/subscribenow" target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 700, padding: "10px 22px", borderRadius: 10, background: "#ffd700", color: "#1877F2", textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}>
          📘 Subscribe Now
        </a>
      </div>
    </div>
  );
}
