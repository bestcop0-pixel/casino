// ═══════════════════════════════════════════════════
// JetCasino — Edge Function #1: Game API
// Маршруты: /auth, /game/*, /promo/redeem, /free-spins, /leaderboard
// ═══════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

// ═══ TELEGRAM AUTH VALIDATION ═══
async function validateTelegramData(initData: string): Promise<Record<string, string> | null> {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");
  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const enc = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    "raw", enc.encode("WebAppData"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const secret = await crypto.subtle.sign("HMAC", secretKey, enc.encode(BOT_TOKEN));
  const key = await crypto.subtle.importKey(
    "raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(dataCheckString));
  const hexHash = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");

  if (hexHash !== hash) return null;

  const result: Record<string, string> = {};
  for (const [k, v] of params.entries()) result[k] = v;
  return result;
}

// ═══ USER HELPERS ═══
async function getUserByToken(req: Request) {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) return null;
  try {
    const payload = JSON.parse(atob(auth.split(".")[1]));
    const { data } = await supabase.from("users").select("*").eq("id", payload.sub).single();
    return data;
  } catch {
    return null;
  }
}

function makeToken(userId: string, tgId: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    tg_id: tgId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 * 24, // 24h
  }));
  // Простой токен — для продакшена использовать crypto.subtle.sign
  return `${header}.${payload}.sig`;
}

function serverSeed(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return [...arr].map(b => b.toString(16).padStart(2, "0")).join("");
}

function rng(seed: string, index: number): number {
  // Deterministic PRNG from seed + index
  const str = seed + ":" + index;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return ((hash >>> 0) % 10000) / 10000;
}

// ═══ ROUTE: /auth ═══
async function handleAuth(req: Request) {
  const { initData } = await req.json();
  if (!initData) return err("Missing initData");

  console.log("AUTH: initData length =", initData.length, "BOT_TOKEN exists =", !!BOT_TOKEN, "BOT_TOKEN prefix =", BOT_TOKEN?.substring(0, 6));

  const validated = await validateTelegramData(initData);
  if (!validated) {
    console.log("AUTH FAILED: HMAC validation failed");
    return err("Invalid Telegram data", 401);
  }

  const userJson = JSON.parse(validated.user || "{}");
  const tgId = userJson.id;
  if (!tgId) return err("No user ID in initData", 401);

  // Upsert user
  const { data: user, error: upsertErr } = await supabase
    .from("users")
    .upsert({
      tg_id: tgId,
      tg_username: userJson.username || null,
      tg_first_name: userJson.first_name || null,
      tg_photo_url: userJson.photo_url || null,
      last_active: new Date().toISOString(),
    }, { onConflict: "tg_id" })
    .select()
    .single();

  if (upsertErr) return err("DB error: " + upsertErr.message, 500);

  // Get free spins
  const { data: freeSpins } = await supabase
    .from("free_spins")
    .select("*")
    .eq("user_id", user.id)
    .gt("spins_remaining", 0)
    .gt("expires_at", new Date().toISOString());

  // Get recent transactions
  const { data: txs } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const token = makeToken(user.id, tgId);

  return json({
    user_id: user.id,
    tg_id: tgId,
    username: user.tg_username,
    first_name: user.tg_first_name,
    balance: parseFloat(user.balance),
    is_admin: user.is_admin,
    phone: user.phone || null,
    payment_verified: user.payment_verified || false,
    kyc_verified: user.kyc_verified || false,
    free_spins: freeSpins || [],
    transactions: txs || [],
    token,
  });
}

// ═══ ROUTE: /auth/phone ═══
async function handlePhoneSave(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);
  const { phone } = await req.json();
  if (!phone) return err("Missing phone");
  await supabase.from("users").update({ phone }).eq("id", user.id);
  return json({ ok: true });
}

