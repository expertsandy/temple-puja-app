import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Missing Supabase credentials.\n' +
    'Create a .env.local file with:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Auth Operations ───

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ─── Temple Operations ───

export async function fetchTemples() {
  const { data: temples, error } = await supabase
    .from('temples')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Fetch pujas for each temple
  const { data: pujas, error: pujasError } = await supabase
    .from('pujas')
    .select('*')
    .order('created_at', { ascending: true });

  if (pujasError) throw pujasError;

  // Attach pujas to their temples
  return temples.map(t => ({
    ...t,
    // Map snake_case DB columns to camelCase used in the app
    deityPhoto: t.deity_photo,
    templePhoto: t.temple_photo,
    pujas: pujas
      .filter(p => p.temple_id === t.id)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        duration: p.duration,
        description: p.description,
      })),
  }));
}

export async function addTemple(temple) {
  const { data, error } = await supabase
    .from('temples')
    .insert({
      id: temple.id,
      name: temple.name,
      location: temple.location,
      icon: temple.icon,
      description: temple.description || null,
      deity_photo: temple.deityPhoto || null,
      temple_photo: temple.templePhoto || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTemple(temple) {
  const { error } = await supabase
    .from('temples')
    .update({
      name: temple.name,
      location: temple.location,
      icon: temple.icon,
      description: temple.description || null,
      deity_photo: temple.deityPhoto || null,
      temple_photo: temple.templePhoto || null,
    })
    .eq('id', temple.id);

  if (error) throw error;
}

export async function deleteTemple(templeId) {
  // First delete all registrations linked to this temple
  await supabase
    .from('registrations')
    .delete()
    .eq('temple_id', templeId);

  // Then delete the temple (pujas cascade automatically)
  const { error } = await supabase
    .from('temples')
    .delete()
    .eq('id', templeId);

  if (error) throw error;
}

// ─── Puja Operations ───

export async function addPuja(templeId, puja) {
  const { data, error } = await supabase
    .from('pujas')
    .insert({
      id: puja.id,
      temple_id: templeId,
      name: puja.name,
      price: puja.price,
      duration: puja.duration || '30 min',
      description: puja.description || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePuja(pujaId) {
  const { error } = await supabase
    .from('pujas')
    .delete()
    .eq('id', pujaId);

  if (error) throw error;
}

// ─── Registration Operations ───

export async function fetchRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(r => ({
    id: r.id,
    devoteeName: r.devotee_name,
    phone: r.phone,
    email: r.email,
    gotra: r.gotra,
    templeId: r.temple_id,
    pujaIds: r.puja_ids,
    date: r.date,
    time: r.time,
    members: r.members,
    paymentScreenshot: r.payment_screenshot,
    status: r.status,
    createdAt: r.created_at,
    priestId: r.priest_id,
    priestNotes: r.priest_notes,
  }));
}

export async function addRegistration(reg) {
  const { data, error } = await supabase
    .from('registrations')
    .insert({
      id: reg.id,
      devotee_name: reg.devoteeName,
      phone: reg.phone,
      email: reg.email || null,
      gotra: reg.gotra || null,
      temple_id: reg.templeId,
      puja_ids: reg.pujaIds,
      date: reg.date,
      time: reg.time || null,
      members: reg.members || 1,
      payment_screenshot: reg.paymentScreenshot || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRegistrationStatus(id, status) {
  const { error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteRegistration(id) {
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function fetchDevoteeBookings(phone) {
  // Search by last 10 digits of phone
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .like('phone', `%${phone}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ─── Social Links Operations ───

export async function fetchSocialLinks() {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addSocialLink(link) {
  const { data, error } = await supabase
    .from('social_links')
    .insert({
      id: link.id,
      platform: link.platform,
      url: link.url,
      label: link.label || null,
      sort_order: link.sort_order || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSocialLink(link) {
  const { error } = await supabase
    .from('social_links')
    .update({
      platform: link.platform,
      url: link.url,
      label: link.label || null,
      sort_order: link.sort_order || 0,
    })
    .eq('id', link.id);

  if (error) throw error;
}

export async function deleteSocialLink(id) {
  const { error } = await supabase
    .from('social_links')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── Blog Operations ───

export async function fetchBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addBlogPost(post) {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      id: post.id,
      title: post.title,
      title_en: post.title_en || null,
      title_mr: post.title_mr || null,
      excerpt: post.excerpt || null,
      excerpt_en: post.excerpt_en || null,
      excerpt_mr: post.excerpt_mr || null,
      content: post.content,
      content_en: post.content_en || null,
      content_mr: post.content_mr || null,
      category: post.category || null,
      author: post.author || null,
      cover_image: post.cover_image || null,
      published: post.published ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBlogPost(post) {
  const { error } = await supabase
    .from('blog_posts')
    .update({
      title: post.title,
      title_en: post.title_en || null,
      title_mr: post.title_mr || null,
      excerpt: post.excerpt || null,
      excerpt_en: post.excerpt_en || null,
      excerpt_mr: post.excerpt_mr || null,
      content: post.content,
      content_en: post.content_en || null,
      content_mr: post.content_mr || null,
      category: post.category || null,
      author: post.author || null,
      cover_image: post.cover_image || null,
      published: post.published ?? true,
    })
    .eq('id', post.id);

  if (error) throw error;
}

export async function deleteBlogPost(id) {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── Priest Operations ───

export async function fetchPriests() {
  const { data, error } = await supabase
    .from('priests')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addPriest(priest) {
  const { data, error } = await supabase
    .from('priests')
    .insert({
      id: priest.id,
      name: priest.name,
      phone: priest.phone || null,
      email: priest.email || null,
      specializations: priest.specializations || null,
      temple_ids: priest.temple_ids || [],
      notes: priest.notes || null,
      active: priest.active ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePriest(priest) {
  const { error } = await supabase
    .from('priests')
    .update({
      name: priest.name,
      phone: priest.phone || null,
      email: priest.email || null,
      specializations: priest.specializations || null,
      temple_ids: priest.temple_ids || [],
      notes: priest.notes || null,
      active: priest.active ?? true,
    })
    .eq('id', priest.id);

  if (error) throw error;
}

export async function deletePriest(id) {
  const { error } = await supabase
    .from('priests')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function assignPriestToRegistration(registrationId, priestId, priestNotes) {
  const { error } = await supabase
    .from('registrations')
    .update({
      priest_id: priestId || null,
      priest_notes: priestNotes || null,
    })
    .eq('id', registrationId);

  if (error) throw error;
}
