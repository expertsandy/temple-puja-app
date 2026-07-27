import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const CATEGORY_PHOTOS = {
  "पूजा विधि": ["hindu puja ritual", "temple worship diya", "indian puja ceremony", "oil lamp worship"],
  "तीर्थ क्षेत्र": ["indian temple architecture", "hindu pilgrimage temple", "ancient indian temple", "temple river india"],
  "अध्यात्म": ["meditation spiritual india", "lotus flower spiritual", "yoga meditation", "indian spiritual"],
  "गुरु परंपरा": ["indian sage guru", "spiritual teacher india", "monk meditation india", "hindu sadhu"],
  "दत्त संप्रदाय": ["hindu temple india", "sacred temple india", "indian religious ceremony", "temple prayer india"],
};

async function fetchPexelsPhoto(category, topic) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;
  try {
    const queries = CATEGORY_PHOTOS[category] || ["hindu temple spiritual india"];
    const query = queries[topic.length % queries.length];
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.photos?.length) return null;
    const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
    return photo.src.large;
  } catch (e) { return null; }
}

async function reformatPost(post) {
  const prompt = `You are a blog editor for a Hindu spiritual platform (Datta Sampradaya tradition).

Here is an existing blog post. Please:
1. Clean up and reformat the content (fix spacing, improve paragraph structure, add ## headings if missing)
2. Generate 5-8 relevant English tags for SEO
3. Improve excerpts if they are too short or missing

Return ONLY valid JSON with no markdown backticks:

{
  "excerpt_hi": "improved Hindi excerpt (2-3 sentences)",
  "excerpt_en": "improved English excerpt (2-3 sentences)",
  "excerpt_mr": "improved Marathi excerpt (2-3 sentences)",
  "content_hi": "reformatted Hindi content",
  "content_en": "reformatted English content",
  "content_mr": "reformatted Marathi content",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Existing post data:
Title (Hindi): ${post.title || ""}
Title (English): ${post.title_en || post.title || ""}
Category: ${post.category || ""}
Current excerpt (Hindi): ${post.excerpt || ""}
Current content (Hindi): ${(post.content || "").substring(0, 1000)}...
Current content (English): ${(post.content_en || "").substring(0, 1000)}...

Rules:
- Keep the same meaning, just improve formatting
- Tags should be in English (e.g. "Dattatreya", "Puja", "Datta Sampradaya")
- Hindi and Marathi must use Devanagari script
- Keep content length similar to original
- IMPORTANT: Return only valid JSON, no extra text`;

  const result = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 6000,
    messages: [{ role: "user", content: prompt }],
  });

  let text = result.content[0].text.trim();
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) text = text.substring(start, end + 1);
  return JSON.parse(text);
}

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Fetch all published posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const limit = parseInt(req.query.limit) || 3; // process 3 at a time to avoid timeout
    const offset = parseInt(req.query.offset) || 0;
    const batch = posts.slice(offset, offset + limit);

    if (batch.length === 0) {
      return res.status(200).json({ message: "All posts processed!", total: posts.length });
    }

    const results = [];

    for (const post of batch) {
      try {
        console.log(`Processing: ${post.title_en || post.title}`);
        const improved = await reformatPost(post);

        // Generate clean slug from English title
        const slugSource = post.title_en || post.title || "";
        const slug = slugSource
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 100);

        // Fetch photo if post doesn't have one
        let coverImage = post.cover_image;
        if (!coverImage) {
          coverImage = await fetchPexelsPhoto(post.category, post.title_en || post.title || "");
        }

        await supabase
          .from('blog_posts')
          .update({
            excerpt: improved.excerpt_hi || post.excerpt,
            excerpt_en: improved.excerpt_en || post.excerpt_en,
            excerpt_mr: improved.excerpt_mr || post.excerpt_mr,
            content: improved.content_hi || post.content,
            content_en: improved.content_en || post.content_en,
            content_mr: improved.content_mr || post.content_mr,
            tags: improved.tags || [],
            slug: slug,
            cover_image: coverImage,
          })
          .eq('id', post.id);

        results.push({ id: post.id, title: post.title_en || post.title, tags: improved.tags, slug });
        // Small delay between posts
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        results.push({ id: post.id, error: e.message });
      }
    }

    return res.status(200).json({
      processed: results,
      nextOffset: offset + limit,
      remaining: posts.length - (offset + limit),
      message: `Processed ${batch.length} posts. ${posts.length - offset - limit > 0 ? `Run again with ?offset=${offset + limit} for next batch.` : 'All done!'}`
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
