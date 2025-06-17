# SpendMe

## "Harcamanı anla, bütçeni yönet."

Kişisel harcama ve bütçe takibi uygulaması. Türkçe arayüz, PWA, Supabase backend ve AI destekli mizah ile finansal asistanınız.

---

## 🚀 Özellikler
- **PWA uyumlu**, offline çalışabilir
- **React + Tailwind CSS + PWA** teknolojisiyle geliştirilmiştir
- **Supabase** tabanlı backend (auth, db, storage)
- **AI destekli metin ayrıştırma ve mizah**
- **Kredi kartı, nakit, banka işlemleri ve taksit takibi**
- **Karanlık mod** ve tema seçimi
- **Mobil ve masaüstü uyumlu**

---

## 🧠 AI Katmanı
- SpendMe, Google Gemini API ile doğal dilde harcama ayrıştırma ve mizah üretimi yapar.
- Tüm AI istekleri, uygulama backend'inde (server.js) tanımlı `/api/gemini` proxy endpoint'i üzerinden yapılır. Böylece API anahtarı gizli ve güvenli kalır.
- Frontend'de `useGemini` custom hook'u ile kolayca AI çağrısı yapılır.

---

## 🗂️ Temel Sayfalar
- Ana Sayfa (Dashboard)
- Harcama Ekle
- Gelir Ekle
- Kredi Kartı Yönetimi
- Raporlar
- Ayarlar

---

## 🏗️ Kurulum
```sh
# Projeyi klonla
npm install
# .env dosyasına Gemini API anahtarını ekle
# Örnek:
# GEMINI_API_KEY=senin-gemini-api-anahtarin
npm start
```

---

## 📦 Teknolojiler
- React (PWA)
- Tailwind CSS
- Supabase
- Capacitor.js
- Google Gemini API (AI, proxy ile)

---

## 📜 Prompt Örneği
```
Bugün Trendyol'dan 450 TL harcadım, 3 taksit yaptım, kredi kartı.
```
Çıktı:
```json
{
  "amount": 450,
  "category": "giyim",
  "paymentMethod": "credit_card",
  "installments": 3
}
```

---

## 🧩 Yol Haritası
- [ ] AI karakter seçimi
- [ ] Haftalık mail özeti
- [ ] Zaman bazlı harcama analizi
- [ ] Offline parser
- [ ] Espri puanlama sistemi

---

## Lisans
MIT 

## 🧠 SpendMe Öğrenen Kategori & Vendor Sistemi – Kısa Dokümantasyon

### 1. Amaç
SpendMe, kullanıcıların harcama metinlerinden kategori ve işletme (vendor) bilgisini otomatik olarak öğrenen, LLM'siz, Supabase tabanlı bir "öğrenen" sistem kullanır.

### 2. Temel Tablolar ve Görevleri
- **spendme_learned_keywords:**  Kullanıcıdan öğrenilen anahtar kelimeler ve bunların bağlı olduğu kategori.
- **spendme_vendor_aliases:**  Kullanıcıdan öğrenilen işletme (vendor) varyantları ve bunların standart vendor ismi.
- **spendme_categories:**  Kategori listesi.
- **spendme_transactions:**  Tüm işlemler.
- **spendme_corrections:**  Kullanıcı düzeltmeleri (yanlış kategori/vendor eşleşmesi olduğunda).

### 3. Çalışma Akışı
1. **Normalize Et:**  Kullanıcıdan gelen metin normalize edilir (küçük harf, özel karakter temizliği, kök bulma).
2. **Vendor Alias Eşleştirme:**  Metindeki vendor varyantı, spendme_vendor_aliases tablosunda aranır. Eşleşirse, standart vendor adı bulunur.
3. **Kategori Eşleştirme:**  Standart vendor adı veya anahtar kelime, spendme_learned_keywords tablosunda aranır. Eşleşirse, kategori bulunur.
4. **Regex ile Diğer Bilgiler:**  Tutar, taksit, ödeme yöntemi gibi alanlar regex ile çekilir.
5. **Eksik Bilgi Varsayımı:**  Eşleşme yoksa kullanıcıya sorulur ("Bu işletme/kategori nedir?"). Kullanıcıdan alınan bilgiyle ilgili tabloya yeni kayıt eklenir (sistem öğrenir).
6. **Düzeltme:**  Kullanıcı yanlış eşleşmeyi düzeltirse, spendme_corrections tablosuna kayıt alınır ve sistem güncellenir.

### 4. Kullanıcıya Sorma ve Öğrenme
- Eşleşme yoksa veya yanlışsa, kullanıcıya "Bu kelimeyi/kategoriyi/vendörü eklemek ister misiniz?" diye sorulur.
- Kullanıcıdan alınan bilgiyle Supabase tablosu güncellenir.
- Sonraki seferde sistem otomatik olarak doğru eşleşmeyi yapar.

### 5. Örnek Kullanım
> Kullanıcı: "Migrostan 758 tl harcadım"  
> normalize("Migrostan") → "migros"  
> spendme_vendor_aliases'de "migros" yoksa kullanıcıya sorulur, eklenir.  
> spendme_learned_keywords'de "migros" anahtar kelimesi yoksa kullanıcıya sorulur, eklenir.  
> Sonraki seferde "Migrostan" yazınca sistem otomatik olarak Market kategorisini ve vendor'ı seçer.

### 6. Avantajlar
- LLM olmadan, hızlı ve kişiselleşen bir öğrenme sistemi.
- Kullanıcıya her zaman düzeltme ve katkı imkanı.
- Zamanla her kullanıcı için "akıllı" ve özelleşmiş bir deneyim. 