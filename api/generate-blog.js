import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Blog Topics Pool ───
const TOPICS = [
  { topic: "Importance of Guru Purnima in Datta Sampradaya", category: "दत्त संप्रदाय" },
  { topic: "The significance of chanting 'Digambara Digambara Shripad Vallabh Digambara'", category: "अध्यात्म" },
  { topic: "Audumbar - The sacred pilgrimage of Datta devotees", category: "तीर्थ क्षेत्र" },
  { topic: "How to perform daily Datta Puja at home", category: "पूजा विधि" },
  { topic: "The story of Shripad Shrivallabh - first avatar of Dattatreya", category: "गुरु परंपरा" },
  { topic: "Significance of Gurucharitra Parayan - the sacred reading", category: "पूजा विधि" },
  { topic: "Nrusimhawadi - where the holy Padukas reside", category: "तीर्थ क्षेत्र" },
  { topic: "Dattatreya and the Avadhoot tradition", category: "अध्यात्म" },
  { topic: "The sacred Audumbar tree and its connection to Lord Dattatreya", category: "दत्त संप्रदाय" },
  { topic: "Navratri celebrations in Datta Sampradaya", category: "पूजा विधि" },
  { topic: "Girnar Mountain - the eternal abode of Lord Dattatreya", category: "तीर्थ क्षेत्र" },
  { topic: "The teachings of Dattatreya from Shrimad Bhagavatam", category: "अध्यात्म" },
  { topic: "How Datta Sampradaya promotes unity beyond caste and creed", category: "दत्त संप्रदाय" },
  { topic: "The significance of Thursday (Guruvar) in Datta worship", category: "पूजा विधि" },
  { topic: "Akkalkot - the sacred seat of Shri Swami Samarth", category: "तीर्थ क्षेत्र" },
  { topic: "Mantras and stotras for daily Datta Upasana", category: "पूजा विधि" },
  { topic: "The Datta Kshetras of Maharashtra - a spiritual journey", category: "तीर्थ क्षेत्र" },
  { topic: "Understanding Triputi - the three forms of Dattatreya", category: "अध्यात्म" },
  { topic: "Mahanubhav Panth and its connection to Datta tradition", category: "गुरु परंपरा" },
  { topic: "The symbolism of Dattatreya's four dogs and the cow", category: "दत्त संप्रदाय" },
  { topic: "Shri Vasudevanand Saraswati (Tembe Swami) - life and teachings", category: "गुरु परंपरा" },
  { topic: "How to observe Datta Jayanti fast and rituals", category: "पूजा विधि" },
  { topic: "Pithapuram - the birthplace of Shripad Shrivallabh", category: "तीर्थ क्षेत्र" },
  { topic: "The role of faith and surrender in Datta Bhakti", category: "अध्यात्म" },
  { topic: "Kurvapur - the sacred island of Datta devotees", category: "तीर्थ क्षेत्र" },
  { topic: "Preparing Naivedya for Datta Puja - what offerings to make", category: "पूजा विधि" },
  { topic: "The significance of Paduka worship in Datta tradition", category: "दत्त संप्रदाय" },
  { topic: "Spiritual lessons from the story of King Yadu and Dattatreya", category: "अध्यात्म" },
  { topic: "Shri Narasimha Saraswati's miracles at Ganagapur", category: "गुरु परंपरा" },
  { topic: "The importance of Sankalp (intention) before performing puja", category: "पूजा विधि" },
];

async function getUsedTopics() {
  const { data } = await supabase.from('blog_posts').select('title, title_en').order('created_at', { ascending: false }).limit(30);
  return (data || []).map(d => (d.title_en || d.title || "").toLowerCase());
}

async function generateBlogPost(topic, category) {
  const prompt = `You are a knowledgeable writer about Hindu spirituality, specifically the Datta Sampradaya tradition. Write a blog article about: "${topic}"

Write the article in THREE languages. Respond ONLY in valid JSON with no other text, no markdown backticks:

{
  "title_hi": "Hindi title",
  "title_en": "English title", 
  "title_mr": "Marathi title",
  "excerpt_hi": "Hindi excerpt (2-3 sentences)",
  "excerpt_en": "English excerpt (2-3 sentences)",
  "excerpt_mr": "Marathi excerpt (2-3 sentences)",
  "content_hi": "Full Hindi article",
  "content_en": "Full English article",
  "content_mr": "Full Marathi article"
}

Article guidelines:
- Each language version should be 400-600 words
- Use ## for section headings and > for quotes/shlokas
- Separate paragraphs with blank lines (\\n\\n)
- Include relevant Sanskrit shlokas or mantras where appropriate (use > for these)
- Be respectful and authentic to the Datta Sampradaya tradition
- Include practical guidance where applicable
- End with a mention of Shree Dattaraj Gurumauli's service to devotees
- The content should be spiritually enriching and informative
- Hindi should use Devanagari script
- Marathi should use Devanagari script with proper Marathi vocabulary (not Hindi)`;

  const result = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = result.content[0].text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

export default async function handler(req, res) {
  // Verify cron secret to prevent unauthorized calls
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow GET for manual trigger with secret as query param
    if (req.query.secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  try {
    // Get already used topics
    const usedTopics = await getUsedTopics();

    // Find an unused topic
    const availableTopics = TOPICS.filter(t => !usedTopics.some(used => used.includes(t.topic.toLowerCase().slice(0, 30))));

    if (availableTopics.length === 0) {
      return res.status(200).json({ message: "All topics exhausted. Add more topics to the pool." });
    }

    // Pick a random topic from available ones
    const selected = availableTopics[Math.floor(Math.random() * availableTopics.length)];

    console.log(`Generating blog post: ${selected.topic}`);

    // Generate the article
    const article = await generateBlogPost(selected.topic, selected.category);

    // Save to database
    const { error } = await supabase.from('blog_posts').insert({
      id: "blog_auto_" + Date.now(),
      title: article.title_hi,
      title_en: article.title_en,
      title_mr: article.title_mr,
      excerpt: article.excerpt_hi,
      excerpt_en: article.excerpt_en,
      excerpt_mr: article.excerpt_mr,
      content: article.content_hi,
      content_en: article.content_en,
      content_mr: article.content_mr,
      category: selected.category,
      author: "श्री दत्तराज गुरुमाऊली",
      published: true,
      cover_image: null,
    });

    if (error) throw error;

    console.log(`Blog post published: ${article.title_en}`);

    return res.status(200).json({
      success: true,
      title: article.title_en,
      category: selected.category,
      topicsRemaining: availableTopics.length - 1,
    });
  } catch (e) {
    console.error("Blog generation error:", e);
    return res.status(500).json({ error: e.message });
  }
}