// ═══ ROUTE: /game/spin (встроенные 3-reel слоты) ═══
async function handleSpin(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);
  if (user.is_blocked) return err("Account blocked", 403);

  const { bet } = await req.json();
  if (!bet || bet <= 0) return err("Invalid bet");

  const seed = serverSeed();
  const symbols = [
    Math.floor(rng(seed, 0) * 8),
    Math.floor(rng(seed, 1) * 8),
    Math.floor(rng(seed, 2) * 8),
  ];

  // Win calculation (same logic as client-side)
  let multiplier = 0;
  if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
    multiplier = [50, 25, 15, 10, 8, 5, 3, 2][symbols[0]] || 2;
  } else if (symbols[0] === symbols[1] || symbols[1] === symbols[2]) {
    multiplier = [5, 3, 2, 1.5, 1.2, 1, 0.5, 0.3][symbols[0] === symbols[1] ? symbols[0] : symbols[2]] || 0.5;
  }

  const winAmount = parseFloat((bet * multiplier).toFixed(2));
  const netDelta = winAmount - bet;

  // Deduct bet
  const { data: betResult, error: betErr } = await supabase.rpc("change_balance", {
    p_user_id: user.id,
    p_delta: -bet,
    p_type: "bet",
    p_meta: { game: "slots", bet },
  });
  if (betErr) return err("Insufficient balance", 400);

  // Credit win if any
  let newBalance = betResult[0].new_balance;
  if (winAmount > 0) {
    const { data: winResult } = await supabase.rpc("change_balance", {
      p_user_id: user.id,
      p_delta: winAmount,
      p_type: "win",
      p_meta: { game: "slots", multiplier },
    });
    if (winResult) newBalance = winResult[0].new_balance;
  }

  // Record game session
  await supabase.from("game_sessions").insert({
    user_id: user.id,
    game: "slots",
    bet_amount: bet,
    win_amount: winAmount,
    result: { symbols, multiplier },
    server_seed: seed,
  });

  return json({ symbols, multiplier, win: winAmount, balance: parseFloat(newBalance) });
}

// ═══ ROUTE: /game/crash ═══
async function handleCrash(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);

  const { action, amount, session_id, current_mult } = await req.json();

  if (action === "bet") {
    if (!amount || amount <= 0) return err("Invalid bet");

    const seed = serverSeed();
    // Generate crash target using provably fair algorithm
    const hashBytes = new Uint8Array(32);
    const enc = new TextEncoder();
    const seedData = await crypto.subtle.digest("SHA-256", enc.encode(seed));
    const view = new DataView(seedData);
    const h = view.getUint32(0) / 0xFFFFFFFF;

    let crashTarget: number;
    if (h < 0.05) {
      crashTarget = 1 + h * 10; // 5% instant crash (1.00-1.50)
    } else {
      crashTarget = Math.min(1 / (1 - h) * 0.96, 100); // House edge ~4%
    }
    crashTarget = parseFloat(crashTarget.toFixed(2));

    // Deduct bet
    const { error: betErr } = await supabase.rpc("change_balance", {
      p_user_id: user.id, p_delta: -amount, p_type: "bet",
      p_meta: { game: "crash" },
    });
    if (betErr) return err("Insufficient balance");

    // Create game session with hashed seed
    const seedHash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(seed)))]
      .map(b => b.toString(16).padStart(2, "0")).join("");

    const { data: session } = await supabase.from("game_sessions").insert({
      user_id: user.id, game: "crash", bet_amount: amount, win_amount: 0,
      result: { crash_target: crashTarget, status: "flying" },
      server_seed: seed,
    }).select().single();

    return json({
      session_id: session?.id,
      seed_hash: seedHash,
      balance: parseFloat(user.balance) - amount,
    });
  }

  if (action === "cashout") {
    if (!session_id || !current_mult) return err("Missing data");

    const { data: session } = await supabase.from("game_sessions")
      .select("*").eq("id", session_id).eq("user_id", user.id).single();

    if (!session || session.result.status !== "flying") return err("Invalid session");

    const crashTarget = session.result.crash_target;
    if (current_mult >= crashTarget) return err("Already crashed");

    const win = parseFloat((session.bet_amount * current_mult).toFixed(2));

    // Credit win
    const { data: winResult } = await supabase.rpc("change_balance", {
      p_user_id: user.id, p_delta: win, p_type: "win",
      p_meta: { game: "crash", multiplier: current_mult },
    });

    // Update session
    await supabase.from("game_sessions").update({
      win_amount: win,
      result: { crash_target: crashTarget, cashed_at: current_mult, status: "cashed" },
    }).eq("id", session_id);

    return json({
      win,
      crash_target: crashTarget,
      server_seed: session.server_seed,
      balance: parseFloat(winResult?.[0]?.new_balance || "0"),
    });
  }

  if (action === "resolve") {
    // Round ended without cashout
    const { data: session } = await supabase.from("game_sessions")
      .select("*").eq("id", session_id).eq("user_id", user.id).single();

    if (!session) return err("Invalid session");

    await supabase.from("game_sessions").update({
      result: { ...session.result, status: "crashed" },
    }).eq("id", session_id);

    return json({
      crash_target: session.result.crash_target,
      server_seed: session.server_seed,
    });
  }

  return err("Invalid action");
}

