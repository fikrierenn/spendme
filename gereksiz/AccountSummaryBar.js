import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const groups = [
  { key: "Cüzdan", type: "wallet", icon: "💵" },
  { key: "Banka", type: "bank", icon: "🏦" },
  { key: "Kredi Kartı", type: "credit_card", icon: "💳" },
];

export default function AccountSummaryBar() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState(null);

  // Kullanıcı id'sini .env veya context'ten almak gerekir, şimdilik sabit
  const userId = "b5318971-add4-48ba-85fb-b856f2bd22ca";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Hesapları çek
        let { data: accs, error: accErr } = await supabase
          .from("spendme_accounts")
          .select("*")
          .eq("user_id", userId);
        if (accErr) throw accErr;
        setAccounts(accs || []);
        // Tüm transaction'ları çek
        let { data: txs, error: txErr } = await supabase
          .from("spendme_transactions")
          .select("id, account_id, amount, type")
          .eq("user_id", userId);
        if (txErr) throw txErr;
        setTransactions(txs || []);
      } catch (err) {
        setError(err.message || "Veri çekilemedi");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Her hesabın bakiyesini hesapla
  const accountsWithBalance = accounts.map(acc => {
    const accTxs = transactions.filter(tx => tx.account_id === acc.id);
    // Gelirleri (+), giderleri (-) olarak topla
    const balance = accTxs.reduce((sum, tx) => {
      if (tx.type === "income") return sum + Number(tx.amount);
      if (tx.type === "expense") return sum - Number(tx.amount);
      return sum;
    }, 0);
    return { ...acc, balance };
  });

  // Gruplara göre toplamları hesapla
  const groupTotals = groups.map(g => {
    const groupAccounts = accountsWithBalance.filter(a => a.type === g.type);
    const total = groupAccounts.reduce((sum, a) => sum + a.balance, 0);
    const limit = g.type === "credit_card" ? groupAccounts.reduce((sum, a) => sum + (a.limit || 0), 0) : undefined;
    return { ...g, total, limit, accounts: groupAccounts };
  });

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="flex gap-4 px-2 py-3 overflow-x-auto bg-white/90 border-b border-gray-200">
        {loading ? (
          <div className="text-gray-400 text-center py-2">Yükleniyor...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-2">{error}</div>
        ) : (
          groupTotals.map((g, i) => (
            <button
              key={g.key}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl border font-semibold text-base min-w-[130px] max-w-[160px] shadow-sm transition bg-white/80 hover:bg-gray-100 active:scale-95 whitespace-nowrap ${open === g.key ? "ring-2 ring-brand-purple" : ""}`}
              style={{ overflow: "hidden" }}
              onClick={() => setOpen(open === g.key ? null : g.key)}
            >
              <span className="text-xl">{g.icon}</span>
              <span>{g.key}:</span>
              <span className={g.key === "Kredi Kartı" && g.total < 0 ? "text-red-500 font-bold" : "font-bold"}>
                {g.total < 0 ? `-${Math.abs(g.total).toLocaleString()} TL` : `${g.total.toLocaleString()} TL`}
              </span>
              {g.key === "Kredi Kartı" && (
                <span className="ml-1 text-xs text-gray-500">Limit: {g.limit?.toLocaleString() || "-"} TL</span>
              )}
            </button>
          ))
        )}
      </div>
      {/* Açılır detay paneli tam genişlikte ve modal gibi, ortalanmış */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(null)}
          />
          <div className="relative mt-24 w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-lg font-bold">
                {groups.find(g => g.key === open)?.icon}
                {open}
              </div>
              <button
                className="text-gray-400 text-2xl font-bold px-2 py-0.5 hover:text-brand-purple"
                onClick={() => setOpen(null)}
                aria-label="Kapat"
              >
                ×
              </button>
            </div>
            {groupTotals.find(g => g.key === open)?.accounts.map(acc => (
              <div key={acc.id} className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-gray-50 mb-1">
                <span className="text-xl">{acc.icon}</span>
                <span className="font-medium text-gray-700">{acc.name}</span>
                <span className={acc.type === "credit_card" && acc.balance < 0 ? "text-red-500 font-bold ml-2" : "font-bold ml-2"}>
                  {acc.balance < 0 ? `-${Math.abs(acc.balance).toLocaleString()} TL` : `${acc.balance.toLocaleString()} TL`}
                </span>
                {acc.type === "credit_card" && acc.limit && (
                  <span className="ml-1 text-xs text-gray-500">Limit: {acc.limit.toLocaleString()} TL</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 