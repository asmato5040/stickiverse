-- =============================================
-- STICKIVERSE – Supabase Datenbankschema
-- Diesen Code einmalig im Supabase SQL-Editor ausführen
-- Dashboard → SQL Editor → New Query → Paste → Run
-- =============================================

-- 1. PROFILES (Kundendaten)
create table public.profiles (
  id            uuid references auth.users on delete cascade not null primary key,
  first_name    text,
  last_name     text,
  phone         text,
  street        text,
  street_nr     text,
  zip           text,
  city          text,
  country       text default 'DE',
  is_admin      boolean default false,
  created_at    timestamp with time zone default timezone('utc', now()) not null,
  updated_at    timestamp with time zone default timezone('utc', now()) not null
);

-- 2. ORDERS (Bestellungen)
create table public.orders (
  id                  uuid default gen_random_uuid() not null primary key,
  order_number        text unique not null,
  user_id             uuid references auth.users,          -- null bei Gast-Bestellung
  guest_email         text,                                -- für Gast-Bestellungen
  status              text default 'pending'
                      check (status in ('pending','confirmed','in_production','shipped','delivered','cancelled')),
  subtotal            numeric(10,2) not null,
  shipping_cost       numeric(10,2) not null default 4.90,
  tax                 numeric(10,2) not null,
  total               numeric(10,2) not null,
  shipping_method     text default 'standard',
  notes               text,
  -- Lieferadresse (denormalisiert für Snapshot)
  delivery_email      text,
  delivery_first_name text,
  delivery_last_name  text,
  delivery_company    text,
  delivery_street     text,
  delivery_street_nr  text,
  delivery_zip        text,
  delivery_city       text,
  delivery_country    text default 'DE',
  delivery_phone      text,
  -- Timestamps
  created_at          timestamp with time zone default timezone('utc', now()) not null,
  updated_at          timestamp with time zone default timezone('utc', now()) not null
);

-- 3. ORDER ITEMS (Artikel pro Bestellung)
create table public.order_items (
  id              uuid default gen_random_uuid() not null primary key,
  order_id        uuid references public.orders on delete cascade not null,
  product_id      text not null,
  product_name    text not null,
  size            text,
  size_label      text,
  print_quantity  integer not null,
  cart_quantity   integer not null default 1,
  unit_price      numeric(10,2) not null,
  total_price     numeric(10,2) not null,
  preview_image   text,          -- Base64 oder Storage-URL
  canvas_json     text,          -- Fabric.js canvas JSON für spätere Bearbeitung
  created_at      timestamp with time zone default timezone('utc', now()) not null
);

-- ── Row Level Security ────────────────────────────

alter table public.profiles    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- PROFILES Policies
create policy "Eigenes Profil lesen"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Eigenes Profil updaten"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin: Alle Profile lesen"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ORDERS Policies
create policy "Eigene Bestellungen lesen"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Bestellung erstellen (eingeloggt oder Gast)"
  on public.orders for insert
  with check (true);                                       -- Jeder darf Bestellung erstellen

create policy "Admin: Alle Bestellungen verwalten"
  on public.orders for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ORDER ITEMS Policies
create policy "Eigene Bestellartikel lesen"
  on public.order_items for select
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "Bestellartikel erstellen"
  on public.order_items for insert
  with check (true);

create policy "Admin: Alle Bestellartikel verwalten"
  on public.order_items for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ── Trigger: Profil automatisch bei Registrierung anlegen ──

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Hilfsfunktionen ───────────────────────────────

-- Bestellnummer generieren (STV-XXXXXX)
create or replace function public.generate_order_number()
returns text as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := 'STV-';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- Admin-User setzen (nach dem ersten Login ausführen):
-- update public.profiles set is_admin = true where id = 'DEINE_USER_ID';
-- (Deine User-ID findest du unter Supabase → Authentication → Users)

-- =============================================
-- STICKIVERSE MARKETPLACE EXTENSION
-- =============================================

-- 1. PROFILES (Update)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points_balance integer default 0;

