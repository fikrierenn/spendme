import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const months2024 = [
  "Ocak 2024", "Şubat 2024", "Mart 2024", "Nisan 2024", "Mayıs 2024", "Haziran 2024", "Temmuz 2024", "Ağustos 2024", "Eylül 2024", "Ekim 2024", "Kasım 2024", "Aralık 2024"
];

export default function Settings() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("tr");
  // Genel bütçe state (her ay için ayrı tutulacak)
  const [budgetType, setBudgetType] = useState("Aylık");
  const [monthlyBudgets, setMonthlyBudgets] = useState(() => {
    const obj = {};
    months2024.forEach(m => obj[m] = 4000);
    return obj;
  });
  const [selectedMonth, setSelectedMonth] = useState(months2024[5]); // Haziran 2024 default
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudgets[selectedMonth]);
  // Kategori bazlı bütçe state (her ay için ayrı tutulacak)
  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    const obj = {};
    months2024.forEach(m => {
      obj[m] = {
        Market: 1200,
        Ulaşım: 400,
        Restoran: 800,
        Fatura: 600,
        Diğer: 300,
      };
    });
    return obj;
  });
  const [editingCat, setEditingCat] = useState(null);
  const [catBudgetInput, setCatBudgetInput] = useState("");
  // Dinamik state'ler
  const [categories, setCategories] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kullanıcı id'sini .env veya context'ten almak gerekir, şimdilik sabit
  const userId = "b5318971-add4-48ba-85fb-b856f2bd22ca";

  useEffect(() => {
    async function fetchSettingsData() {
      setLoading(true);
      setError(null);
      try {
        // Kategoriler
        let { data: cats, error: catErr } = await supabase
          .from("spendme_categories")
          .select("id, name, icon")
          .eq("user_id", userId);
        if (catErr) throw catErr;
        setCategories(cats || []);
        // Hesaplar
        let { data: accs, error: accErr } = await supabase
          .from("spendme_accounts")
          .select("id, name, icon, type")
          .eq("user_id", userId);
        if (accErr) throw accErr;
        setBankAccounts(accs.filter(a => a.type === "bank"));
        setCreditCards(accs.filter(a => a.type === "credit_card"));
      } catch (err) {
        setError(err.message || "Veri çekilemedi");
      } finally {
        setLoading(false);
      }
    }
    fetchSettingsData();
  }, []);

  // Genel bütçe kaydet
  const handleBudgetSave = () => {
    setMonthlyBudgets({ ...monthlyBudgets, [selectedMonth]: Number(budgetInput) });
    setEditingBudget(false);
  };
  // Genel bütçeyi tüm yıla uygula
  const handleBudgetApplyAll = () => {
    const value = monthlyBudgets[selectedMonth];
    const updated = { ...monthlyBudgets };
    months2024.forEach(m => { updated[m] = value; });
    setMonthlyBudgets(updated);
  };
  // Kategori bütçesi kaydet
  const handleCatBudgetSave = (cat) => {
    setCategoryBudgets({
      ...categoryBudgets,
      [selectedMonth]: {
        ...categoryBudgets[selectedMonth],
        [cat]: Number(catBudgetInput)
      }
    });
    setEditingCat(null);
    setCatBudgetInput("");
  };
  // Kategori bütçelerini tüm yıla uygula
  const handleCatBudgetsApplyAll = () => {
    const current = categoryBudgets[selectedMonth];
    const updated = { ...categoryBudgets };
    months2024.forEach(m => { updated[m] = { ...current }; });
    setCategoryBudgets(updated);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-2 bg-gradient-to-br from-brand-lightPurple to-brand-lightGray">
      {/* Kullanıcı Özeti Kartı */}
      <div className="w-full max-w-md bg-white/80 rounded-3xl shadow-lg flex flex-col items-center mb-8 py-8 px-4">
        <div className="w-20 h-20 rounded-full bg-brand-purple flex items-center justify-center text-4xl text-white font-bold mb-3 shadow-lg">KA</div>
        <div className="text-2xl font-bold text-brand-purple mb-1">Kullanıcı Adı</div>
        <div className="text-sm text-gray-500 mb-2">kullanici@email.com</div>
        <button className="text-xs text-brand-purple hover:underline">Şifreyi Değiştir</button>
      </div>

      {/* GENEL BÜTÇE KARTI */}
      <div className="w-full max-w-md bg-white/80 rounded-3xl shadow-lg flex flex-col gap-3 mb-8 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-lg font-bold text-brand-purple"><span className="text-2xl">💰</span>Genel Bütçe</div>
          <div className="flex items-center gap-2">
            <select value={budgetType} onChange={e => setBudgetType(e.target.value)} className="rounded px-2 py-1 border border-gray-200 text-sm bg-white">
              <option value="Aylık">Aylık</option>
              <option value="Yıllık">Yıllık</option>
            </select>
            <select value={selectedMonth} onChange={e => { setSelectedMonth(e.target.value); setEditingBudget(false); setEditingCat(null); }} className="rounded px-2 py-1 border border-gray-200 text-sm bg-white ml-2">
              {months2024.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button
              className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-brand-purple text-brand-purple text-lg shadow-sm hover:bg-brand-purple hover:text-white transition relative group"
              onClick={handleBudgetApplyAll}
              title="Tüm Yıla Uygula"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-brand-purple group-hover:text-white transition"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0A8.003 8.003 0 016.058 15" /></svg>
              <span className="absolute left-1/2 -translate-x-1/2 top-10 z-20 bg-brand-purple text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition">Tüm Yıla Uygula</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {editingBudget ? (
            <>
              <input
                type="number"
                className="rounded-xl border border-gray-200 p-2 w-32 text-base focus:outline-none focus:ring-2 focus:ring-brand-purple"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                autoFocus
              />
              <button className="bg-brand-purple text-white rounded px-3 py-2 text-sm font-semibold hover:bg-purple-900 transition" onClick={handleBudgetSave}>Kaydet</button>
              <button className="text-xs text-gray-400 ml-1" onClick={() => setEditingBudget(false)}>İptal</button>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-brand-purple">{monthlyBudgets[selectedMonth]?.toLocaleString()} TL</span>
              <button className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-brand-purple text-white text-xl shadow hover:bg-purple-900 transition" onClick={() => { setEditingBudget(true); setBudgetInput(monthlyBudgets[selectedMonth]); }}><span>✏️</span></button>
            </>
          )}
        </div>
      </div>

      {/* KATEGORİ BAZLI BÜTÇELER KARTI */}
      <div className="w-full max-w-md bg-white/80 rounded-3xl shadow-lg flex flex-col gap-3 mb-8 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-lg font-bold text-brand-purple"><span className="text-2xl">📂</span>Kategori Bazlı Bütçeler</div>
          <div className="flex items-center gap-2">
            <select value={selectedMonth} onChange={e => { setSelectedMonth(e.target.value); setEditingBudget(false); setEditingCat(null); }} className="rounded px-2 py-1 border border-gray-200 text-sm bg-white">
              {months2024.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button
              className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-brand-purple text-brand-purple text-lg shadow-sm hover:bg-brand-purple hover:text-white transition relative group"
              onClick={handleCatBudgetsApplyAll}
              title="Tüm Yıla Uygula"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-brand-purple group-hover:text-white transition"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0A8.003 8.003 0 016.058 15" /></svg>
              <span className="absolute left-1/2 -translate-x-1/2 top-10 z-20 bg-brand-purple text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition">Tüm Yıla Uygula</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="text-gray-400 text-center py-2">Yükleniyor...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-2">{error}</div>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 bg-white/90 rounded-2xl px-4 py-3 shadow">
                <span className="text-xl">{cat.icon}</span>
                <span className="flex-1 font-semibold text-gray-800">{cat.name}</span>
                {editingCat === cat.name ? (
                  <>
                    <input
                      type="number"
                      className="rounded-xl border border-gray-200 p-2 w-20 text-base focus:outline-none focus:ring-2 focus:ring-brand-purple"
                      value={catBudgetInput}
                      onChange={e => setCatBudgetInput(e.target.value)}
                      autoFocus
                    />
                    <button className="bg-brand-purple text-white rounded px-2 py-1 text-xs font-semibold hover:bg-purple-900 transition ml-1" onClick={() => handleCatBudgetSave(cat.name)}>Kaydet</button>
                    <button className="text-xs text-gray-400 ml-1" onClick={() => setEditingCat(null)}>İptal</button>
                  </>
                ) : (
                  <>
                    <span className="text-lg font-bold text-brand-purple">{categoryBudgets[selectedMonth][cat.name]?.toLocaleString() || "-"} TL</span>
                    <button className="ml-2 flex items-center justify-center w-7 h-7 rounded-full bg-brand-purple text-white text-base shadow hover:bg-purple-900 transition" onClick={() => { setEditingCat(cat.name); setCatBudgetInput(categoryBudgets[selectedMonth][cat.name] || ""); }}><span>✏️</span></button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ayarlar Listesi */}
      <div className="w-full max-w-md bg-white/80 rounded-3xl shadow-lg divide-y divide-gray-100 mb-8">
        <div className="flex items-center px-6 py-5 gap-4 hover:bg-brand-lightPurple/30 transition">
          <span className="text-xl">🎨</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-brand-purple">Tema</div>
            <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full mt-1 rounded p-2 border border-gray-200 bg-white">
              <option value="light">Açık</option>
              <option value="dark">Koyu</option>
            </select>
          </div>
        </div>
        <div className="flex items-center px-6 py-5 gap-4 hover:bg-brand-lightPurple/30 transition">
          <span className="text-xl">🌐</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-brand-purple">Dil</div>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full mt-1 rounded p-2 border border-gray-200 bg-white">
              <option value="tr">Türkçe</option>
            </select>
          </div>
        </div>
        <div className="flex items-center px-6 py-5 gap-4 hover:bg-brand-lightPurple/30 transition">
          <span className="text-xl">🔔</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-brand-purple mb-1">Bildirimler</div>
            <div className="flex items-center gap-3 mb-1">
              <input type="checkbox" id="notif1" className="accent-brand-purple" />
              <label htmlFor="notif1" className="text-xs text-gray-600">Harcama limiti bildirimi</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="notif2" className="accent-brand-purple" />
              <label htmlFor="notif2" className="text-xs text-gray-600">Aylık özet bildirimi</label>
            </div>
          </div>
        </div>
      </div>

      {/* Finansal Hesaplar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="text-brand-purple font-bold text-lg flex items-center gap-2"><span className='text-2xl'>🏦</span>Banka Hesapları</div>
          <button className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-purple text-white text-2xl shadow hover:bg-purple-900 transition"><span>+</span></button>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          {loading ? (
            <div className="text-gray-400 text-center py-2">Yükleniyor...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-2">{error}</div>
          ) : (
            bankAccounts.map(acc => (
              <div key={acc.id} className="flex items-center bg-white/90 rounded-2xl shadow px-5 py-3 gap-4">
                <span className="text-2xl">{acc.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{acc.name}</div>
                </div>
                <button className="text-xs text-brand-purple hover:underline">Düzenle</button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="text-brand-purple font-bold text-lg flex items-center gap-2"><span className='text-2xl'>💳</span>Kredi Kartları</div>
          <button className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-purple text-white text-2xl shadow hover:bg-purple-900 transition"><span>+</span></button>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          {loading ? (
            <div className="text-gray-400 text-center py-2">Yükleniyor...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-2">{error}</div>
          ) : (
            creditCards.map(card => (
              <div key={card.id} className="flex items-center bg-white/90 rounded-2xl shadow px-5 py-3 gap-4">
                <span className="text-2xl">{card.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{card.name}</div>
                </div>
                <button className="text-xs text-brand-purple hover:underline">Düzenle</button>
              </div>
            ))
          )}
        </div>
      </div>
      <button className="w-full max-w-md bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl py-3 mt-2 shadow-xl text-base transition-all active:scale-95">Çıkış Yap</button>
    </div>
  );
} 