// ═══ ROUTE: /game/roulette ═══
async function handleRoulette(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);

  const { betType, betAmount } = await req.json();
  if (!betType || !betAmount || betAmount <= 0) return err("Invalid bet");

  const seed = serverSeed();
  const resultIdx = Math.floor(rng(seed, 0) * 37);
  const RL_NUMS = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  const num = RL_NUMS[resultIdx];
  const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
  const isRed = RED.has(num);
  const isBlack = num > 0 && !isRed;

  let multiplier = 0;
  if (betType === "green" && num === 0) multiplier = 14;
  else if (betType === "red" && isRed) multiplier = 2;
  else if (betType === "black" && isBlack) multiplier = 2;
  else if (betType === "odd" && num > 0 && num % 2 === 1) multiplier = 2;
  else if (betType === "even" && num > 0 && num % 2 === 0) multiplier = 2;
  else if (betType === "high" && num >= 19) multiplier = 2;
  else if (betType === "low" && num >= 1 && num <= 18) multiplier = 2;

  const winAmount = parseFloat((betAmount * multiplier).toFixed(2));

  // Deduct bet
  const { error: betErr } = await supabase.rpc("change_balance", {
    p_user_id: user.id, p_delta: -betAmount, p_type: "bet",
    p_meta: { game: "roulette", betType },
  });
  if (betErr) return err("Insufficient balance");

  let newBalance = parseFloat(user.balance) - betAmount;
  if (winAmount > 0) {
    const { data: winResult } = await supabase.rpc("change_balance", {
      p_user_id: user.id, p_delta: winAmount, p_type: "win",
      p_meta: { game: "roulette", number: num },
    });
    if (winResult) newBalance = parseFloat(winResult[0].new_balance);
  }

  await supabase.from("game_sessions").insert({
    user_id: user.id, game: "roulette", bet_amount: betAmount,
    win_amount: winAmount, result: { number: num, betType, multiplier },
    server_seed: seed,
  });

  return json({ resultIdx, number: num, isRed, multiplier, win: winAmount, balance: newBalance });
}

