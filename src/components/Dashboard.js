import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const GROUP_ICONS = {
  wallet: "👛",
  bank: "🏦",
  credit_card: "💳"
};

function groupAccounts(accounts) {
  return {
    wallet: accounts.filter(a => a.type === "wallet"),
    bank: accounts.filter(a => a.type === "bank"),
    credit_card: accounts.filter(a => a.type === "credit_card"),
  };
}

export default function Dashboard({ onAddTransaction }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyExpense, setDailyExpense] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [accountBalances, setAccountBalances] = useState({});
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Kullanıcı id'sini .env veya context'ten almak gerekir, şimdilik sabit
  const userId = "b5318971-add4-48ba-85fb-b856f2bd22ca";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Hesapları çek
        const { data: accs, error: accErr } = await supabase
          .from("spendme_accounts")
          .select("*")
          .eq("user_id", userId);
        if (accErr) throw accErr;
        setAccounts(accs || []);
        // Hesap bakiyelerini hesapla
        const balances = {};
        for (const acc of accs) {
          const { data: txs } = await supabase
            .from("spendme_transactions")
            .select("amount, type, account_id, to_account_id")
            .or(`account_id.eq.${acc.id},to_account_id.eq.${acc.id}`)
            .eq("user_id", userId);
          let balance = 0;
          txs.forEach(tx => {
            if (tx.account_id === acc.id) {
              balance += tx.type === "income" ? Number(tx.amount) : -Number(tx.amount);
            }
            if (tx.to_account_id === acc.id) {
              balance += Number(tx.amount); // Transfer gelen
            }
          });
          balances[acc.id] = balance;
        }
        setAccountBalances(balances);
        // Son 5 harcama (category_id ile)
        let { data: txs, error: txErr } = await supabase
          .from("spendme_transactions")
          .select(`
            *,
            from_account:spendme_accounts!spendme_transactions_account_id_fkey(name),
            to_account:spendme_accounts!spendme_transactions_to_account_id_fkey(name)
          `)
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(5);
        if (txErr) throw txErr;
        // Kategorileri ayrı çek
        let { data: categories, error: catErr } = await supabase
          .from("spendme_categories")
          .select("*");
        if (catErr) throw catErr;
        // Transaction'lara kategori ve hesap bilgilerini ekle
        const txsWithCategory = (txs || []).map(tx => ({
          ...tx,
          category: categories.find(cat => cat.id === tx.category_id) || null,
          from_account: tx.from_account?.name,
          to_account: tx.to_account?.name
        }));
        setTransactions(txsWithCategory);
        // Loglama
        console.log("Son Harcamalar:", txsWithCategory);
        // Günlük harcama
        let { data: daily, error: dailyErr } = await supabase
          .from("spendme_transactions")
          .select("amount")
          .eq("user_id", userId)
          .eq("date", todayStr)
          .eq("type", "expense");
        if (dailyErr) throw dailyErr;
        setDailyExpense((daily || []).reduce((sum, t) => sum + Number(t.amount), 0));
        // Aylık harcama
        let { data: monthly, error: monthlyErr } = await supabase
          .from("spendme_transactions")
          .select("amount")
          .eq("user_id", userId)
          .gte("date", monthStart)
          .eq("type", "expense");
        if (monthlyErr) throw monthlyErr;
        setMonthlyExpense((monthly || []).reduce((sum, t) => sum + Number(t.amount), 0));
        // Kalan bütçe (bu ay için genel bütçe - bu ayki harcama)
        let { data: budgets, error: budgetErr } = await supabase
          .from("spendme_budgets")
          .select("amount")
          .eq("user_id", userId)
          .eq("period", `${yyyy}-${mm}`)
          .is("category_id", null)
          .limit(1);
        if (budgetErr) throw budgetErr;
        const budget = budgets && budgets.length > 0 ? Number(budgets[0].amount) : 0;
        setRemainingBudget(budget - ((monthly || []).reduce((sum, t) => sum + Number(t.amount), 0)));
      } catch (err) {
        setError(err.message || "Veri çekilemedi");
        console.error("Supabase Hatası:", err);
      } finally {
        setLoading(false);
      }
    }
    // Tarih için
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    var monthStart = `${yyyy}-${mm}-01`;
    var todayStr = `${yyyy}-${mm}-${dd}`;
    fetchData();
  }, []);

  // Hesapları gruplandır
  const grouped = groupAccounts(accounts);

  // Her grup için toplam bakiye
  const groupTotals = Object.fromEntries(
    Object.entries(grouped).map(([type, accs]) => [
      type,
      accs.reduce((sum, acc) => sum + (accountBalances[acc.id] ?? 0), 0)
    ])
  );

  return (
    <div className="min-h-screen flex flex-col items-center py-4 px-2 bg-gradient-to-br from-brand-lightPurple to-brand-lightGray">
      {/* Hesap Özeti Widget */}
      <div className="w-full max-w-sm flex gap-2 mb-6 overflow-x-auto">
        {Object.entries(grouped).map(([type, accs]) => accs.length > 0 && (
          <button
            key={type}
            className="bg-white/80 border border-brand-purple text-brand-purple rounded-full px-4 py-2 flex flex-col items-center gap-1 shadow hover:bg-brand-purple hover:text-white transition min-w-[90px]"
            onClick={() => { setSelectedGroup(type); setShowAccountModal(true); }}
            title={type}
          >
            <span className="text-2xl mb-1">{GROUP_ICONS[type]}</span>
            <span className="text-lg font-bold">{groupTotals[type]?.toLocaleString()} TL</span>
          </button>
        ))}
      </div>
      {/* Detay Modalı */}
      {showAccountModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-brand-purple text-xl" onClick={() => setShowAccountModal(false)}>×</button>
            <div className="text-2xl mb-2">{GROUP_ICONS[selectedGroup]}</div>
            <div className="flex flex-col gap-2">
              {grouped[selectedGroup].map(acc => (
                <div key={acc.id} className="flex items-center gap-3 bg-white/90 rounded-xl px-4 py-3 shadow border border-gray-100">
                  <span className="text-xl">{acc.icon}</span>
                  <span className="flex-1 font-semibold text-gray-800">{acc.name}</span>
                  <span className="text-base font-bold text-brand-purple">{(accountBalances[acc.id] ?? 0).toLocaleString()} TL</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Kartlar: Günlük, Aylık, Kalan Bütçe */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-6">
        {/* Günlük Harcama */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-purple to-brand-lightPurple p-4 flex items-center justify-between shadow-xl">
          <div>
            <div className="text-white text-sm font-semibold opacity-80">Günlük Harcama</div>
            <div className="text-2xl font-bold text-white drop-shadow">{loading ? "..." : `${dailyExpense} TL`}</div>
          </div>
          <span className="text-2xl drop-shadow">👜</span>
        </div>
        {/* Aylık Harcama */}
        <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-200 p-4 flex items-center justify-between shadow-xl">
          <div>
            <div className="text-white text-sm font-semibold opacity-80">Aylık Harcama</div>
            <div className="text-2xl font-bold text-white drop-shadow">{loading ? "..." : `${monthlyExpense} TL`}</div>
          </div>
          <span className="text-2xl drop-shadow">📅</span>
        </div>
        {/* Kalan Bütçe */}
        <div className="rounded-2xl bg-brand-green p-4 flex items-center justify-between shadow-xl">
          <div>
            <div className="text-white text-sm font-semibold opacity-90">Kalan Bütçe</div>
            <div className="text-2xl font-bold text-white drop-shadow">{loading ? "..." : `${remainingBudget.toLocaleString()} TL`}</div>
          </div>
          <span className="text-2xl drop-shadow">💸</span>
        </div>
      </div>

      {/* Gider Ekle Butonu */}
      <button
        className="w-full max-w-sm bg-brand-purple hover:bg-purple-900 text-white font-semibold rounded-2xl py-3 mb-6 shadow-xl text-base transition-all active:scale-95"
        onClick={onAddTransaction}
        type="button"
      >
        Gider Ekle
      </button>

      {/* Son Harcamalar */}
      <div className="w-full max-w-sm">
        <div className="text-brand-purple font-bold mb-3 text-lg">Son İşlemler</div>
        {loading ? (
          <div className="text-gray-400 text-center py-6">Yükleniyor...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-6">{error}</div>
        ) : (
          <ul className="flex flex-col gap-3">
            {transactions.map(tx => (
              <li key={tx.id} className="bg-white rounded-2xl shadow flex justify-between items-center px-5 py-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tx.category?.icon || "💸"}</span>
                  <div>
                    <div className="font-semibold text-gray-800 leading-tight">
                      {tx.type === "transfer" ? "Transfer" : tx.category?.name || tx.type}
                    </div>
                    <div className="text-xs text-gray-400">
                      {tx.date} 
                      <span className="ml-2">
                        {tx.type === "transfer" ? `${tx.description} (${tx.from_account} → ${tx.to_account})` : tx.description}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  tx.type === "income" ? "text-green-600" : 
                  tx.type === "expense" ? "text-red-600" :
                  "text-blue-600" // transfer için
                }`}>
                  {Math.abs(tx.amount)} TL
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 