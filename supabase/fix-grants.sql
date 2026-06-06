-- HL Finance — Fix missing table privileges (error 42501)
-- Jalankan di Supabase SQL Editor jika /customers error "permission denied"
-- Root cause: RLS enabled tapi role `authenticated` belum dapat GRANT

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_discounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transaction_lines TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bonus_grants TO authenticated;
