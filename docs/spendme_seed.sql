-- SpendMe Demo Seed Verileri (Gerçek ID'lerle)

-- Örnek kullanıcı id'si (uygulama kodunda kullanılan id ile uyumlu)
-- b5318971-add4-48ba-85fb-b856f2bd22ca

-- Kategoriler
insert into public.spendme_categories (id, user_id, name, icon) values
  ('11111111-1111-1111-1111-111111111111', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 'Market', '🛒'),
  ('22222222-2222-2222-2222-222222222222', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 'Ulaşım', '🚗'),
  ('33333333-3333-3333-3333-333333333333', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 'Restoran', '🍽️'),
  ('44444444-4444-4444-4444-444444444444', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 'Fatura', '💡'),
  ('55555555-5555-5555-5555-555555555555', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 'Diğer', '💸');

-- Hesaplar
insert into public.spendme_accounts (id, user_id, name, icon, type) values
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 'Cüzdan', '👛', 'wallet'),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 'Banka', '🏦', 'bank'),
  ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 'Kredi Kartı', '💳', 'credit_card');

-- Bütçeler (Haziran 2024 için)
insert into public.spendme_budgets (id, user_id, amount, period, category_id) values
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 4000, '2024-06', null),
  ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 1200, '2024-06', '7cc48a02-83f2-48a7-8aa1-bea028af7995'),
  ('bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 400, '2024-06', 'c3e87a0c-a4ce-4a22-bb1f-146406329c92');

-- Harcamalar
insert into public.spendme_transactions (id, user_id, amount, type, description, date, category_id, account_id) values
  ('ccccccc1-cccc-cccc-cccc-ccccccccccc1', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 250, 'expense', 'Market alışverişi', '2024-06-01', '7cc48a02-83f2-48a7-8aa1-bea028af7995', '5060e276-5b46-478e-ae03-feca5489f9e0'),
  ('ccccccc2-cccc-cccc-cccc-ccccccccccc2', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 50, 'expense', 'Otobüs bileti', '2024-06-02', 'c3e87a0c-a4ce-4a22-bb1f-146406329c92', 'b60fbbab-a9cf-4ac0-8f66-5dc9e56285bb'),
  ('ccccccc3-cccc-cccc-cccc-ccccccccccc3', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 120, 'expense', 'Restoran', '2024-06-03', '13b5b983-f16e-4b50-bd38-e4db97643fbb', '68d010b9-38d3-4f13-9805-09bd65654fb6'),
  ('ccccccc4-cccc-cccc-cccc-ccccccccccc4', 'b5318971-add4-48ba-85fb-b856f2bd22ca', 3000, 'income', 'Maaş', '2024-06-01', null, 'b60fbbab-a9cf-4ac0-8f66-5dc9e56285bb'); 