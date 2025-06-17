import React, { useState, useEffect } from "react";
import { supabase } from '../utils/supabaseClient';
import { geminiParseTransaction } from '../utils/geminiProxy';

const accounts = [
  { label: "Cüzdan", icon: "👛" },
  { label: "Ziraat", icon: "🏦" },
  { label: "Garanti Bonus", icon: "💳" },
];

export default function AddTransaction({ userId }) {
  const [tab, setTab] = useState("expense");
  const [input, setInput] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [installment, setInstallment] = useState("");
  const [payment, setPayment] = useState(accounts[0].label);
  const [fromAccount, setFromAccount] = useState(accounts[0].label);
  const [toAccount, setToAccount] = useState(accounts[1] ? accounts[1].label : accounts[0].label);
  const [categories, setCategories] = useState([]);
  const [accountsDb, setAccountsDb] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [vendor, setVendor] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Kategorileri ve hesapları çek
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: cats, error: catErr } = await supabase
          .from('spendme_categories')
          .select('*');
        if (catErr) throw catErr;
        setCategories(cats || []);
        const { data: accs, error: accErr } = await supabase
          .from('spendme_accounts')
          .select('*');
        if (accErr) throw accErr;
        setAccountsDb(accs || []);
      } catch (err) {
        // Hata yönetimi
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    setDescription("");
  }, [tab]);

  // Gemini ile AI tahmini
  const handleGeminiAI = async () => {
    setAiLoading(true);
    setAiError("");
    setSuggestedCategories([]);
    try {
      const result = await geminiParseTransaction(input, categories, accountsDb);
      if (result.tutar) setAmount(result.tutar);
      if (result.tarih) setDate(result.tarih);
      if (result.vendor) setVendor(result.vendor);
      if (result.description) setDescription(result.description);
      // Kategori önerisi
      if (result.kategori) {
        const lower = result.kategori.toLowerCase();
        const matches = categories.filter(cat =>
          cat.name.toLowerCase() === lower
        );
        if (matches.length === 1) {
          setCategory(matches[0].id);
        } else {
          setSuggestedCategories(categories);
        }
      }
      // Hesap önerisi
      if (result.hesap) {
        const lowerAcc = result.hesap.toLowerCase();
        const foundAcc = accountsDb.find(acc => acc.name.toLowerCase() === lowerAcc);
        if (foundAcc) setPayment(foundAcc.name);
      }
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) {
      setSaveError("Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.");
      setSaveLoading(false);
      return;
    }
    if ((tab === "income" || tab === "expense") && !category) {
      setSaveError("Lütfen bir kategori seçin.");
      setSaveLoading(false);
      return;
    }
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      // Hesap ve kategori id'lerini bul
      const selectedAccount = accountsDb.find(acc => acc.name === payment);
      const toAccountObj = accountsDb.find(acc => acc.name === toAccount);
      // Kayıt objesini oluştur
      const insertObj = {
        user_id: userId,
        type: tab, // "expense", "income" veya "transfer"
        amount: parseFloat(amount),
        account_id: selectedAccount ? selectedAccount.id : null,
        category_id: category || null,
        payment_method: selectedAccount ? selectedAccount.type : null,
        installments: installment || null,
        vendor: vendor,
        description: description,
        date: date,
        created_at: new Date().toISOString(),
        to_account_id: tab === "transfer" ? (toAccountObj ? toAccountObj.id : null) : null
      };
      const { error } = await supabase.from('spendme_transactions').insert([insertObj]);
      if (error) throw error;
      setSaveSuccess(true);
      // Formu sıfırla
      setAmount("");
      setCategory("");
      setDate("");
      setVendor("");
      setDescription("");
      setPayment(accounts[0].label);
      setInstallment("");
      setInput("");
      setSuggestedCategories([]);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pt-8 pb-24 flex flex-col items-center">
      <div className="w-full bg-white/80 rounded-3xl shadow-lg p-7 flex flex-col items-center">
        {/* Sekme butonları */}
        <div className="flex w-full justify-center gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-full font-semibold text-sm transition border shadow-sm ${tab === "expense" ? "bg-brand-purple text-white border-brand-purple" : "bg-white text-brand-purple border-gray-200"}`}
            onClick={() => setTab("expense")}
          >Gider</button>
          <button
            className={`px-4 py-2 rounded-full font-semibold text-sm transition border shadow-sm ${tab === "income" ? "bg-brand-green text-white border-brand-green" : "bg-white text-brand-green border-gray-200"}`}
            onClick={() => setTab("income")}
          >Gelir</button>
          <button
            className={`px-4 py-2 rounded-full font-semibold text-sm transition border shadow-sm ${tab === "transfer" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-orange-500 border-orange-200"}`}
            onClick={() => setTab("transfer")}
          >Transfer</button>
        </div>
        {/* Başlık ve ikon */}
        <div className="flex items-center gap-3 mb-6">
          {tab === "transfer" ? (
            <>
              <span className="bg-orange-100 text-orange-500 border-2 border-orange-500 text-3xl rounded-full w-12 h-12 flex items-center justify-center">
                ⇄
              </span>
              <span className="text-xl font-bold text-orange-500">Transfer</span>
            </>
          ) : (
            <>
              <span className={`text-3xl rounded-full w-12 h-12 flex items-center justify-center shadow
                ${tab === "expense" ? "bg-brand-purple text-white" : ""}
                ${tab === "income" ? "bg-brand-green text-white" : ""}
              `}>
                {tab === "expense" ? "-" : "+"}
              </span>
              <span className={`text-xl font-bold ${
                tab === "expense" ? "text-brand-purple" :
                "text-brand-green"
              }`}>
                {tab === "expense" ? "Gider Ekle" : "Gelir Ekle"}
              </span>
            </>
          )}
        </div>
        {/* Doğal dil inputu ve AI ile doldur */}
        <div className="w-full flex flex-col gap-2 mb-4">
          <input
            className="rounded-xl border border-gray-200 p-3 bg-white shadow text-base focus:outline-none focus:ring-2 focus:ring-brand-purple"
            placeholder={
              tab === "expense"
                ? "Örn: Migros'dan 320 TL market alışverişi"
                : tab === "income"
                ? "Örn: 5000 TL maaş yattı"
                : "Örn: Cüzdandan bankaya 500 TL transfer"
            }
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            className="bg-brand-green text-white rounded-xl py-2 font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            onClick={handleGeminiAI}
            type="button"
            disabled={aiLoading || !input}
          >
            {aiLoading ? "AI Dolduruluyor..." : "AI ile Doldur (Gemini)"}
          </button>
          {aiError && <div className="text-red-500 text-xs mt-1">{aiError}</div>}
        </div>
        {/* Elle giriş alanları */}
        <div className="w-full flex flex-col gap-3 mb-4">
          {/* Tutar alanı her sekmede ortak */}
          <input
            className="rounded-xl border border-gray-200 p-3 bg-white shadow text-base focus:outline-none focus:ring-2 focus:ring-brand-purple"
            type="number"
            placeholder="Tutar (TL)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          {/* Gider ve gelirde vendor ve açıklama */}
          {(tab === "expense" || tab === "income") && (
            <>
              {tab === "expense" && (
                <input
                  className="rounded-xl border border-gray-200 p-3 bg-white shadow text-base focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  type="text"
                  placeholder="Mağaza / Kurum (örn: Migros, Starbucks, vs.)"
                  value={vendor}
                  onChange={e => setVendor(e.target.value)}
                />
              )}
              <input
                className="rounded-xl border border-gray-200 p-3 bg-white shadow text-base focus:outline-none focus:ring-2 focus:ring-brand-purple"
                type="text"
                placeholder={
                  tab === "expense"
                    ? "Açıklama (örn: Migros'tan market alışverişi)"
                    : tab === "income"
                    ? "Açıklama (örn: Maaş, prim, kira geliri)"
                    : ""
                }
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </>
          )}
          {/* Kategori seçimi: sekmeye göre farklı */}
          {tab === "expense" && (
            <div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.filter(cat => cat.type === 'expense').map(cat => (
                  <button
                    key={cat.id}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full border text-sm font-semibold transition shadow-sm whitespace-nowrap ${category === cat.id ? "bg-brand-purple text-white border-brand-purple" : "bg-white text-brand-purple border-gray-200"}`}
                    onClick={() => setCategory(cat.id)}
                    type="button"
                  >
                    <span className="text-lg">{cat.icon}</span> {cat.name}
                  </button>
                ))}
              </div>
              {/* AI kategori önerileri */}
              {suggestedCategories.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">AI kategori önerileri:</span>
                  {suggestedCategories.map(cat => (
                    <button
                      key={cat.id}
                      className="px-2 py-1 rounded border text-xs font-semibold bg-brand-green text-white border-brand-green hover:bg-green-700 transition"
                      onClick={() => setCategory(cat.id)}
                      type="button"
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === "income" && (
            <div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.filter(cat => cat.type === 'income').map(cat => (
                  <button
                    key={cat.id}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full border text-sm font-semibold transition shadow-sm whitespace-nowrap ${category === cat.id ? "bg-brand-purple text-white border-brand-purple" : "bg-white text-brand-purple border-gray-200"}`}
                    onClick={() => setCategory(cat.id)}
                    type="button"
                  >
                    <span className="text-lg">{cat.icon}</span> {cat.name}
                  </button>
                ))}
              </div>
              {/* AI kategori önerileri */}
              {suggestedCategories.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">AI kategori önerileri:</span>
                  {suggestedCategories.map(cat => (
                    <button
                      key={cat.id}
                      className="px-2 py-1 rounded border text-xs font-semibold bg-brand-green text-white border-brand-green hover:bg-green-700 transition"
                      onClick={() => setCategory(cat.id)}
                      type="button"
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Tarih alanı her sekmede ortak */}
          <input
            className="rounded-xl border border-gray-200 p-3 bg-white shadow text-base focus:outline-none focus:ring-brand-purple"
            type="date"
            placeholder="Tarih"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          {/* Hesap seçimi: gider/gelir için tek, transfer için iki hesap */}
          {tab !== "transfer" ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {accounts.map(acc => (
                <button
                  key={acc.label}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full border text-sm font-semibold transition shadow-sm whitespace-nowrap ${payment === acc.label ? "bg-brand-purple text-white border-brand-purple" : "bg-white text-brand-purple border-gray-200"}`}
                  onClick={() => setPayment(acc.label)}
                  type="button"
                >
                  <span className="text-lg">{acc.icon}</span> {acc.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <div className="font-semibold text-sm mb-1">Gönderen:</div>
                <div className="flex gap-2">
                  {accounts.map(acc => (
                    <button
                      key={acc.label}
                      className={`flex items-center gap-1 px-4 py-2 rounded-full border text-sm font-semibold transition shadow-sm whitespace-nowrap ${fromAccount === acc.label ? "bg-brand-purple text-white border-brand-purple" : "bg-white text-brand-purple border-gray-200"}`}
                      onClick={() => setFromAccount(acc.label)}
                      type="button"
                    >
                      <span className="text-lg">{acc.icon}</span> {acc.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">Alan:</div>
                <div className="flex gap-2">
                  {accounts.map(acc => (
                    <button
                      key={acc.label}
                      className={`flex items-center gap-1 px-4 py-2 rounded-full border text-sm font-semibold transition shadow-sm whitespace-nowrap ${toAccount === acc.label ? "bg-brand-purple text-white border-brand-purple" : "bg-white text-brand-purple border-gray-200"}`}
                      onClick={() => setToAccount(acc.label)}
                      type="button"
                      disabled={fromAccount === acc.label}
                    >
                      <span className="text-lg">{acc.icon}</span> {acc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Taksit sadece giderde */}
          {tab === "expense" && (
            <input
              className="rounded-xl border border-gray-200 p-3 bg-white shadow text-base focus:outline-none focus:ring-brand-purple"
              type="text"
              placeholder="Taksit (örn: 3 ay)"
              value={installment}
              onChange={e => setInstallment(e.target.value)}
            />
          )}
        </div>
        <form onSubmit={handleSave} className="w-full flex flex-col items-center">
          <button
            className="w-full bg-brand-purple hover:bg-purple-900 text-white font-semibold rounded-2xl py-4 shadow-xl text-lg transition-all active:scale-95 mb-2"
            type="submit"
            disabled={saveLoading}
          >
            {saveLoading ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {saveSuccess && <div className="text-green-600 text-sm mt-2">Kayıt başarılı!</div>}
          {saveError && <div className="text-red-600 text-sm mt-2">{saveError}</div>}
        </form>
      </div>
    </div>
  );
} 
