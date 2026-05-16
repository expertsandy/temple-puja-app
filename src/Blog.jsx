import { useState } from "react";
import { useLang } from "./LangContext.jsx";

// ─── Styles (shared with main app) ───
const font = "'Noto Serif Devanagari', 'Playfair Display', Georgia, serif";
const sansFont = "'DM Sans', 'Segoe UI', sans-serif";
const C = { saffron: "#e8621e", saffronLight: "#fff3eb", saffronDark: "#c04d10", maroon: "#7b1a2c", gold: "#c9a84c", goldLight: "#faf4e0", cream: "#fdf8f0", dark: "#2d1810", mid: "#5c3d2e", light: "#8a6e5e", border: "#e8d5c4", success: "#2d7a4f", successBg: "#e8f5ee", cancelled: "#c0392b", cancelledBg: "#fde8e8" };
const inputStyle = { fontFamily: sansFont, fontSize: 14, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, width: "100%", boxSizing: "border-box", outline: "none", color: C.dark, background: "#fff" };
const labelStyle = { fontFamily: sansFont, fontSize: 13, fontWeight: 600, color: C.mid, marginBottom: 6, display: "block" };

// ─── Blog List (Public) ───
export function BlogPage({ posts, onSelectPost }) {
  const { t } = useLang();
  const published = posts.filter(p => p.published);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h2 style={{ fontFamily: font, fontSize: 30, color: C.maroon, margin: "0 0 8px" }}>{t("blogTitle")}</h2>
        <p style={{ fontFamily: sansFont, fontSize: 15, color: C.light }}>{t("blogSubtitle")}</p>
      </div>

      {published.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.light, fontFamily: sansFont }}>
          <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>📝</span>
          कोई लेख अभी उपलब्ध नहीं है। जल्द ही आएंगे!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {published.map(post => (
            <article key={post.id} onClick={() => onSelectPost(post.id)}
              style={{ background: "#fff", borderRadius: 16, overflow: "hidden", cursor: "pointer", border: `1px solid ${C.border}`, transition: "all 0.3s", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(232,98,30,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}>
              <div style={{ display: "flex", gap: 0 }}>
                {post.cover_image && (
                  <div style={{ width: 200, minHeight: 160, flexShrink: 0 }}>
                    <img src={post.cover_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ padding: "20px 24px", flex: 1 }}>
                  {post.category && (
                    <span style={{ fontFamily: sansFont, fontSize: 11, fontWeight: 700, color: C.saffron, background: C.saffronLight, padding: "4px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {post.category}
                    </span>
                  )}
                  <h3 style={{ fontFamily: font, fontSize: 20, color: C.dark, margin: "10px 0 8px", lineHeight: 1.4 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontFamily: sansFont, fontSize: 14, color: C.mid, margin: "0 0 12px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {post.excerpt}
                  </p>
                  <div style={{ fontFamily: sansFont, fontSize: 12, color: C.light }}>
                    {post.author && <span>✍️ {post.author}</span>}
                    {post.created_at && <span style={{ marginLeft: 16 }}>📅 {new Date(post.created_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })}</span>}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Single Blog Post (Public) ───
export function BlogPostView({ post, onBack }) {
  if (!post) return null;

  // Simple markdown-like rendering: split by \n\n for paragraphs
  const renderContent = (content) => {
    return content.split('\n\n').map((para, i) => {
      // Heading (starts with ##)
      if (para.startsWith('## ')) {
        return <h3 key={i} style={{ fontFamily: font, fontSize: 22, color: C.maroon, margin: "28px 0 12px" }}>{para.replace('## ', '')}</h3>;
      }
      if (para.startsWith('### ')) {
        return <h4 key={i} style={{ fontFamily: font, fontSize: 18, color: C.saffron, margin: "24px 0 10px" }}>{para.replace('### ', '')}</h4>;
      }
      // Quote (starts with >)
      if (para.startsWith('> ')) {
        return (
          <blockquote key={i} style={{ borderLeft: `4px solid ${C.gold}`, padding: "12px 20px", margin: "20px 0", background: C.goldLight, borderRadius: "0 10px 10px 0", fontFamily: font, fontSize: 16, color: C.maroon, fontStyle: "italic", lineHeight: 1.7 }}>
            {para.replace('> ', '')}
          </blockquote>
        );
      }
      // Regular paragraph
      return <p key={i} style={{ fontFamily: sansFont, fontSize: 16, color: C.mid, lineHeight: 1.8, margin: "0 0 16px" }}>{para}</p>;
    });
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button onClick={onBack} style={{ fontFamily: sansFont, fontSize: 13, color: C.saffron, background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0, fontWeight: 600 }}>← सभी लेख</button>

      {post.cover_image && (
        <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
          <img src={post.cover_image} alt="" style={{ width: "100%", height: 300, objectFit: "cover" }} />
        </div>
      )}

      {post.category && (
        <span style={{ fontFamily: sansFont, fontSize: 11, fontWeight: 700, color: C.saffron, background: C.saffronLight, padding: "4px 10px", borderRadius: 6, textTransform: "uppercase" }}>
          {post.category}
        </span>
      )}

      <h1 style={{ fontFamily: font, fontSize: 32, color: C.maroon, margin: "14px 0 12px", lineHeight: 1.3 }}>
        {post.title}
      </h1>

      <div style={{ fontFamily: sansFont, fontSize: 13, color: C.light, marginBottom: 28, display: "flex", gap: 20 }}>
        {post.author && <span>✍️ {post.author}</span>}
        {post.created_at && <span>📅 {new Date(post.created_at).toLocaleDateString("hi-IN", { year: "numeric", month: "long", day: "numeric" })}</span>}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: "32px 36px", border: `1px solid ${C.border}` }}>
        {renderContent(post.content)}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button onClick={onBack} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 600, padding: "12px 28px", borderRadius: 10, border: `2px solid ${C.saffron}`, cursor: "pointer", background: "transparent", color: C.saffron }}>← और लेख पढ़ें</button>
      </div>
    </div>
  );
}

// ─── Blog Admin ───
export function BlogAdmin({ posts, onRefresh, dbAddPost, dbUpdatePost, dbDeletePost, dispatch }) {
  const [editing, setEditing] = useState(null); // null = list, "new" = new post, post object = editing

  if (editing) {
    return <BlogEditor
      post={editing === "new" ? null : editing}
      onSave={async (post) => {
        if (editing === "new") {
          await dbAddPost(post);
        } else {
          await dbUpdatePost(post);
        }
        await onRefresh();
        setEditing(null);
        dispatch({ type: "SET_NOTIFICATION", payload: editing === "new" ? "Article published!" : "Article updated!" });
      }}
      onCancel={() => setEditing(null)}
    />;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: 0 }}>📝 Blog Articles</h3>
        <button onClick={() => setEditing("new")} style={{ fontFamily: sansFont, fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff" }}>➕ New Article</button>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, background: C.cream, borderRadius: 12, fontFamily: sansFont, color: C.light }}>
          <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>📝</span>
          No articles yet. Write your first one!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {posts.map(post => (
            <div key={post.id} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontFamily: sansFont, fontSize: 15, fontWeight: 600, color: C.dark, margin: "0 0 4px" }}>{post.title}</h4>
                <div style={{ display: "flex", gap: 12, fontFamily: sansFont, fontSize: 12, color: C.light }}>
                  {post.category && <span>{post.category}</span>}
                  <span>{new Date(post.created_at).toLocaleDateString("en-IN")}</span>
                  <span style={{ fontWeight: 600, color: post.published ? C.success : C.cancelled }}>{post.published ? "Published" : "Draft"}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEditing(post)} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.saffron}`, background: "transparent", color: C.saffron, cursor: "pointer" }}>✏️ Edit</button>
                <button onClick={async () => { if (!confirm("Delete this article?")) return; await dbDeletePost(post.id); await onRefresh(); dispatch({ type: "SET_NOTIFICATION", payload: "Article deleted" }); }} style={{ fontFamily: sansFont, fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.cancelled}`, background: "transparent", color: C.cancelled, cursor: "pointer" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Blog Editor ───
function BlogEditor({ post, onSave, onCancel }) {
  const [f, setF] = useState({
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    category: post?.category || "दत्त संप्रदाय",
    author: post?.author || "श्री दत्तराज गुरुमाऊली",
    cover_image: post?.cover_image || null,
    published: post?.published ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const categories = ["दत्त संप्रदाय", "पूजा विधि", "तीर्थ क्षेत्र", "अध्यात्म", "गुरु परंपरा", "सामान्य"];

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setF(x => ({ ...x, cover_image: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!f.title || !f.content) { alert("Title and content are required"); return; }
    setSaving(true);
    try {
      await onSave({
        id: post?.id || "blog_" + Date.now(),
        ...f,
      });
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: font, fontSize: 18, color: C.maroon, margin: 0 }}>{post ? "✏️ Edit Article" : "📝 New Article"}</h3>
        <button onClick={onCancel} style={{ fontFamily: sansFont, fontSize: 13, color: C.saffron, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>← Back to list</button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: `1px solid ${C.border}` }}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Title *</label>
          <input value={f.title} onChange={e => setF(x => ({ ...x, title: e.target.value }))} placeholder="लेख का शीर्षक" style={{ ...inputStyle, fontFamily: font, fontSize: 18 }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Excerpt (short summary)</label>
          <textarea value={f.excerpt} onChange={e => setF(x => ({ ...x, excerpt: e.target.value }))} placeholder="लेख का संक्षिप्त विवरण..." rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={f.category} onChange={e => setF(x => ({ ...x, category: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Author</label>
            <input value={f.author} onChange={e => setF(x => ({ ...x, author: e.target.value }))} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Cover Image</label>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            {f.cover_image && <img src={f.cover_image} alt="" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />}
            <div>
              <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ fontFamily: sansFont, fontSize: 13 }} />
              {f.cover_image && <button onClick={() => setF(x => ({ ...x, cover_image: null }))} style={{ fontFamily: sansFont, fontSize: 11, color: C.cancelled, background: "none", border: "none", cursor: "pointer", display: "block", marginTop: 4 }}>Remove</button>}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ ...labelStyle, margin: 0 }}>Content *</label>
            <button onClick={() => setPreview(!preview)} style={{ fontFamily: sansFont, fontSize: 12, color: C.saffron, background: "none", border: `1px solid ${C.saffron}`, borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>{preview ? "Edit" : "Preview"}</button>
          </div>
          {!preview ? (
            <div>
              <textarea value={f.content} onChange={e => setF(x => ({ ...x, content: e.target.value }))} placeholder="लेख का पूरा विषय लिखें...&#10;&#10;## उपशीर्षक के लिए ## का उपयोग करें&#10;&#10;> उद्धरण के लिए > का उपयोग करें&#10;&#10;पैराग्राफ के बीच एक खाली लाइन छोड़ें" rows={16} style={{ ...inputStyle, resize: "vertical", fontFamily: sansFont, lineHeight: 1.7 }} />
              <p style={{ fontFamily: sansFont, fontSize: 11, color: C.light, margin: "6px 0 0" }}>Tips: Use ## for headings, {'>'} for quotes, empty lines between paragraphs</p>
            </div>
          ) : (
            <div style={{ padding: "20px 24px", border: `1px solid ${C.border}`, borderRadius: 10, minHeight: 200, background: C.cream }}>
              {f.content.split('\n\n').map((para, i) => {
                if (para.startsWith('## ')) return <h3 key={i} style={{ fontFamily: font, fontSize: 20, color: C.maroon, margin: "16px 0 8px" }}>{para.replace('## ', '')}</h3>;
                if (para.startsWith('### ')) return <h4 key={i} style={{ fontFamily: font, fontSize: 17, color: C.saffron, margin: "12px 0 6px" }}>{para.replace('### ', '')}</h4>;
                if (para.startsWith('> ')) return <blockquote key={i} style={{ borderLeft: `4px solid ${C.gold}`, padding: "10px 16px", margin: "12px 0", background: C.goldLight, borderRadius: "0 8px 8px 0", fontFamily: font, fontSize: 15, color: C.maroon, fontStyle: "italic" }}>{para.replace('> ', '')}</blockquote>;
                return <p key={i} style={{ fontFamily: sansFont, fontSize: 15, color: C.mid, lineHeight: 1.7, margin: "0 0 12px" }}>{para}</p>;
              })}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" id="published" checked={f.published} onChange={e => setF(x => ({ ...x, published: e.target.checked }))} />
          <label htmlFor="published" style={{ fontFamily: sansFont, fontSize: 14, color: C.dark, cursor: "pointer" }}>Publish immediately</label>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSubmit} disabled={saving} style={{ fontFamily: sansFont, fontSize: 14, fontWeight: 700, padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer", background: C.saffron, color: "#fff", opacity: saving ? 0.5 : 1 }}>{saving ? "Saving..." : post ? "💾 Update" : "📝 Publish"}</button>
          <button onClick={onCancel} style={{ fontFamily: sansFont, fontSize: 14, padding: "12px 24px", borderRadius: 10, border: `1.5px solid ${C.border}`, cursor: "pointer", background: "#fff", color: C.mid }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
