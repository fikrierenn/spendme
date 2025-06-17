# RULES – SpendMe

> **Not:** Proje yığını: React + Tailwind CSS + PWA

## Kodlama Standartları
- React fonksiyonel component yapısı kullanılır
- Stil için Tailwind CSS tercih edilir, ekstra CSS minimumda tutulur
- Türkçe değişken ve fonksiyon ismi kullanma, sadece UI metinleri Türkçe
- Fonksiyonlar tek sorumluluk prensibine uygun olmalı
- Yorumlar kısa ve açıklayıcı
- Prettier ve linter kullanımı zorunlu

## AI Prompt Kuralları
- Promptlar kısa, bağlama uygun ve Türkçe olmalı
- Mizah modları: serious, friendly, funny, clown
- Her mod için ayrı örnekler ve testler

## PR Kuralları
- Açıklama zorunlu, ilgili issue ile ilişkilendir
- Kod review olmadan merge etme
- Testler geçmeden PR kabul etme

## AI Fonksiyonları
- AI fonksiyonları Gemini API ile, backend proxy endpoint üzerinden çağrılır
- API anahtarı frontend'de tutulmaz, .env dosyasında saklanır 