// ═══ ROUTE: /game/blackjack ═══
async function handleBlackjack(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);

  const { action, bet, session_id } = await req.json();
  const SUITS = ["♠", "♥", "♦", "♣"];
  const VALS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  function buildDeck(seed: string): string[] {
    const deck: string[] = [];
    for (const s of SUITS) for (const v of VALS) deck.push(v + s);
    // Fisher-Yates shuffle with seed
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng(seed, i) * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function cardVal(card: string): number {
    const v = card.slice(0, -1);
    if (["J", "Q", "K"].includes(v)) return 10;
    if (v === "A") return 11;
    return parseInt(v);
  }

  function handTotal(cards: string[]): number {
    let total = cards.reduce((s, c) => s + cardVal(c), 0);
    let aces = cards.filter(c => c.startsWith("A")).length;
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
  }

  if (action === "deal") {
    if (!bet || bet <= 0) return err("Invalid bet");

    const seed = serverSeed();
    const deck = buildDeck(seed);
    const playerCards = [deck[0], deck[2]];
    const dealerCards = [deck[1], deck[3]];
    const deckRemaining = deck.slice(4);

    const { error: betErr } = await supabase.rpc("change_balance", {
      p_user_id: user.id, p_delta: -bet, p_type: "bet",
      p_meta: { game: "blackjack" },
    });
    if (betErr) return err("Insufficient balance");

    const { data: session } = await supabase.from("game_sessions").insert({
      user_id: user.id, game: "blackjack", bet_amount: bet,
      result: { playerCards, dealerCards, deck: deckRemaining, status: "active" },
      server_seed: seed,
    }).select().single();

    return json({
      session_id: session?.id,
      playerCards,
      dealerUpCard: dealerCards[0],
      playerTotal: handTotal(playerCards),
      balance: parseFloat(user.balance) - bet,
    });
  }

  // Hit / Stand / Double
  const { data: session } = await supabase.from("game_sessions")
    .select("*").eq("id", session_id).eq("user_id", user.id).single();

  if (!session || session.result.status !== "active") return err("Invalid session");

  const { playerCards, dealerCards, deck } = session.result;
  let newBet = session.bet_amount;

  if (action === "hit") {
    playerCards.push(deck.shift());
    const total = handTotal(playerCards);

    if (total > 21) {
      // Bust
      await supabase.from("game_sessions").update({
        result: { playerCards, dealerCards, deck, status: "bust" },
      }).eq("id", session_id);

      return json({
        card: playerCards[playerCards.length - 1],
        playerTotal: total,
        bust: true,
        win: 0,
        balance: parseFloat(user.balance),
      });
    }

    await supabase.from("game_sessions").update({
      result: { playerCards, dealerCards, deck, status: "active" },
    }).eq("id", session_id);

    return json({
      card: playerCards[playerCards.length - 1],
      playerTotal: total,
      bust: false,
    });
  }

  if (action === "double") {
    const { error: extraBetErr } = await supabase.rpc("change_balance", {
      p_user_id: user.id, p_delta: -session.bet_amount, p_type: "bet",
      p_meta: { game: "blackjack", double: true },
    });
    if (extraBetErr) return err("Insufficient balance for double");
    newBet = session.bet_amount * 2;
    playerCards.push(deck.shift());
    // Fall through to stand logic
  }

  // Stand (or after double)
  if (action === "stand" || action === "double") {
    let dealerTotal = handTotal(dealerCards);
    while (dealerTotal < 17) {
      dealerCards.push(deck.shift());
      dealerTotal = handTotal(dealerCards);
    }

    const playerTotal = handTotal(playerCards);
    let win = 0;
    let outcome = "lose";

    if (playerTotal > 21) {
      outcome = "bust";
    } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
      outcome = playerCards.length === 2 && playerTotal === 21 ? "blackjack" : "win";
      win = outcome === "blackjack" ? newBet * 2.5 : newBet * 2;
    } else if (playerTotal === dealerTotal) {
      outcome = "push";
      win = newBet; // Return bet
    }

    win = parseFloat(win.toFixed(2));
    let newBalance = parseFloat(user.balance);

    if (win > 0) {
      const { data: winResult } = await supabase.rpc("change_balance", {
        p_user_id: user.id, p_delta: win, p_type: outcome === "push" ? "refund" : "win",
        p_meta: { game: "blackjack", outcome },
      });
      if (winResult) newBalance = parseFloat(winResult[0].new_balance);
    }

    await supabase.from("game_sessions").update({
      bet_amount: newBet,
      win_amount: win,
      result: { playerCards, dealerCards, status: outcome },
    }).eq("id", session_id);

    return json({
      dealerCards,
      dealerTotal,
      playerTotal,
      outcome,
      win,
      balance: newBalance,
    });
  }

  return err("Invalid action");
}

