import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

// ─── Clients ───
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ─── Session (stored in Supabase) ───
async function getSession(phone) {
  const { data } = await supabase.from('bot_sessions').select('*').eq('phone', phone).single();
  if (data) return { step: data.step, data: data.data || {} };
  return { step: "welcome", data: {} };
}

async function saveSession(phone, session) {
  await supabase.from('bot_sessions').upsert({
    phone,
    step: session.step,
    data: session.data,
    updated_at: new Date().toISOString(),
  });
}

async function deleteSession(phone) {
  await supabase.from('bot_sessions').delete().eq('phone', phone);
}

// ─── Helpers ───
async function getTemples() {
  const { data } = await supabase.from('temples').select('id, name, location').order('created_at');
  return data || [];
}

async function getPujas(templeId) {
  const { data } = await supabase.from('pujas').select('*').eq('temple_id', templeId).order('created_at');
  return data || [];
}

async function saveRegistration(reg) {
  const { data, error } = await supabase.from('registrations').insert(reg).select().single();
  if (error) throw error;
  return data;
}

async function sendWhatsApp(to, body) {
  await twilioClient.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`,
    body,
  });
}

// ─── Conversation Flow ───
async function handleMessage(from, body, mediaUrl) {
  const session = await getSession(from);
  const msg = body.trim().toLowerCase();

  // Reset command
  if (msg === 'reset' || msg === 'start' || msg === 'hi' || msg === 'hello' || msg === 'namaste' || msg === '🙏') {
    const temples = await getTemples();
    if (temples.length === 0) {
      return "🙏 नमस्कार! Welcome to Shree Dattaraj Gurumauli Puja Registration.\n\nNo temples are currently available. Please check back later.";
    }
    let templeList = temples.map((t, i) => `${i + 1}. 🛕 ${t.name}\n   📍 ${t.location}`).join('\n\n');
    await saveSession(from, { step: "select_temple", data: { temples } });
    return `🙏 नमस्कार! Welcome to *Shree Dattaraj Gurumauli* Puja Registration.\n\nPlease select a temple by sending the number:\n\n${templeList}`;
  }

  // ─── Step: Select Temple ───
  if (session.step === "select_temple") {
    const num = parseInt(msg);
    const temples = session.data.temples;
    if (isNaN(num) || num < 1 || num > temples.length) {
      return `Please send a number between 1 and ${temples.length} to select a temple.`;
    }
    const temple = temples[num - 1];
    const pujas = await getPujas(temple.id);
    if (pujas.length === 0) {
      return `No pujas available at ${temple.name} right now. Send *hi* to start over.`;
    }
    let pujaList = pujas.map((p, i) => `${i + 1}. 🪔 ${p.name} — ₹${p.price}\n   ⏱ ${p.duration}`).join('\n\n');
    await saveSession(from, { step: "select_pujas", data: { ...session.data, selectedTemple: temple, pujas } });
    return `🛕 *${temple.name}*\n\nSelect pujas (send numbers separated by commas for multiple):\n\n${pujaList}\n\n_Example: 1,3 for first and third puja_`;
  }

  // ─── Step: Select Pujas ───
  if (session.step === "select_pujas") {
    const pujas = session.data.pujas;
    const nums = msg.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 1 && n <= pujas.length);
    if (nums.length === 0) {
      return `Please send valid puja numbers (1 to ${pujas.length}). Separate with commas for multiple.`;
    }
    const selectedPujas = nums.map(n => pujas[n - 1]);
    const total = selectedPujas.reduce((s, p) => s + p.price, 0);
    let summary = selectedPujas.map(p => `• ${p.name} — ₹${p.price}`).join('\n');
    await saveSession(from, { step: "get_name", data: { ...session.data, selectedPujas } });
    return `✅ Selected:\n${summary}\n💰 Total: ₹${total}\n\nNow please send your *full name*:`;
  }

  // ─── Step: Get Name ───
  if (session.step === "get_name") {
    if (body.trim().length < 2) return "Please enter a valid name.";
    await saveSession(from, { step: "get_gotra", data: { ...session.data, devoteeName: body.trim() } });
    return `🙏 ${body.trim()}, please send your *Gotra*:\n\n_Send "skip" if you prefer not to share_`;
  }

  // ─── Step: Get Gotra ───
  if (session.step === "get_gotra") {
    const gotra = msg === "skip" ? null : body.trim();
    await saveSession(from, { step: "get_members", data: { ...session.data, gotra } });
    return "👨‍👩‍👧‍👦 How many *members* will attend? Send a number:";
  }

  // ─── Step: Get Members ───
  if (session.step === "get_members") {
    const members = parseInt(msg);
    if (isNaN(members) || members < 1 || members > 50) return "Please send a number between 1 and 50.";
    const total = session.data.selectedPujas.reduce((s, p) => s + p.price, 0) * members;
    await saveSession(from, { step: "get_date", data: { ...session.data, members, totalAmount: total } });
    return `💰 Total for ${members} member${members > 1 ? 's' : ''}: *₹${total}*\n\n📅 Please send your *preferred date*:\n_Format: DD/MM/YYYY (e.g. 15/06/2026)_`;
  }

  // ─── Step: Get Date ───
  if (session.step === "get_date") {
    const parts = body.trim().split(/[\/\-\.]/);
    let dateStr = null;
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      dateStr = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    if (!dateStr) return "Please send date in DD/MM/YYYY format (e.g. 15/06/2026).";
    await saveSession(from, { step: "get_email", data: { ...session.data, date: dateStr } });
    return "📧 Send your *email address* (or send *skip*):";
  }

  // ─── Step: Get Email ───
  if (session.step === "get_email") {
    const email = msg === "skip" ? null : body.trim();
    await saveSession(from, { step: "payment", data: { ...session.data, email } });
    const total = session.data.totalAmount;
    return `💳 *Payment Details*\n\nAmount: *₹${total}*\n\nPlease pay via UPI or Bank Transfer and send the *payment screenshot* here.\n\n_You can also send "skip" to pay later_`;
  }

  // ─── Step: Payment Screenshot ───
  if (session.step === "payment") {
    let paymentScreenshot = null;

    if (mediaUrl) {
      paymentScreenshot = mediaUrl;
    } else if (msg === "skip") {
      paymentScreenshot = null;
    } else {
      return "📸 Please send a *photo* of your payment screenshot, or send *skip* to pay later.";
    }

    // Save registration
    const reg = {
      id: 'r' + Date.now(),
      devotee_name: session.data.devoteeName,
      phone: from.replace('+', ''),
      email: session.data.email,
      gotra: session.data.gotra,
      temple_id: session.data.selectedTemple.id,
      puja_ids: session.data.selectedPujas.map(p => p.id),
      date: session.data.date,
      time: null,
      members: session.data.members,
      payment_screenshot: paymentScreenshot,
      status: 'pending',
    };

    try {
      await saveRegistration(reg);
    } catch (e) {
      return `❌ Error saving registration: ${e.message}\n\nPlease try again. Send *hi* to restart.`;
    }

    const temple = session.data.selectedTemple;
    const pujaNames = session.data.selectedPujas.map(p => `• ${p.name}`).join('\n');
    const paymentNote = paymentScreenshot
      ? '📸 Payment screenshot received — our coordinator will verify and confirm your booking.'
      : '⏳ Payment pending — please pay and share screenshot to confirm your booking.';

    // Clear session
    await deleteSession(from);

    return `🎉 *Registration Successful!*\n\n🛕 *${temple.name}*\n📍 ${temple.location}\n\n🪔 *Pujas:*\n${pujaNames}\n\n👤 ${session.data.devoteeName}${session.data.gotra ? `\n📿 Gotra: ${session.data.gotra}` : ''}\n👨‍👩‍👧‍👦 ${session.data.members} member${session.data.members > 1 ? 's' : ''}\n📅 ${session.data.date}\n💰 Total: ₹${session.data.totalAmount}\n\n${paymentNote}\n\n🙏 जय श्री दत्तराज गुरुमाऊली!\n\n_Send *hi* to make another booking_`;
  }

  // Default
  return "🙏 Send *hi* or *namaste* to start a new puja registration!";
}

// ─── Vercel API Handler ───
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'WhatsApp Bot Active', timestamp: new Date().toISOString() });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const from = req.body.From?.replace('whatsapp:', '') || '';
    const body = req.body.Body || '';
    const mediaUrl = req.body.MediaUrl0 || null;

    console.log(`Message from ${from}: ${body}${mediaUrl ? ' [with image]' : ''}`);

    const reply = await handleMessage(from, body, mediaUrl);
    await sendWhatsApp(from, reply);

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');
  } catch (e) {
    console.error('Webhook error:', e);
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');
  }
}
