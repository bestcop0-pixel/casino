// ═══════════════════════════════════════════════════
// JetCasino — Edge Function #2: Payments & Admin
// Маршруты: /pay/*, /admin/*
// ═══════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRYPTO_BOT_TOKEN = Deno.env.get("CRYPTO_BOT_TOKEN")!;
const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!;
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "sphere_admin_2024";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CRYPTO_BOT_API = "https://pay.crypt.bot/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, crypto-pay-api-signature, x-admin-password",
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

// ═══ AUTH HELPERS ═══
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

async function requireAdmin(req: Request) {
  // Check admin password from header
  const adminPass = req.headers.get("x-admin-password");
  console.log("requireAdmin: got pass =", adminPass?.substring(0,4), "expected =", ADMIN_PASSWORD?.substring(0,4));
  if (adminPass && adminPass === ADMIN_PASSWORD) {
    return { id: "admin", is_admin: true, tg_id: 0, balance: 0 };
  }
  // Also check from body
  try {
    const clone = req.clone();
    const body = await clone.json();
    if (body.admin_password && body.admin_password === ADMIN_PASSWORD) {
      return { id: "admin", is_admin: true, tg_id: 0, balance: 0 };
    }
  } catch {}

  // Fallback: check JWT token
  const user = await getUserByToken(req);
  if (!user) return null;
  if (!user.is_admin) return null;
  return user;
}