// ═══ ROUTE: /game/iframe (слоты в iframe — seed-based) ═══
async function handleIframe(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);

  const { action, game, bet, session_id, win_amount } = await req.json();

  if (action === "get-seed") {
    if (!game || !bet || bet <= 0) return err("Invalid params");

    // Check for free spins
    const { data: freeSpinData } = await supabase.from("free_spins")
      .select("*").eq("user_id", user.id).eq("game", game)
      .gt("spins_remaining", 0).gt("expires_at", new Date().toISOString())
      .limit(1).single();

    const isFreeSpin = !!freeSpinData;
    const actualBet = isFreeSpin ? freeSpinData.bet_value : bet;

    if (!isFreeSpin) {
      const { error: betErr } = await supabase.rpc("change_balance", {
        p_user_id: user.id, p_delta: -actualBet, p_type: "bet",
        p_meta: { game },
      });
      if (betErr) return err("Insufficient balance");
    } else {
      await supabase.from("free_spins").update({
        spins_remaining: freeSpinData.spins_remaining - 1,
      }).eq("id", freeSpinData.id);
    }

    const seed = serverSeed();
    const { data: session } = await supabase.from("game_sessions").insert({
      user_id: user.id, game, bet_amount: actualBet, win_amount: 0,
      result: { status: "spinning" }, server_seed: seed, is_free_spin: isFreeSpin,
    }).select().single();

    return json({
      session_id: session?.id,
      seed,
      balance: parseFloat(user.balance) - (isFreeSpin ? 0 : actualBet),
      is_free_spin: isFreeSpin,
      free_spins_remaining: isFreeSpin ? freeSpinData.spins_remaining - 1 : 0,
    });
  }

  if (action === "report-result") {
    if (!session_id) return err("Missing session_id");

    const { data: session } = await supabase.from("game_sessions")
      .select("*").eq("id", session_id).eq("user_id", user.id).single();

    if (!session) return err("Invalid session");

    const winAmt = parseFloat(win_amount) || 0;

    // Cap win at reasonable multiplier (anti-cheat: max 5000x bet)
    const maxWin = session.bet_amount * 5000;
    const safeWin = Math.min(winAmt, maxWin);

    let newBalance = parseFloat(user.balance);
    if (safeWin > 0) {
      const { data: winResult } = await supabase.rpc("change_balance", {
        p_user_id: user.id, p_delta: safeWin,
        p_type: session.is_free_spin ? "free_spin_win" : "win",
        p_meta: { game: session.game },
      });
      if (winResult) newBalance = parseFloat(winResult[0].new_balance);

      // Update free spin total_won
      if (session.is_free_spin) {
        await supabase.from("free_spins")
          .update({ total_won: supabase.rpc ? safeWin : safeWin })
          .eq("user_id", user.id).eq("game", session.game);
      }
    }

    await supabase.from("game_sessions").update({
      win_amount: safeWin,
      result: { status: "completed", reported_win: winAmt, accepted_win: safeWin },
    }).eq("id", session_id);

    return json({ balance: newBalance, accepted_win: safeWin });
  }

  return err("Invalid action");
}

// ═══ ROUTE: /promo/redeem ═══
async function handlePromo(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);

  const { code } = await req.json();
  if (!code) return err("Missing code");

  const { data: promo } = await supabase.from("promo_codes")
    .select("*").eq("code", code.trim().toUpperCase()).eq("is_active", true).single();

  if (!promo) return err("Промокод не найден или неактивен");
  if (promo.used_count >= promo.max_uses) return err("Промокод исчерпан");
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) return err("Промокод истёк");

  // Check if already redeemed
  const { data: existing } = await supabase.from("promo_redemptions")
    .select("id").eq("user_id", user.id).eq("promo_id", promo.id).single();

  if (existing) return err("Вы уже активировали этот промокод");

  let result: Record<string, unknown> = {};

  if (promo.type === "balance") {
    const { data: balResult } = await supabase.rpc("change_balance", {
      p_user_id: user.id, p_delta: promo.value, p_type: "promo",
      p_meta: { promo_code: promo.code },
    });
    result = { type: "balance", amount: promo.value, balance: parseFloat(balResult?.[0]?.new_balance || "0") };
  } else if (promo.type === "free_spins") {
    await supabase.from("free_spins").insert({
      user_id: user.id,
      game: promo.game || "sweet-gems",
      spins_remaining: promo.value,
      spins_total: promo.value,
      source: "promo",
    });
    result = { type: "free_spins", spins: promo.value, game: promo.game };
  }

  // Record redemption & increment counter
  await supabase.from("promo_redemptions").insert({ user_id: user.id, promo_id: promo.id });
  await supabase.from("promo_codes").update({ used_count: promo.used_count + 1 }).eq("id", promo.id);

  return json({ success: true, ...result });
}

// ═══ ROUTE: /free-spins ═══
async function handleFreeSpins(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);

  const { data: spins } = await supabase.from("free_spins")
    .select("*").eq("user_id", user.id)
    .gt("spins_remaining", 0).gt("expires_at", new Date().toISOString());

  return json({ free_spins: spins || [] });
}

