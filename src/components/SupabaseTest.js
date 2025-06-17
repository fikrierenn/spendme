import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function SupabaseTest() {
  const [status, setStatus] = useState("Yükleniyor...");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Kategorileri çekmeyi dene
        const { data: categories, error: catError } = await supabase
          .from("spendme_categories")
          .select("*")
          .limit(5);

        if (catError) throw catError;

        // İşlemleri çekmeyi dene
        const { data: transactions, error: txError } = await supabase
          .from("spendme_transactions")
          .select("*")
          .limit(5);

        if (txError) throw txError;

        // Hesapları çekmeyi dene
        const { data: accounts, error: accError } = await supabase
          .from("spendme_accounts")
          .select("*")
          .limit(5);

        if (accError) throw accError;

        setStatus("Bağlantı başarılı!");
        setData({
          categories,
          transactions,
          accounts
        });
      } catch (err) {
        setError(err.message);
        setStatus("Bağlantı hatası!");
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-lightPurple to-brand-lightGray p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-brand-purple mb-4">Supabase Bağlantı Testi</h2>
        
        {/* Durum Göstergesi */}
        <div className={`p-4 rounded-xl mb-6 ${
          status === "Bağlantı başarılı!" 
            ? "bg-green-100 text-green-700" 
            : status === "Bağlantı hatası!" 
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
        }`}>
          <p className="font-semibold">{status}</p>
          {error && <p className="text-sm mt-2">{error}</p>}
        </div>

        {/* Veri Gösterimi */}
        {data && (
          <div className="space-y-6">
            {/* Kategoriler */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Kategoriler ({data.categories?.length || 0})</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(data.categories, null, 2)}
                </pre>
              </div>
            </div>

            {/* İşlemler */}
            <div>
              <h3 className="text-lg font-semibold mb-2">İşlemler ({data.transactions?.length || 0})</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(data.transactions, null, 2)}
                </pre>
              </div>
            </div>

            {/* Hesaplar */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Hesaplar ({data.accounts?.length || 0})</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(data.accounts, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 