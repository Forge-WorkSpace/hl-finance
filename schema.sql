-- HL Finance App — Database Schema
-- Jalankan di Supabase SQL Editor, sekali saja

-- ============================================
-- 1. CUSTOMERS
-- ============================================
CREATE TABLE customers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama            text NOT NULL,
  bonus_threshold numeric(15,2) NOT NULL DEFAULT 0,
  deleted_at      timestamptz NULL,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users only" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 2. CUSTOMER DISCOUNTS
-- ============================================
CREATE TABLE customer_discounts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_type   text NOT NULL CHECK (product_type IN ('LM', 'BR')),
  discount_steps jsonb NOT NULL DEFAULT '[]',
  UNIQUE(customer_id, product_type)
);

ALTER TABLE customer_discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users only" ON customer_discounts
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 3. PRODUCTS
-- ============================================
CREATE TABLE products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama         text NOT NULL,
  harga_modal  numeric(15,2) NOT NULL DEFAULT 0,
  harga_base   numeric(15,2) NOT NULL DEFAULT 0,
  tipe         text NOT NULL CHECK (tipe IN ('LM', 'BR')),
  deleted_at   timestamptz NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users only" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 4. TRANSACTIONS
-- ============================================
CREATE TABLE transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_bon     text NOT NULL UNIQUE,
  tanggal       date NOT NULL DEFAULT CURRENT_DATE,
  customer_id   uuid NOT NULL REFERENCES customers(id),
  ongkir        numeric(15,2) NOT NULL DEFAULT 0,
  deskripsi     text NULL,
  is_bonus      boolean NOT NULL DEFAULT false,
  status        text NOT NULL CHECK (status IN ('piutang', 'lunas')) DEFAULT 'piutang',
  tanggal_lunas date NULL,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users only" ON transactions
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 5. TRANSACTION LINES
-- ============================================
CREATE TABLE transaction_lines (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id        uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id            uuid NOT NULL REFERENCES products(id),
  quantity              integer NOT NULL CHECK (quantity >= 1),
  snapshot_harga_base   numeric(15,2) NOT NULL,
  snapshot_harga_modal  numeric(15,2) NOT NULL,
  snapshot_discounts    jsonb NOT NULL DEFAULT '[]',
  discounted_unit_price numeric(15,2) NOT NULL,
  line_omzet            numeric(15,2) NOT NULL,
  line_laba             numeric(15,2) NOT NULL
);

ALTER TABLE transaction_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users only" ON transaction_lines
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 6. BONUS GRANTS
-- ============================================
CREATE TABLE bonus_grants (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      uuid NOT NULL REFERENCES customers(id),
  transaction_id   uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  bonuses_consumed integer NOT NULL DEFAULT 1,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE bonus_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users only" ON bonus_grants
  FOR ALL USING (auth.role() = 'authenticated');
