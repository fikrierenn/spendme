import { supabase } from './supabaseClient';

export class SupabaseDynamicParser {
  constructor() {
    this.cache = {
      vendorAliases: [],
      accounts: [],
      keywords: [],
      categories: [],
      lastUpdated: null
    };
  }

  async loadUserData(userId) {
    // 5dk cache kontrolü
    if (this.cache.lastUpdated && Date.now() - this.cache.lastUpdated < 300000) return;

    // Vendor aliases (user + global)
    const { data: vendorAliases } = await supabase
      .from('spendme_vendor_aliases')
      .select('alias,vendor,user_id')
      .in('user_id', [userId, null])
      .order('user_id', { ascending: false });

    // Accounts
    const { data: accounts } = await supabase
      .from('spendme_accounts')
      .select('id,name,type,icon,user_id')
      .eq('user_id', userId);

    // Keywords (kategori eşleşmesi)
    const { data: keywords } = await supabase
      .from('spendme_learned_keywords')
      .select('keyword,category_id,user_id')
      .in('user_id', [userId, null])
      .order('user_id', { ascending: false });

    // Categories
    const { data: categories } = await supabase
      .from('spendme_categories')
      .select('id,name,type,icon,user_id')
      .in('user_id', [userId, null])
      .order('user_id', { ascending: false });

    this.cache = {
      vendorAliases: vendorAliases || [],
      accounts: accounts || [],
      keywords: keywords || [],
      categories: categories || [],
      lastUpdated: Date.now()
    };
  }

  extractAmount(text) {
    const match = text.match(/(\d+(?:[.,]\d+)?)\s*tl/i);
    if (match) return parseFloat(match[1].replace(',', '.'));
    return null;
  }

  extractVendor(text) {
    // 1. Exact match
    for (const v of this.cache.vendorAliases) {
      if (text.toLowerCase().includes(v.alias.toLowerCase())) {
        return { vendor: v.vendor, confidence: 1.0 };
      }
    }
    // 2. Fallback: İlk iki büyük harfli kelimeyi birleştir
    const words = text.split(' ');
    const caps = words.filter(w => w[0] && w[0] === w[0].toUpperCase());
    if (caps.length >= 2) return { vendor: caps.slice(0,2).join(' '), confidence: 0.5 };
    if (caps.length === 1) return { vendor: caps[0], confidence: 0.5 };
    return { vendor: null, confidence: 0 };
  }

  extractAccount(text) {
    const matches = this.cache.accounts.filter(acc =>
      text.toLowerCase().includes(acc.name.toLowerCase())
    );
    if (matches.length === 1) {
      return { account: matches[0].name, confidence: 1.0 };
    }
    if (matches.length > 1) {
      // Bağlamdan tip tahmini
      const lower = text.toLowerCase();
      const typeHints = [
        { type: 'credit', hints: ['kart', 'bonus', 'kredi'] },
        { type: 'bank', hints: ['banka', 'hesap'] }
      ];
      for (const { type, hints } of typeHints) {
        const filtered = matches.filter(acc =>
          acc.type === type && hints.some(h => lower.includes(h))
        );
        if (filtered.length === 1) {
          return { account: filtered[0].name, confidence: 1.0 };
        }
      }
      // Hala birden fazla varsa, kullanıcıya seçim yaptırmak için ambiguous döndür
      return { account: null, confidence: 0, ambiguous: matches.map(acc => acc.name) };
    }
    return { account: null, confidence: 0 };
  }

  async parse(text, userId) {
    await this.loadUserData(userId);
    const amount = this.extractAmount(text);
    const { vendor, confidence: vendorConfidence } = this.extractVendor(text);
    const { account, confidence: accountConfidence } = this.extractAccount(text);

    // Kategori eşleşmesi (keyword ile)
    let category_id = null;
    for (const kw of this.cache.keywords) {
      if (text.toLowerCase().includes(kw.keyword.toLowerCase())) {
        category_id = kw.category_id;
        break;
      }
    }

    return {
      amount,
      vendor,
      account,
      category_id,
      confidence: {
        vendor: vendorConfidence,
        account: accountConfidence
      }
    };
  }

  // Öğrenme fonksiyonları
  async learnVendorAlias(alias, vendor, userId) {
    await supabase.from('spendme_vendor_aliases').insert([{ alias, vendor, user_id: userId }]);
    this.cache.lastUpdated = null; // Cache'i sıfırla
  }

  async learnVendorCategory(keyword, category_id, userId) {
    await supabase.from('spendme_learned_keywords').insert([{ keyword, category_id, user_id: userId }]);
    this.cache.lastUpdated = null;
  }
} 