// ═══ ROUTE: /leaderboard ═══
async function handleLeaderboard(req: Request) {
  const { data: top } = await supabase
    .from("game_sessions")
    .select("user_id, users!inner(tg_username, tg_first_name)")
    .gt("win_amount", 0)
    .order("win_amount", { ascending: false })
    .limit(20);

  // Aggregate top winners
  const winners: Record<string, { name: string; total: number; count: number }> = {};
  (top || []).forEach((row: any) => {
    const uid = row.user_id;
    if (!winners[uid]) {
      winners[uid] = {
        name: row.users?.tg_first_name || row.users?.tg_username || "Anon",
        total: 0, count: 0,
      };
    }
    winners[uid].total += parseFloat(row.win_amount || 0);
    winners[uid].count++;
  });

  const leaderboard = Object.values(winners)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((w, i) => ({ rank: i + 1, name: w.name, total_won: w.total, games: w.count }));

  return json({ leaderboard });
}

// ═══ ROUTE: /game/sync (balance sync after iframe game) ═══
async function handleGameSync(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);

  const { game, total_bet, total_win } = await req.json();
  if (!game) return err("Missing game name");

  const totalBet = parseFloat(total_bet) || 0;
  const totalWin = parseFloat(total_win) || 0;

  if (totalBet <= 0 && totalWin <= 0) {
    return json({ balance: parseFloat(user.balance) });
  }

  let newBalance = parseFloat(user.balance);

  // Deduct total bets
  if (totalBet > 0) {
    const { data: betResult, error: betErr } = await supabase.rpc("change_balance", {
      p_user_id: user.id, p_delta: -totalBet, p_type: "bet",
      p_meta: { game, source: "iframe_sync" },
    });
    if (betErr) return err("Sync failed: " + betErr.message);
    if (betResult) newBalance = parseFloat(betResult[0].new_balance);
  }

  // Credit total wins
  if (totalWin > 0) {
    const { data: winResult, error: winErr } = await supabase.rpc("change_balance", {
      p_user_id: user.id, p_delta: totalWin, p_type: "win",
      p_meta: { game, source: "iframe_sync" },
    });
    if (winErr) return err("Sync failed: " + winErr.message);
    if (winResult) newBalance = parseFloat(winResult[0].new_balance);
  }

  // Record game session summary
  await supabase.from("game_sessions").insert({
    user_id: user.id, game,
    bet_amount: totalBet, win_amount: totalWin,
    result: { type: "iframe_session", net: totalWin - totalBet },
    server_seed: serverSeed(),
  });

  return json({ balance: newBalance });
}

// ═══ MAIN ROUTER ═══
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const path = url.pathname.split("/game-api").pop() || "/";

  try {
    switch (true) {
      case path === "/auth": return await handleAuth(req);
      case path === "/auth/phone": return await handlePhoneSave(req);
      case path === "/game/spin": return await handleSpin(req);
      case path === "/game/crash": return await handleCrash(req);
      case path === "/game/roulette": return await handleRoulette(req);
      case path === "/game/blackjack": return await handleBlackjack(req);
      case path === "/game/iframe": return await handleIframe(req);
      case path === "/game/sync": return await handleGameSync(req);
      case path === "/promo/redeem": return await handlePromo(req);
      case path === "/free-spins": return await handleFreeSpins(req);
      case path === "/leaderboard": return await handleLeaderboard(req);
      case path === "/bot/webhook": return await handleBotWebhook(req);
      case path === "/bot/set-webhook": return await setBotWebhook();
      default: return err("Not found", 404);
    }
  } catch (e: any) {
    return err("Server error: " + e.message, 500);
  }
});

// ═══ TELEGRAM BOT WEBHOOK ═══
const WEBAPP_URL = "https://bestcop0-pixel.github.io/casino/";

