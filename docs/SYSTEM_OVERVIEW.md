# 📘 SpendMe – Tüm Sistem Dokümantasyonu

Bu doküman, SpendMe uygulamasının teknik, görsel, fonksiyonel ve yapay zekâ katmanlarının tümünü anlatır. Kullanım senaryoları, mimari yapılar, AI destekli mantık, kullanıcı arayüzü dili ve marka bütünlüğü detaylı şekilde aktarılmıştır.

---

## 🌐 Genel Tanım

SpendMe, kişisel harcama ve bütçe takibi uygulamasıdır. Türkçe kullanıcı arayüzü, mobil uyumluluk, PWA desteği ve yapay zekâ destekli metin analizleri ile sade ama güçlü bir deneyim sunar. Kullanıcılar harcamalarını metinle veya sesle ekleyebilir, kredi kartı, nakit, banka işlemlerini takip edebilir, taksitli ödeme mantığını kullanabilir ve AI'dan esprili geri bildirimler alabilir.

---

## 🎨 Marka & Görsel Kimlik

| Öğeler           | Açıklama                                                            |
| ---------------- | ------------------------------------------------------------------- |
| **Uygulama Adı** | SpendMe                                                             |
| **Slogan**       | "Harcamanı anla, bütçeni yönet."                                    |
| **Renk Paleti**  | Ana renk: #5B2C6F (koyu mor), tamamlayıcı: #D7BDE2, açık gri, beyaz |
| **Yazı Tipi**    | Poppins / Inter / Open Sans                                         |
| **Stil**         | Minimalist, sade, finansal güven veren                              |

---

## 📱 Platform Özellikleri

| Özellik                      | Açıklama                                  |
| ---------------------------- | ----------------------------------------- |
| **PWA Uyumlu**               | Mobilde kurulur, offline çalışabilir      |
| **APK Olarak Derlenebilir**  | Capacitor.js ile Android'e çıkartılabilir |
| **Supabase Tabanlı Backend** | Auth, DB, storage tek çatı altında        |
| **Türkçe Arayüz**            | UI dili Türkçe, değişkenler İngilizce     |
| **Karanlık Mod Desteği**     | Tema değiştirilebilir                     |
| **Sesli Giriş (opsiyonel)**  | Speech-to-text ile entegre edilebilir     |

---

## 🧠 Yapay Zekâ Katmanı

Yapay zekâ bileşeni, Google Gemini API ile çalışır. Tüm AI istekleri backend'deki `/api/gemini` proxy endpoint'i üzerinden yapılır. API anahtarı sadece backend'de saklanır ve .env dosyası ile yönetilir.

### 1. `parseTextToTransaction()`

Metni ayrıştırır → tür, kategori, tutar, ödeme şekli, taksit, vs.

### 2. `getFollowUpQuestion()`

Eksik bilgi varsa kullanıcıya geri soru üretir.

### 3. `getHumorLine(transaction, mode)`

Sabir mizah modülü: serious, friendly, funny, clown modlarına göre davranır.

### 4. `generateDynamicHumorJobForAllModes()`

GPT-4 gibi modellerle Supabase'teki harcamaları espriye çevirir, 3 mod için ayrı ayrı.

---

## 🗄️ Supabase Veritabanı Şeması (spendme_ prefixli)

SpendMe uygulamasına ait tüm tabloların isimleri `spendme_` ile başlar. Böylece diğer projelerle karışmaz ve yönetimi kolaylaşır.

| Tablo Adı                  | Açıklama                                           |
| -------------------------- | -------------------------------------------------- |
| spendme_transactions       | Harcamalar ve gelir kayıtları                      |
| spendme_learned_keywords   | Kullanıcının kelime-kategori ilişkileri            |
| spendme_corrections        | AI tahminine yapılan düzeltmeler                   |
| spendme_humor_responses    | AI tarafından üretilmiş espriler                   |
| spendme_users              | (Opsiyonel) Kullanıcı profilleri                   |
| spendme_settings           | (Opsiyonel) Kullanıcıya özel ayarlar               |

