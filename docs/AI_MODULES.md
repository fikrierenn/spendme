# SpendMe – AI Modülleri

> Not: Tüm AI fonksiyonları Google Gemini API ile, backend proxy endpoint üzerinden çağrılır. API anahtarı sadece backend'de saklanır ve .env dosyası ile yönetilir.

## 1. parseTextToTransaction()
Doğal dildeki harcama/girdi metnini ayrıştırır. Çıktı: amount, category, paymentMethod, installments, vendor, vs. Sonuçlar `spendme_transactions` tablosuna kaydedilir.

## 2. getFollowUpQuestion()
Eksik veya belirsiz bilgi varsa kullanıcıya Türkçe soru üretir. Gerekirse ek bilgi alındıktan sonra yine `spendme_transactions` güncellenir.

## 3. getHumorLine(transaction, mode)
Harcamaya mizah katar. Modlar: serious, friendly, funny, clown. Türkçe ve bağlama uygun espri üretir. Sonuçlar `spendme_humor_responses` tablosuna kaydedilir.

## 4. generateDynamicHumorJobForAllModes()
Supabase'ten yeni harcamaları çeker (`spendme_transactions`), GPT-4 API ile mizah üretir, sonuçları `spendme_humor_responses` tablosuna kaydeder.

---

### Prompt ve Çıktı Örnekleri

**Girdi:**
Bugün Trendyol'dan 450 TL harcadım, 3 taksit yaptım, kredi kartı.

**Çıktı:**
{
  "amount": 450,
  "category": "giyim",
  "paymentMethod": "credit_card",
  "installments": 3
}

**Mizah (clown):**
"Ev değil sanki saray, kira değil aidat değil ruh bedeli ödüyorsun 😵‍💫🏰"

> Not: Tüm AI fonksiyonları Google Gemini API ile, backend proxy endpoint üzerinden çağrılır. API anahtarı sadece backend'de saklanır ve .env dosyası ile yönetilir. 