// ═══ CRYPTOBOT API ═══
async function cryptoBotRequest(method: string, params: Record<string, unknown> = {}) {
  const res = await fetch(`${CRYPTO_BOT_API}/${method}`, {
    method: "POST",
    headers: {
      "Crypto-Pay-API-Token": CRYPTO_BOT_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  return await res.json();
}

// ═══ ROUTE: /pay/create-invoice ═══
async function handleCreateInvoice(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);

  const { amount } = await req.json();
  if (!amount || amount < 1) return err("Минимальный депозит: 1 USDT");
  if (amount > 10000) return err("Максимальный депозит: 10000 USDT");

  // Create CryptoBot invoice
  const result = await cryptoBotRequest("createInvoice", {
    asset: "USDT",
    amount: amount.toString(),
    description: `JetCasino депозит ${amount} USDT`,
    paid_btn_name: "callback",
    paid_btn_url: "https://t.me/YOUR_BOT_USERNAME", // Замените на ваш бот
    payload: user.id,
  });

  if (!result.ok) return err("Ошибка создания платежа: " + (result.error?.name || "unknown"), 500);

  const invoice = result.result;

  // Save invoice in DB
  await supabase.from("payment_invoices").insert({
    user_id: user.id,
    crypto_bot_invoice_id: invoice.invoice_id.toString(),
    amount,
    currency: "USDT",
    status: "pending",
    pay_url: invoice.pay_url,
  });

  return json({
    invoice_id: invoice.invoice_id,
    pay_url: invoice.pay_url,
    amount,
  });
}

// ═══ ROUTE: /pay/webhook (CryptoBot callback) ═══
async function handleWebhook(req: Request) {
  // Verify CryptoBot signature
  const body = await req.text();
  const signature = req.headers.get("crypto-pay-api-signature");

  if (!signature) return err("Missing signature", 403);

  // Verify HMAC-SHA-256
  const enc = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest("SHA-256", enc.encode(CRYPTO_BOT_TOKEN)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", secretKey, enc.encode(body));
  const hexSig = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");

  if (hexSig !== signature) return err("Invalid signature", 403);

  const data = JSON.parse(body);

  if (data.update_type !== "invoice_paid") return json({ ok: true });

  const invoice = data.payload;
  const invoiceId = invoice.invoice_id.toString();
  const amount = parseFloat(invoice.amount);
  const userId = invoice.payload; // We stored user_id in payload

  // Find invoice in DB
  const { data: dbInvoice } = await supabase.from("payment_invoices")
    .select("*")
    .eq("crypto_bot_invoice_id", invoiceId)
    .single();

  if (!dbInvoice) return err("Invoice not found");
  if (dbInvoice.status === "paid") return json({ ok: true }); // Already processed

  // Credit balance
  await supabase.rpc("change_balance", {
    p_user_id: dbInvoice.user_id,
    p_delta: amount,
    p_type: "deposit",
    p_meta: { invoice_id: invoiceId, crypto_bot: true },
  });

  // Update invoice status
  await supabase.from("payment_invoices").update({
    status: "paid",
    paid_at: new Date().toISOString(),
  }).eq("id", dbInvoice.id);

  return json({ ok: true });
}

// ═══ ROUTE: /pay/withdraw ═══
async function handleWithdraw(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);

  const { amount } = await req.json();
  if (!amount || amount < 5) return err("Минимальный вывод: 5 USDT");
  if (amount > parseFloat(user.balance)) return err("Недостаточно средств");

  // Deduct balance first
  const { error: balErr } = await supabase.rpc("change_balance", {
    p_user_id: user.id,
    p_delta: -amount,
    p_type: "withdraw",
    p_meta: { method: "crypto_bot" },
  });

  if (balErr) return err("Ошибка списания");

  // Send via CryptoBot transfer
  const result = await cryptoBotRequest("transfer", {
    user_id: user.tg_id,
    asset: "USDT",
    amount: amount.toString(),
    spend_id: crypto.randomUUID(),
  });

  if (!result.ok) {
    // Refund if transfer failed
    await supabase.rpc("change_balance", {
      p_user_id: user.id,
      p_delta: amount,
      p_type: "refund",
      p_meta: { reason: "transfer_failed" },
    });
    return err("Ошибка отправки. Средства возвращены.");
  }

  return json({
    success: true,
    amount,
    balance: parseFloat(user.balance) - amount,
  });
}

// ═══ ROUTE: /pay/check ═══
async function handlePayCheck(req: Request) {
  const user = await getUserByToken(req);
  if (!user) return err("Unauthorized", 401);

  // Return current balance (refreshed from DB)
  const { data: freshUser } = await supabase.from("users")
    .select("balance").eq("id", user.id).single();

  return json({ balance: parseFloat(freshUser?.balance || "0") });
}

// ═══════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════

// ═══ ROUTE: /admin/stats ═══
async function handleAdminStats(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return err("Forbidden", 403);

  const { data: stats } = await supabase.rpc("admin_stats");
  return json(stats || {});
}

// ═══ ROUTE: /admin/users ═══
async function handleAdminUsers(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return err("Forbidden", 403);

  if (req.method === "GET" || req.method === "POST") {
    const body = req.method === "POST" ? await req.json() : {};

    if (body.action === "adjust_balance") {
      const { user_id, amount, reason } = body;
      const { data: result } = await supabase.rpc("change_balance", {
        p_user_id: user_id,
        p_delta: amount,
        p_type: amount > 0 ? "promo" : "withdraw",
        p_meta: { admin: admin.id, reason },
      });
      return json({ success: true, new_balance: result?.[0]?.new_balance });
    }

    if (body.action === "block") {
      await supabase.from("users").update({ is_blocked: true }).eq("id", body.user_id);
      return json({ success: true });
    }

    if (body.action === "unblock") {
      await supabase.from("users").update({ is_blocked: false }).eq("id", body.user_id);
      return json({ success: true });
    }

    if (body.action === "make_admin") {
      await supabase.from("users").update({ is_admin: true }).eq("id", body.user_id);
      return json({ success: true });
    }

    // List users
    const page = body.page || 0;
    const search = body.search || "";
    let query = supabase.from("users").select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * 20, (page + 1) * 20 - 1);

    if (search) {
      query = query.or(`tg_username.ilike.%${search}%,tg_first_name.ilike.%${search}%`);
    }

    const { data: users, count } = await query;
    return json({ users: users || [], total: count || 0, page });
  }

  return err("Method not allowed", 405);
}

// ═══ ROUTE: /admin/promos ═══
async function handleAdminPromos(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return err("Forbidden", 403);

  const body = await req.json();

  if (body.action === "create") {
    const { code, type, value, game, max_uses, expires_days } = body;
    if (!code || !type || !value) return err("Missing required fields");

    const { data: promo, error } = await supabase.from("promo_codes").insert({
      code: code.trim().toUpperCase(),
      type,
      value,
      game: game || null,
      max_uses: max_uses || 100,
      expires_at: expires_days ? new Date(Date.now() + expires_days * 86400000).toISOString() : null,
    }).select().single();

    if (error) return err("Ошибка создания: " + error.message);
    return json({ success: true, promo });
  }

  if (body.action === "deactivate") {
    await supabase.from("promo_codes").update({ is_active: false }).eq("id", body.promo_id);
    return json({ success: true });
  }

  if (body.action === "activate") {
    await supabase.from("promo_codes").update({ is_active: true }).eq("id", body.promo_id);
    return json({ success: true });
  }

  // List promos
  const { data: promos } = await supabase.from("promo_codes")
    .select("*").order("created_at", { ascending: false });

  return json({ promos: promos || [] });
}

// ═══ ROUTE: /admin/free-spins ═══
async function handleAdminFreeSpins(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return err("Forbidden", 403);

  const body = await req.json();

  if (body.action === "grant") {
    const { user_id, game, spins, bet_value, expires_days } = body;
    if (!user_id || !game || !spins) return err("Missing required fields");

    await supabase.from("free_spins").insert({
      user_id,
      game,
      spins_remaining: spins,
      spins_total: spins,
      bet_value: bet_value || 1.00,
      source: "admin",
      expires_at: new Date(Date.now() + (expires_days || 7) * 86400000).toISOString(),
    });

    return json({ success: true });
  }

  if (body.action === "grant_all") {
    const { game, spins, bet_value, expires_days } = body;
    if (!game || !spins) return err("Missing required fields");

    const { data: users } = await supabase.from("users").select("id");
    const inserts = (users || []).map(u => ({
      user_id: u.id,
      game,
      spins_remaining: spins,
      spins_total: spins,
      bet_value: bet_value || 1.00,
      source: "admin",
      expires_at: new Date(Date.now() + (expires_days || 7) * 86400000).toISOString(),
    }));

    if (inserts.length > 0) {
      await supabase.from("free_spins").insert(inserts);
    }

    return json({ success: true, users_count: inserts.length });
  }

  // List active free spins
  const { data: spins } = await supabase.from("free_spins")
    .select("*, users(tg_username, tg_first_name)")
    .gt("spins_remaining", 0)
    .order("created_at", { ascending: false });

  return json({ free_spins: spins || [] });
}

// ═══ ROUTE: /admin/transactions ═══
async function handleAdminTransactions(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return err("Forbidden", 403);

  const body = await req.json();
  const page = body.page || 0;
  const typeFilter = body.type || null;

  let query = supabase.from("transactions")
    .select("*, users(tg_username, tg_first_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * 50, (page + 1) * 50 - 1);

  if (typeFilter) query = query.eq("type", typeFilter);
  if (body.user_id) query = query.eq("user_id", body.user_id);

  const { data: txs, count } = await query;
  return json({ transactions: txs || [], total: count || 0, page });
}

// ═══ MAIN ROUTER ═══
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const path = url.pathname.split("/payments-admin").pop() || "/";

  try {
    switch (true) {
      case path === "/pay/create-invoice": return await handleCreateInvoice(req);
      case path === "/pay/webhook": return await handleWebhook(req);
      case path === "/pay/withdraw": return await handleWithdraw(req);
      case path === "/pay/check": return await handlePayCheck(req);
      case path === "/admin/stats": return await handleAdminStats(req);
      case path === "/admin/users": return await handleAdminUsers(req);
      case path === "/admin/promos": return await handleAdminPromos(req);
      case path === "/admin/free-spins": return await handleAdminFreeSpins(req);
      case path === "/admin/transactions": return await handleAdminTransactions(req);
      default: return err("Not found", 404);
    }
  } catch (e: any) {
    return err("Server error: " + e.message, 500);
  }
});
