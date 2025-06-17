# SpendMe – Kullanım Senaryoları

## Senaryo 1: Doğal Dil ile Harcama Ekleme
**Kullanıcı:** "Kemal Tanca'dan 900 TL ayakkabı aldım, nakit."

- `parseTextToTransaction()` çıktısı (spendme_transactions):
```json
{
  "type": "expense",
  "amount": 900,
  "vendor": "kemal tanca",
  "category": "giyim",
  "paymentMethod": "cash"
}
```
- AI espri (funny mod, spendme_humor_responses):
> "Bu ayakkabı değil, ayağında gezen kredi notu gibi 🥿💸"

- Kayıtlar:
  - `spendme_transactions`
  - `spendme_learned_keywords` (kemal tanca → giyim)
  - `spendme_humor_responses`

## Senaryo 2: Taksitli Kredi Kartı Harcaması
**Kullanıcı:** "Bugün Trendyol'dan 450 TL harcadım, 3 taksit yaptım, kredi kartı."

- `parseTextToTransaction()` çıktısı (spendme_transactions):
```json
{
  "amount": 450,
  "category": "giyim",
  "paymentMethod": "credit_card",
  "installments": 3
}
```

## Senaryo 3: Eksik Bilgiye Soru
**Kullanıcı:** "Migros'tan alışveriş yaptım."
- `getFollowUpQuestion()` çıktısı:
> "Ne kadar harcadınız ve hangi ödeme yöntemini kullandınız?"

> Not: Tüm AI fonksiyonları Gemini API ile, backend proxy endpoint üzerinden çağrılır. API anahtarı sadece backend'de saklanır. 