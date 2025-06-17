import { supabase } from './supabaseClient';

// Vendor için kategori öğrenme (override): user_id ile yeni kayıt ekler
export async function learnCategoryForVendor(vendor, categoryId, userId) {
  const { error } = await supabase
    .from('spendme_learned_keywords')
    .insert([{ keyword: vendor, category_id: categoryId, user_id: userId }]);
  if (error) throw error;
  return true;
} 