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
