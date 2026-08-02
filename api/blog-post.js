import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Detect if request is from a crawler
function isCrawler(userAgent = "") {
  const bots = ["googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider", "yandexbot", "facebookexternalhit", "twitterbot", "linkedinbot", "whatsapp", "telegrambot"];
  const ua = userAgent.toLowerCase();
  return bots.some(bot => ua.includes(bot));
}

export default async function handler(req, res) {
  const slug = req.query.slug;
  if (!slug) return res.status(400).send("Missing slug");

  try {
    // Fetch post by slug
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !post) {
      return res.status(404).send("Post not found");
    }

    const title = post.title_en || post.title || "Shree Dattaraj Gurumauli Blog";
    const description = post.excerpt_en || post.excerpt || title;
    const image = post.cover_image || "https://shreedattarajgurumauli.com/gurudev.png";
    const url = `https://shreedattarajgurumauli.com/blog/${slug}`;
    const tags = (post.tags || []).join(", ");

    // Strip markdown from content for meta
    const content = (post.content_en || post.content || "")
      .replace(/##\s/g, "").replace(/>\s/g, "").substring(0, 500);

    // Return full HTML for crawlers OR redirect SPA for users
    const userAgent = req.headers["user-agent"] || "";

    if (isCrawler(userAgent)) {
      // Return pre-rendered HTML for crawlers
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — श्री दत्तराज गुरुमाऊली</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${tags}, Datta Sampradaya, पूजा बुकिंग, shreedattarajgurumauli">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url}">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:site_name" content="श्री दत्तराज गुरुमाऊली">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">

  <!-- Article Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title}",
    "description": "${description}",
    "image": "${image}",
    "url": "${url}",
    "datePublished": "${post.created_at}",
    "author": {
      "@type": "Organization",
      "name": "Shree Dattaraj Gurumauli"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Shree Dattaraj Gurumauli",
      "url": "https://shreedattarajgurumauli.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://shreedattarajgurumauli.com/logo.png"
      }
    },
    "keywords": "${tags}"
  }
  </script>
</head>
<body>
  <article>
    <h1>${title}</h1>
    <p>${description}</p>
    <div>${content}</div>
    ${(post.tags || []).map(t => `<a href="https://shreedattarajgurumauli.com/blog">#${t}</a>`).join(" ")}
  </article>
  <script>
    // Redirect real users to SPA
    window.location.href = "${url}";
  </script>
</body>
</html>`;
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "s-maxage=3600");
      return res.status(200).send(html);
    } else {
      // For real users, serve the SPA index.html
      const spaHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — श्री दत्तराज गुरुमाऊली</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${url}">
  <link rel="icon" type="image/png" href="/logo.png">
  <meta name="google-adsense-account" content="ca-pub-4798640663789775">
  <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'DM Sans', sans-serif; background: #fdf8f0; }</style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`;
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(spaHtml);
    }
  } catch (e) {
    return res.status(500).send("Server error: " + e.message);
  }
}
