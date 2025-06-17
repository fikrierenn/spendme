import { supabase } from './supabaseClient';
import { normalize } from './normalize';

// Vendor alias eşleşmesi: önce user_id, sonra global (user_id IS NULL)
export async function matchVendorAlias(text, userId) {
  const alias = normalize(text);
  const { data, error } = await supabase
    .from('spendme_vendor_aliases')
    .select('*')
    .eq('alias', alias)
    .in('user_id', [null, userId])
    .order('user_id', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data && data.length > 0 ? data[0].vendor : null;
}

// Vendor için kategori eşleşmesi: önce user_id, sonra global (user_id IS NULL)
export async function matchCategoryForVendor(vendor, userId) {
  const { data, error } = await supabase
    .from('spendme_learned_keywords')
    .select('*')
    .eq('keyword', vendor)
    .in('user_id', [null, userId])
    .order('user_id', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data && data.length > 0 ? data[0].category_id : null;
}

// Kullanıcı override etmiş mi? (user_id ile kayıt var mı?)
export async function checkIfOverrideExists(alias, userId) {
  const { data, error } = await supabase
    .from('spendme_vendor_aliases')
    .select('*')
    .eq('alias', alias)
    .eq('user_id', userId)
    .limit(1);
  if (error) throw error;
  return data && data.length > 0;
} 