-- 2. CATEGORIES
create table public.categories (
  id uuid default gen_random_uuid() not null primary key,
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- 3. DESIGNS (Community & Official)
create table public.designs (
  id uuid default gen_random_uuid() not null primary key,
  creator_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  category_id uuid references public.categories(id),
  status text default 'draft' check (status in ('draft', 'private', 'pending_review', 'published', 'rejected', 'disabled')),
  visibility text default 'public' check (visibility in ('public', 'private')),
  design_type text default 'sticker',
  shape text not null,
  original_file_path text not null,
  preview_image_path text not null,
  is_official boolean default false,
  is_featured boolean default false,
  rights_confirmed boolean default false,
  rejection_reason text,
  price_override numeric(10,2), -- Falls eigene Preise gewünscht sind, sonst Fallback auf Standard
  created_at timestamp with time zone default timezone('utc', now()) not null,
  published_at timestamp with time zone
);

-- 4. DESIGN TAGS
create table public.design_tags (
  design_id uuid references public.designs(id) on delete cascade,
  tag_id text not null, -- Für einfache Text-Tags
  primary key (design_id, tag_id)
);

-- 5. FAVORITES
create table public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  design_id uuid references public.designs(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  primary key (user_id, design_id)
);

-- 6. DESIGN REVIEWS
create table public.design_reviews (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  design_id uuid references public.designs(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  verified_purchase boolean default false,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- 7. DESIGN SALES
create table public.design_sales (
  id uuid default gen_random_uuid() not null primary key,
  design_id uuid references public.designs(id) on delete set null,
  creator_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete cascade,
  quantity integer not null,
  revenue_amount numeric(10,2) not null,
  points_awarded integer default 0,
  status text default 'pending' check (status in ('pending', 'completed', 'refunded')),
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- 8. POINTS LEDGER
create table public.points_ledger (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  amount integer not null,
  transaction_type text not null check (transaction_type in ('earn_sale', 'earn_bonus', 'spend_reward', 'refund', 'admin_adjustment')),
  reference_id uuid, -- Kann auf sale_id oder redemption_id verweisen
  description text,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- 9. REWARDS (Prämien)
create table public.rewards (
  id uuid default gen_random_uuid() not null primary key,
  title text not null,
  description text,
  points_cost integer not null,
  reward_type text not null check (reward_type in ('discount_percent', 'discount_fixed', 'free_shipping', 'free_product')),
  reward_value numeric(10,2) not null,
  validity_days integer default 365,
  active boolean default true,
  max_per_user integer,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- 10. REWARD REDEMPTIONS
create table public.reward_redemptions (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  reward_id uuid references public.rewards(id) on delete set null,
  points_used integer not null,
  voucher_code text unique not null,
  status text default 'active' check (status in ('active', 'used', 'expired')),
  redeemed_at timestamp with time zone default timezone('utc', now()) not null,
  expires_at timestamp with time zone
);

-- 11. DESIGN REPORTS
create table public.design_reports (
  id uuid default gen_random_uuid() not null primary key,
  design_id uuid references public.designs(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  description text,
  status text default 'open' check (status in ('open', 'reviewed', 'action_taken', 'dismissed')),
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- ── RLS Policies für Marketplace ────────────────────────────

alter table public.designs enable row level security;
alter table public.categories enable row level security;
alter table public.favorites enable row level security;
alter table public.design_reviews enable row level security;

-- Categories (Jeder darf lesen)
create policy "Alle dürfen Kategorien lesen"
  on public.categories for select using (true);

-- Designs (Jeder darf veröffentlichte lesen, Creator darf eigene lesen)
create policy "Öffentliche Designs lesen"
  on public.designs for select using (status = 'published' and visibility = 'public');

create policy "Creator dürfen eigene Designs lesen"
  on public.designs for select using (auth.uid() = creator_id);

create policy "Creator dürfen eigene Designs anlegen"
  on public.designs for insert with check (auth.uid() = creator_id);

create policy "Creator dürfen eigene Entwürfe bearbeiten"
  on public.designs for update using (auth.uid() = creator_id and status in ('draft', 'rejected'));

-- Favorites
create policy "User dürfen eigene Favoriten verwalten"
  on public.favorites for all using (auth.uid() = user_id);

-- Storage / Bucket Policies müssen im Dashboard separat angelegt werden
-- -> original_files: nur private (Creator & Admin)
-- -> preview_images: public read

-- =============================================
-- STICKIVERSE DYNAMIC PRICING EXTENSION
-- =============================================

-- 12. STORE SETTINGS
create table public.store_settings (
  id text not null primary key,
  value numeric not null,
  description text,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

alter table public.store_settings enable row level security;

create policy "Jeder darf Settings lesen"
  on public.store_settings for select using (true);

create policy "Nur Admins dürfen Settings ändern"
  on public.store_settings for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Default Marge einfügen (+10% = 1.10)
insert into public.store_settings (id, value, description)
values ('pricing_margin', 1.10, 'Aufschlag auf den Onlineprinters-Einkaufspreis (z.B. 1.10 = +10%)')
on conflict (id) do nothing;

-- =============================================
-- STICKIVERSE DISCOUNT CODES EXTENSION
-- =============================================

-- 13. COUPONS
create table public.coupons (
  id uuid default gen_random_uuid() not null primary key,
  code text unique not null,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric(10,2) not null,
  max_discount numeric(10,2),
  expires_at timestamp with time zone,
  usage_limit integer,
  usage_count integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

alter table public.coupons enable row level security;

create policy "Jeder darf Coupons lesen"
  on public.coupons for select using (true);

create policy "Nur Admins dürfen Coupons verwalten"
  on public.coupons for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- 14. ORDERS UPDATE FÜR COUPONS
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) default 0.00;

-- 15. RPC ZUM HOCHZÄHLEN DER GUTSCHEIN-NUTZUNG (Umgeht RLS)
create or replace function public.increment_coupon_usage(coupon_code text)
returns void
language plpgsql security definer
as $$
begin
  update public.coupons set usage_count = usage_count + 1 where code = coupon_code;
end;
$$;

-- 16. RECHNUNGSADRESSE in profiles (Billing Address)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_first_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_last_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_company text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_street text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_street_nr text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_zip text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_city text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_country text DEFAULT 'DE';

-- 17. COMMUNITY-FREIGABE für Designs
ALTER TABLE public.designs ADD COLUMN IF NOT EXISTS community_shared boolean DEFAULT false;
