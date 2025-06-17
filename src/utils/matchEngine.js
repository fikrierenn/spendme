import { supabase } from './supabaseClient';
import { normalize } from './normalize';

// Vendor eşleşmesini bul: önce kullanıcı özelini, sonra globali kontrol eder
export async function matchVendorAlias(aliasRaw, userId) {
  const alias = normalize(aliasRaw);
  const { data, error } = await supabase
    .from('spendme_vendor_aliases')
    .select('vendor')
    .eq('alias', alias)
    .in('user_id', [userId, null])
    .order('user_id', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0]?.vendor || null;
}

// Vendor üzerinden kategori eşleşmesini bul: yine önce kişisel, sonra global
export async function matchCategoryForVendor(vendor, userId) {
  const { data, error } = await supabase
    .from('spendme_learned_keywords')
    .select('category_id')
    .eq('keyword', vendor)
    .in('user_id', [userId, null])
    .order('user_id', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0]?.category_id || null;
}

// Toplam eşleşme fonksiyonu
export async function parseVendorAndCategory(text, userId) {
  const vendor = await matchVendorAlias(text, userId);
  if (!vendor) return { vendor: null, category_id: null };
  const category_id = await matchCategoryForVendor(vendor, userId);
  return { vendor, category_id };
} 