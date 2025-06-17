# SpendMe – Supabase Tablo Şeması (Güncel)

SpendMe uygulamasına ait tüm tabloların isimleri `spendme_` ile başlar. Böylece diğer projelerle karışmaz ve yönetimi kolaylaşır.

| Tablo Adı                  | Açıklama                                           |
| -------------------------- | -------------------------------------------------- |
| spendme_transactions       | Harcamalar ve gelir kayıtları                      |
| spendme_accounts           | Kullanıcıya ait cüzdan, banka, kredi kartı tanımları|
| spendme_categories         | Harcama/gelir kategorileri                         |
| spendme_budgets            | Genel ve kategori bazlı bütçeler                   |
| spendme_learned_keywords   | Kullanıcının kelime-kategori ilişkileri (AI)       |
| spendme_corrections        | AI tahminine yapılan düzeltmeler                   |
| spendme_humor_responses    | AI tarafından üretilmiş espriler                   |
| spendme_users              | (Opsiyonel) Kullanıcı profilleri                   |
| spendme_settings           | (Opsiyonel) Kullanıcıya özel ayarlar               |

---

## Şema Detayları

### spendme_accounts
- id: uuid (PK)
- user_id: uuid (FK, auth.users)
- name: string (örn: "Garanti Bonus", "Cüzdan")
- type: string ("wallet", "bank", "credit_card")
- icon: string (örn: "💳", "🏦", "👛")
- created_at: timestamp

### spendme_categories
- id: uuid (PK)
- user_id: uuid (FK, auth.users)
- name: string (örn: "Market", "Ulaşım")
- icon: string (örn: "🛒", "🚊")

### spendme_transactions
- id: uuid (PK)
- user_id: uuid (FK, auth.users)
- type: string ("expense"/"income"/"transfer")
- amount: numeric
- account_id: uuid (FK, spendme_accounts)
- category_id: uuid (FK, spendme_categories)
- payment_method: string (örn: "cash", "credit_card", "bank")
- installments: int (nullable)
- vendor: string (nullable)
- description: string (nullable)
- date: date
- created_at: timestamp

### spendme_budgets
- id: uuid (PK)
- user_id: uuid (FK, auth.users)
- category_id: uuid (FK, spendme_categories, nullable)  # null ise genel bütçe
- period: string (örn: "2024-06", "2024")
- amount: numeric
- created_at: timestamp

### spendme_learned_keywords
- id: uuid (PK)
- user_id: uuid (FK)
- keyword: string
- category_id: uuid (FK, spendme_categories)
- created_at: timestamp

### spendme_corrections
- id: uuid (PK)
- user_id: uuid (FK)
- transaction_id: uuid (FK, spendme_transactions)
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

Not: AI ile ilgili tüm işlemler Gemini API ve backend proxy endpoint üzerinden yapılır. API anahtarı sadece backend'de saklanır. 