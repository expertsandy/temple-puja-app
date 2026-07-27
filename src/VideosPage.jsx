import { useState, useEffect } from "react";
import { useLang } from "./LangContext.jsx";

const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4" };

const CHANNEL_ID = "UCY_go0y5WLLiM-ouhkCuZgw";
const CHANNEL_URL = "https://www.youtube.com/@ShreeDattarajGurumauli";

function timeAgo(dateStr, lang) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 3600) return lang === "hi" ? "1 घंटे पहले" : lang === "mr" ? "1 तासापूर्वी" : "1 hour ago";
  if (diff < 86400) { const h = Math.floor(diff / 3600); return lang === "hi" ? `${h} घंटे पहले` : lang === "mr" ? `${h} तासांपूर्वी` : `${h}h ago`; }
  if (diff < 2592000) { const d = Math.floor(diff / 86400); return lang === "hi" ? `${d} दिन पहले` : lang === "mr" ? `${d} दिवसांपूर्वी` : `${d} days ago`; }
  const m = Math.floor(diff / 2592000);
  return lang === "hi" ? `${m} महीने पहले` : lang === "mr" ? `${m} महिन्यांपूर्वी` : `${m} months ago`;
}

export function VideosPage() {
  const { lang } = useLang();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) {
      setError("YouTube API key not configured");
      setLoading(false);
      return;
    }
    try {
      // Get uploads playlist ID from channel
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,statistics&id=${CHANNEL_ID}&key=${apiKey}`
      );
      const channelData = await channelRes.json();
      if (!channelData.items?.length) throw new Error("Channel not found");

      const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
      const channelStats = channelData.items[0].statistics;

      // Get latest videos from uploads playlist
      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=9&key=${apiKey}`
      );
      const videosData = await videosRes.json();
      if (!videosData.items?.length) throw new Error("No videos found");

      // Get video details (duration, views)
      const videoIds = videosData.items.map(v => v.snippet.resourceId.videoId).join(',');
      const detailsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${apiKey}`
      );
      const detailsData = await detailsRes.json();

      const detailsMap = {};
      detailsData.items?.forEach(v => { detailsMap[v.id] = v; });

      const formatted = videosData.items.map(item => {
        const videoId = item.snippet.resourceId.videoId;
        const details = detailsMap[videoId] || {};
        const duration = details.contentDetails?.duration || "";
        const minutes = duration.match(/(\d+)M/)?.[1] || "0";
        const seconds = duration.match(/(\d+)S/)?.[1] || "00";
        return {
          id: videoId,
          title: item.snippet.title,
          description: item.snippet.description?.substring(0, 120),
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
          publishedAt: item.snippet.publishedAt,
          viewCount: details.statistics?.viewCount ? parseInt(details.statistics.viewCount).toLocaleString('en-IN') : null,
          duration: `${minutes}:${seconds.padStart(2, '0')}`,
        };
      });

      setVideos(formatted);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FF0000", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </div>
          <h2 style={{ fontFamily: font, fontSize: 28, color: C.maroon, margin: 0 }}>
            {lang === "hi" ? "हमारे YouTube वीडियो" : lang === "mr" ? "आमचे YouTube व्हिडिओ" : "Our YouTube Videos"}
          </h2>
        </div>
        <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light, margin: "0 0 16px" }}>
          {lang === "hi" ? "श्री दत्तराज गुरुमाऊली के YouTube चैनल पर अध्यात्मिक प्रवचन, पूजा विधि और भजन"
            : lang === "mr" ? "श्री दत्तराज गुरुमाऊली YouTube चॅनेलवर अध्यात्मिक प्रवचन, पूजा विधी आणि भजन"
            : "Spiritual discourses, puja rituals and bhajans on Shree Dattaraj Gurumauli YouTube channel"}
        </p>
        <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: sansFont, fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 10, background: "#FF0000", color: "#fff", textDecoration: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          {lang === "hi" ? "चैनल Subscribe करें" : lang === "mr" ? "चॅनेल Subscribe करा" : "Subscribe to Channel"}
        </a>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setSelectedVideo(null)}>
          <div style={{ width: "100%", maxWidth: 800, background: "#000", borderRadius: 16, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo}?autoplay=1`}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen title="YouTube video" />
            </div>
            <button onClick={() => setSelectedVideo(null)}
              style={{ width: "100%", fontFamily: sansFont, fontSize: 13, padding: "12px", background: "#222", color: "#fff", border: "none", cursor: "pointer" }}>
              ✕ {lang === "hi" ? "बंद करें" : lang === "mr" ? "बंद करा" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>▶️</span>
          <p style={{ fontFamily: sansFont, fontSize: 14, color: C.light }}>
            {lang === "hi" ? "वीडियो लोड हो रहे हैं..." : lang === "mr" ? "व्हिडिओ लोड होत आहेत..." : "Loading videos..."}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: C.cream, borderRadius: 14 }}>
          <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>📺</span>
          <p style={{ fontFamily: sansFont, fontSize: 14, color: C.mid, marginBottom: 16 }}>
            {lang === "hi" ? "वीडियो लोड नहीं हो सके। YouTube चैनल पर जाएं।"
              : lang === "mr" ? "व्हिडिओ लोड होऊ शकले नाहीत. YouTube चॅनेलला भेट द्या."
              : "Could not load videos. Visit our YouTube channel directly."}
          </p>
          <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 10, background: "#FF0000", color: "#fff", textDecoration: "none" }}>
            ▶️ YouTube Channel
          </a>
        </div>
      )}

      {/* Videos Grid */}
      {!loading && !error && videos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
          {videos.map(video => (
            <div key={video.id} onClick={() => setSelectedVideo(video.id)}
              style={{ background: "#fff", borderRadius: 14, overflow: "hidden", cursor: "pointer", border: `1px solid ${C.border}`, transition: "all 0.2s", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(232,98,30,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}>
              {/* Thumbnail */}
              <div style={{ position: "relative", paddingBottom: "56.25%", background: "#111" }}>
                {video.thumbnail && <img src={video.thumbnail} alt={video.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                {/* Play button overlay */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                {/* Duration badge */}
                {video.duration && video.duration !== "0:00" && (
                  <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.8)", color: "#fff", fontFamily: sansFont, fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                    {video.duration}
                  </div>
                )}
              </div>
              {/* Info */}
              <div style={{ padding: "12px 14px 14px" }}>
                <p style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, color: C.dark, margin: "0 0 6px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {video.title}
                </p>
                {video.description && (
                  <p style={{ fontFamily: sansFont, fontSize: 12, color: C.light, margin: "0 0 8px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {video.description}
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {video.viewCount && <span style={{ fontFamily: sansFont, fontSize: 11, color: C.light }}>👁️ {video.viewCount}</span>}
                  <span style={{ fontFamily: sansFont, fontSize: 11, color: C.light }}>{timeAgo(video.publishedAt, lang)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View all on YouTube */}
      {!loading && videos.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 28px", borderRadius: 12, border: `2px solid #FF0000`, color: "#FF0000", textDecoration: "none", background: "#fff" }}>
            ▶️ {lang === "hi" ? "सभी वीडियो देखें" : lang === "mr" ? "सर्व व्हिडिओ पहा" : "View All Videos on YouTube"}
          </a>
        </div>
      )}
    </div>
  );
}
