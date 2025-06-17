-- SpendMe Supabase Tablo Şeması

-- Kategoriler Tablosu
create table if not exists public.spendme_categories (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    name text not null,
    icon text,
    created_at timestamp with time zone default now()
);

-- Hesaplar Tablosu (Banka, Kredi Kartı, vb.)
create table if not exists public.spendme_accounts (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    name text not null,
    icon text,
    type text not null, -- 'bank', 'credit_card', vs.
    created_at timestamp with time zone default now()
);

-- Bütçeler Tablosu
create table if not exists public.spendme_budgets (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    amount numeric not null,
    period text not null, -- '2024-06' gibi (yıl-ay)
    category_id uuid references public.spendme_categories(id),
    created_at timestamp with time zone default now()
);

-- Harcamalar/Gelirler Tablosu
create table if not exists public.spendme_transactions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    amount numeric not null,
    type text not null, -- 'expense' veya 'income'
    description text,
    date date not null,
    category_id uuid references public.spendme_categories(id),
    account_id uuid references public.spendme_accounts(id),
    created_at timestamp with time zone default now()
); 