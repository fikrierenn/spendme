import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function SupabaseTest() {
  const [status, setStatus] = useState("Yükleniyor...");
  const [data, setData] = useState(null);

  useEffect(() => {
    async function testConnection() {
      // 'spendme_transactions' tablosu mevcut, ona sorgu atıyoruz
      const { data, error } = await supabase.from("spendme_transactions").select("*").limit(1);
      if (error) {
        setStatus("Bağlantı Hatası: " + error.message);
      } else {
        setStatus("Bağlantı başarılı!");
        setData(data);
      }
    }
    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow mt-4">
      <h2 className="font-bold mb-2">Supabase Test</h2>
      <div>{status}</div>
      {data && (
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
} 