# Son Kod Değişiklikleri (Dün & Bugün)

## 1. Settings.js - Dinamik Aylar

- Sabit aylar yerine mevcut yılın aylarını otomatik oluşturan fonksiyon eklendi.
- Varsayılan seçili ay, mevcut ay olarak ayarlandı.

```js
// Aylar için fonksiyon
const generateCurrentYearMonths = () => {
  const currentYear = new Date().getFullYear();
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  return months.map(month => `${month} ${currentYear}`);
};

// Kullanımı
const currentYearMonths = generateCurrentYearMonths();
const [selectedMonth, setSelectedMonth] = useState(() => {
  const currentMonth = new Date().getMonth();
  return currentYearMonths[currentMonth];
});
```

---

## 2. Kredi Kartı Ekleme/Düzenleme Modalı

- Kart limiti, hesap kesim günü, son ödeme günü ve kart notu alanları eklendi.
- Bu alanlar hem formda hem de kart listesinde gösteriliyor.

```js
// Modal formunda eklenen alanlar:
<input type="number" ... placeholder="Kart limiti" ... />
<input type="number" ... placeholder="Kesim günü (1-31)" ... />
<input type="number" ... placeholder="Ödeme günü (1-31)" ... />
<input type="text" ... placeholder="Not" ... />
// Kart listesinde gösterim:
<span className="text-xs bg-yellow-50 rounded px-2 py-1 ml-2">Ödeme: {card.due_day}</span>
<span className="text-xs bg-gray-100 rounded px-2 py-1 ml-2">{card.card_note}</span>
```

---

## 3. Dashboard.js - Son İşlemler ve Transfer Detayları

- Son işlemler bölümünde transfer işlemleri için kaynak/varış hesapları ve açıklama gösterimi eklendi.
- İşlem tipine göre renklendirme yapıldı (gelir: yeşil, gider: kırmızı, transfer: mavi).

```js
<div className={`text-lg font-bold ${
  tx.type === "income" ? "text-green-600" : 
  tx.type === "expense" ? "text-red-600" :
  "text-blue-600" // transfer için
}`}>{Math.abs(tx.amount)} TL</div>
// Transfer işlemleri için açıklama:
{tx.type === "transfer" ? `${tx.description} (${tx.from_account} → ${tx.to_account})` : tx.description}
```

---

## 4. SupabaseTest.js - Bağlantı Testi

- Supabase bağlantısını test eden bir React bileşeni eklendi.

```js
import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function SupabaseTest() {
  const [status, setStatus] = useState("Yükleniyor...");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const { data: categories, error: catError } = await supabase
          .from("spendme_categories").select("*").limit(5);
        if (catError) throw catError;
        const { data: transactions, error: txError } = await supabase
          .from("spendme_transactions").select("*").limit(5);
        if (txError) throw txError;
        const { data: accounts, error: accError } = await supabase
          .from("spendme_accounts").select("*").limit(5);
        if (accError) throw accError;
        setStatus("Bağlantı başarılı!");
        setData({ categories, transactions, accounts });
      } catch (err) {
        setError(err.message);
        setStatus("Bağlantı hatası!");
      }
    }
    testConnection();
  }, []);

  return (
    <div>
      <h2>Supabase Bağlantı Testi</h2>
      <div>{status}</div>
      {error && <div>{error}</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

</rewritten_file> 