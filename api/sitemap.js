import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const baseUrl = "https://shreedattarajgurumauli.com";
  const today = new Date().toISOString().split("T")[0];

  // Static pages
  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/register", priority: "0.9", changefreq: "weekly" },
    { url: "/my-bookings", priority: "0.7", changefreq: "weekly" },
    { url: "/tools", priority: "0.8", changefreq: "weekly" },
    { url: "/ai-tools", priority: "0.8", changefreq: "weekly" },
    { url: "/chat", priority: "0.8", changefreq: "weekly" },
    { url: "/blog", priority: "0.9", changefreq: "daily" },
    { url: "/about", priority: "0.6", changefreq: "monthly" },
    { url: "/privacy", priority: "0.3", changefreq: "monthly" },
    { url: "/terms", priority: "0.3", changefreq: "monthly" },
    { url: "/refund", priority: "0.3", changefreq: "monthly" },
  ];

  // Fetch published blog posts with slugs
  let blogPosts = [];
  try {
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, created_at, updated_at")
      .eq("published", true)
      .not("slug", "is", null)
      .order("created_at", { ascending: false });
    blogPosts = data || [];
  } catch (e) {
    console.error("Failed to fetch blog posts:", e);
  }

  // Build XML
  const staticUrls = staticPages.map(p => `
  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("");

  const blogUrls = blogPosts.map(p => `
  <url>
    <loc>${baseUrl}/blog/${p.slug}</loc>
    <lastmod>${(p.updated_at || p.created_at || today).split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticUrls}
${blogUrls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate"); // cache 1 hour
  res.status(200).send(xml);
}