### spendme_transactions
- id: uuid (PK)
- user_id: uuid (FK)
- type: string ("expense"/"income")
- amount: numeric
- category: string
- payment_method: string ("cash", "credit_card", "bank", ...)
- installments: int (nullable)
- vendor: string (nullable)
- description: string (nullable)
- created_at: timestamp

### spendme_learned_keywords
- id: uuid (PK)
- user_id: uuid (FK)
- keyword: string
- category: string
- created_at: timestamp

### spendme_corrections
- id: uuid (PK)
- user_id: uuid (FK)
- transaction_id: uuid (FK)
- field: string
- old_value: string
- new_value: string
- created_at: timestamp

### spendme_humor_responses
- id: uuid (PK)
- user_id: uuid (FK)
- transaction_id: uuid (FK)
- mode: string ("serious", "friendly", "funny", "clown")
- text: string
- created_at: timestamp

### spendme_users (opsiyonel)
- id: uuid (PK)
- email: string
- display_name: string
- created_at: timestamp

### spendme_settings (opsiyonel)
- id: uuid (PK)
- user_id: uuid (FK)
- theme: string ("light", "dark")
- ai_humor_mode: string ("serious", "friendly", "funny", "clown")
- language: string ("tr", "en", ...)
- created_at: timestamp

---

## 🧩 Uygulama Sayfaları

| Sayfa                 | İşlevi                                            |
| --------------------- | ------------------------------------------------- |
| Ana Sayfa (Dashboard) | Harcama özeti, grafik, toplam borç, taksit durumu |
| Harcama Ekle          | Metinle veya elle harcama girişi                  |
| Gelir Ekle            | Aylık maaş, freelance vb.                         |
| Kredi Kartı Yönetimi  | Kart borcu, taksit dağılımı, ödeme yapılabilir    |
| Raporlar              | Kategori bazlı grafik, harcama analizi            |
| Ayarlar               | Tema, dil, AI mizah modu seçimi                   |

---

## 📜 Prompt Örnekleri

### Doğal Dil Ayrıştırma:

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

### Mizah Üretimi (Clown Modu):

```
Kullanıcı 6500 TL kira ödedi. Cıvık bir yorum üret, Türkçe, emoji serbest.
```

> "Ev değil sanki saray, kira değil aidat değil ruh bedeli ödüyorsun 😵‍💫🏰"

---

## 🔁 AI Mizah Güncelleme Job'u

Her gün veya haftalık çalışan bir görev:

* Supabase'ten yeni harcamaları çeker
* `GPT-4` API'ye prompt gönderir
* Gelen esprileri her mizah modu için ayrı kaydeder (`humor_responses`)

---

## 🧪 Kullanım Senaryosu

### Kullanıcı: "Kemal Tanca'dan 900 TL ayakkabı aldım, nakit."

1. `parseTextToTransaction()`:

```json
{
  "type": "expense",
  "amount": 900,
  "vendor": "kemal tanca",
  "category": "giyim",
  "paymentMethod": "cash"
}
```

2. AI espri üretir (funny mod):

> "Bu ayakkabı değil, ayağında gezen kredi notu gibi 🥿💸"

3. Veritabanı kayıtları:

* `transactions`
* `learned_keywords` (kemal tanca → giyim)
* `humor_responses`

---

## ✅ Geliştirme Yol Haritası

* [ ] AI karakter seçim ekranı (ciddi, samimi, cıvık)
* [ ] Haftalık mail özeti: "Bu hafta şöyle harcadın, böyle borçlandın"
* [ ] Zaman bazlı harcama alışkanlığı analizi
* [ ] Offline modda çalışan parser + local humor fallback
* [ ] Espri beğenme / puanlama sistemi (LLM kalitesini ölçmek için)

---

Bu sistem; AI destekli, kişiselleştirilebilir, mizah içeren bir finans asistanı yaratmak için hazırlanmıştır. Kullanıcı verisini anlamlı hale getirir, kullanıcıyı güldürür, yönlendirir ve kontrolü kullanıcıya geri verir.

**SpendMe: Cüzdanı değil, zekâyı konuşturur. 💸🧠** 