async function tgApi(method: string, body: Record<string, unknown> = {}) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function setBotWebhook() {
  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/game-api/bot/webhook`;
  const result = await tgApi("setWebhook", {
    url: webhookUrl,
    allowed_updates: ["message"],
  });
  // Установить команды и кнопку меню
  await tgApi("setMyCommands", {
    commands: [
      { command: "start", description: "Запустить казино" },
      { command: "balance", description: "Проверить баланс" },
      { command: "help", description: "Помощь" },
    ],
  });
  await tgApi("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "🎰 Играть",
      web_app: { url: WEBAPP_URL },
    },
  });
  return json({ ok: true, webhook: webhookUrl, result });
}

async function handleBotWebhook(req: Request) {
  const update = await req.json();
  const msg = update.message;
  if (!msg) return json({ ok: true });

  const chatId = msg.chat.id;
  const tgId = msg.from.id;

  // Обработка контакта (номер телефона)
  if (msg.contact) {
    const phone = msg.contact.phone_number;
    // Сохранить в БД
    await supabase.from("users").update({ phone }).eq("tg_id", tgId);
    await tgApi("sendMessage", {
      chat_id: chatId,
      text: `✅ Номер ${phone} сохранён!\n\nНажмите кнопку ниже, чтобы начать играть 🎰`,
      reply_markup: {
        inline_keyboard: [[
          { text: "🎰 Открыть Sphere", web_app: { url: WEBAPP_URL } }
        ]],
        remove_keyboard: true,
      },
    });
    return json({ ok: true });
  }

  // Команда /start
  const text = msg.text || "";
  if (text === "/start" || text.startsWith("/start")) {
    // Создаём пользователя если его нет
    await supabase.from("users").upsert({
      tg_id: tgId,
      tg_username: msg.from.username || null,
      tg_first_name: msg.from.first_name || null,
      last_active: new Date().toISOString(),
    }, { onConflict: "tg_id" });

    // Проверяем есть ли уже номер
    const { data: user } = await supabase.from("users").select("phone").eq("tg_id", tgId).single();

    if (user?.phone) {
      // Номер уже есть — сразу играть
      await tgApi("sendMessage", {
        chat_id: chatId,
        text: `🎰 *Sphere Casino*\n\nДобро пожаловать, ${msg.from.first_name}!\nНажмите кнопку ниже, чтобы играть.`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "🎰 Играть", web_app: { url: WEBAPP_URL } }
          ]],
        },
      });
    } else {
      // Запросить номер
      await tgApi("sendMessage", {
        chat_id: chatId,
        text: `🎰 *Sphere Casino*\n\nДобро пожаловать, ${msg.from.first_name}!\n\nДля начала, поделитесь номером телефона для верификации 👇`,
        parse_mode: "Markdown",
        reply_markup: {
          keyboard: [[
            { text: "\u041f\u043e\u0434\u0435\u043b\u0438\u0442\u044c\u0441\u044f \u043d\u043e\u043c\u0435\u0440\u043e\u043c", request_contact: true }
          ]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    }
    return json({ ok: true });
  }

  if (text === "/balance") {
    const { data: user } = await supabase.from("users").select("balance").eq("tg_id", tgId).single();
    const bal = user ? parseFloat(user.balance).toFixed(2) : "0.00";
    await tgApi("sendMessage", {
      chat_id: chatId,
      text: `💰 Ваш баланс: *${bal} USDT*`,
      parse_mode: "Markdown",
    });
    return json({ ok: true });
  }

  if (text === "/help") {
    await tgApi("sendMessage", {
      chat_id: chatId,
      text: `🎰 *Sphere Casino — Помощь*\n\n/start — Запустить казино\n/balance — Проверить баланс\n\nНажмите кнопку «🎰 Играть» внизу чата для запуска.`,
      parse_mode: "Markdown",
    });
    return json({ ok: true });
  }

  // Любое другое сообщение — проверяем номер, если нет — запрашиваем
  const { data: anyUser } = await supabase.from("users").select("phone").eq("tg_id", tgId).single();
  if (!anyUser?.phone) {
    await tgApi("sendMessage", {
      chat_id: chatId,
      text: `📱 Для доступа к Sphere поделитесь номером телефона 👇`,
      reply_markup: {
        keyboard: [[
          { text: "\u041f\u043e\u0434\u0435\u043b\u0438\u0442\u044c\u0441\u044f \u043d\u043e\u043c\u0435\u0440\u043e\u043c", request_contact: true }
        ]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  } else {
    await tgApi("sendMessage", {
      chat_id: chatId,
      text: `🎰 Нажмите кнопку ниже, чтобы играть!`,
      reply_markup: {
        inline_keyboard: [[
          { text: "🎰 Открыть Sphere", web_app: { url: WEBAPP_URL } }
        ]],
      },
    });
  }

  return json({ ok: true });
}
