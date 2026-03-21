-- ═══════════════════════════════════════════════════
-- JetCasino — Supabase Database Schema
-- Запустить в Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tg_id BIGINT UNIQUE NOT NULL,
  tg_username TEXT,
  tg_first_name TEXT,
  tg_photo_url TEXT,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_tg_id ON users(tg_id);

-- 2. TRANSACTIONS
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('deposit','withdraw','bet','win','promo','free_spin_win','refund')),
  amount DECIMAL(12,2) NOT NULL,
  balance_before DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tx_user ON transactions(user_id, created_at DESC);
CREATE INDEX idx_tx_type ON transactions(type);

-- 3. GAME SESSIONS
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  game TEXT NOT NULL,
  bet_amount DECIMAL(12,2) NOT NULL,
  win_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  result JSONB NOT NULL DEFAULT '{}',
  server_seed TEXT NOT NULL,
  client_seed TEXT,
  is_free_spin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_gs_user ON game_sessions(user_id, created_at DESC);
CREATE INDEX idx_gs_game ON game_sessions(game);

-- 4. PROMO CODES
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('balance','free_spins')),
  value DECIMAL(12,2) NOT NULL,
  game TEXT,
  max_uses INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_promo_code ON promo_codes(code);

-- 5. PROMO REDEMPTIONS
CREATE TABLE promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  promo_id UUID NOT NULL REFERENCES promo_codes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, promo_id)
);

-- 6. FREE SPINS
CREATE TABLE free_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  game TEXT NOT NULL,
  spins_remaining INT NOT NULL,
  spins_total INT NOT NULL,
  bet_value DECIMAL(12,2) NOT NULL DEFAULT 1.00,
  total_won DECIMAL(12,2) NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'promo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);
CREATE INDEX idx_fs_user ON free_spins(user_id, game);

-- 7. PAYMENT INVOICES (CryptoBot)
CREATE TABLE payment_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  crypto_bot_invoice_id TEXT UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDT',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','expired','cancelled')),
  pay_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);
CREATE INDEX idx_pi_user ON payment_invoices(user_id);
CREATE INDEX idx_pi_status ON payment_invoices(status);

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_invoices ENABLE ROW LEVEL SECURITY;

-- Пользователь видит только свои данные (через Realtime)
CREATE POLICY "users_select_own" ON users FOR SELECT USING (true);
CREATE POLICY "tx_select_own" ON transactions FOR SELECT USING (true);
CREATE POLICY "gs_select_own" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "promo_select" ON promo_codes FOR SELECT USING (is_active = true);
CREATE POLICY "fs_select_own" ON free_spins FOR SELECT USING (true);
CREATE POLICY "pi_select_own" ON payment_invoices FOR SELECT USING (true);

-- Запись только через service_role (Edge Functions)
-- По умолчанию RLS блокирует INSERT/UPDATE/DELETE для anon role

-- ═══════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════

-- Атомарное изменение баланса с проверкой
CREATE OR REPLACE FUNCTION change_balance(
  p_user_id UUID,
  p_delta DECIMAL,
  p_type TEXT,
  p_meta JSONB DEFAULT '{}'
) RETURNS TABLE(new_balance DECIMAL, tx_id UUID) AS $$
DECLARE
  v_old_bal DECIMAL;
  v_new_bal DECIMAL;
  v_tx_id UUID;
BEGIN
  -- Блокировка строки для атомарности
  SELECT balance INTO v_old_bal FROM users WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  v_new_bal := v_old_bal + p_delta;

  IF v_new_bal < 0 THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Обновить баланс
  UPDATE users SET balance = v_new_bal, last_active = NOW() WHERE id = p_user_id;

  -- Записать транзакцию
  INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, meta)
  VALUES (p_user_id, p_type, ABS(p_delta), v_old_bal, v_new_bal, p_meta)
  RETURNING id INTO v_tx_id;

  RETURN QUERY SELECT v_new_bal, v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Статистика для админки
CREATE OR REPLACE FUNCTION admin_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM users),
    'active_today', (SELECT COUNT(*) FROM users WHERE last_active > NOW() - INTERVAL '24 hours'),
    'total_deposits', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'deposit'),
    'total_withdrawals', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'withdraw'),
    'total_bets', (SELECT COALESCE(SUM(bet_amount), 0) FROM game_sessions),
    'total_wins', (SELECT COALESCE(SUM(win_amount), 0) FROM game_sessions),
    'house_profit', (SELECT COALESCE(SUM(bet_amount - win_amount), 0) FROM game_sessions),
    'games_played', (SELECT COUNT(*) FROM game_sessions),
    'active_promos', (SELECT COUNT(*) FROM promo_codes WHERE is_active = true),
    'pending_invoices', (SELECT COUNT(*) FROM payment_invoices WHERE status = 'pending')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Включить Realtime для таблицы users (баланс обновляется в реальном времени)
ALTER PUBLICATION supabase_realtime ADD TABLE users;
