import { useEffect } from "react";

// ─── Replace with your actual AdSense Publisher ID after approval ───
const ADSENSE_CLIENT = "ca-pub-4798640663789775";

// ─── AdSense Script Loader ───
// Call this once in your app
export function AdSenseLoader() {
  useEffect(() => {
    // Only load if approved (publisher ID is set)
    if (ADSENSE_CLIENT === "ca-pub-XXXXXXXXXXXXXXXX") return;
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);
  return null;
}

// ─── Ad Unit Component ───
// slot = your AdSense ad unit slot ID
// format = "auto" | "rectangle" | "horizontal" | "vertical"
function AdUnit({ slot, format = "auto", style = {} }) {
  useEffect(() => {
    // Only push if approved
    if (ADSENSE_CLIENT === "ca-pub-XXXXXXXXXXXXXXXX") return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  // Show placeholder in development / pending approval
  if (ADSENSE_CLIENT === "ca-pub-XXXXXXXXXXXXXXXX") {
    return (
      <div style={{
        background: "#f5f5f5", border: "1px dashed #ccc", borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 12, margin: "12px 0", color: "#999",
        fontFamily: "'DM Sans', sans-serif", fontSize: 12,
        ...style
      }}>
        📢 Ad Space (pending AdSense approval)
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", ...style }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

// ─── Specific Ad Placements ───

// Between temple cards on home page (horizontal banner)
export function HomeBannerAd() {
  return (
    <AdUnit
      slot="1234567890"
      format="horizontal"
      style={{ minHeight: 90, margin: "16px 0" }}
    />
  );
}

// Below puja selection in registration form
export function RegistrationAd() {
  return (
    <AdUnit
      slot="0987654321"
      format="rectangle"
      style={{ minHeight: 120, margin: "16px 0" }}
    />
  );
}

// Between blog posts / at top of blog list
export function BlogAd() {
  return (
    <AdUnit
      slot="1122334455"
      format="horizontal"
      style={{ minHeight: 90, margin: "20px 0" }}
    />
  );
}

// Between AI tool responses (after result)
export function AIToolsAd() {
  return (
    <AdUnit
      slot="5544332211"
      format="rectangle"
      style={{ minHeight: 100, margin: "16px 0" }}
    />
  );
}

// In Tools section (below panchang / above rashi)
export function ToolsAd() {
  return (
    <AdUnit
      slot="6677889900"
      format="auto"
      style={{ minHeight: 90, margin: "16px 0" }}
    />
  );
}

// Footer banner (above footer)
export function FooterAd() {
  return (
    <AdUnit
      slot="9988776655"
      format="horizontal"
      style={{ minHeight: 90, margin: "20px 0" }}
    />
  );
}
