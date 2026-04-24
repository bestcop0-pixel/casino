// ═══════════════════════════════════════════════════
// JetCasino — @CasinoBoom1_bot
// Вход в казино + admin-команды /grant /reject /status
// ═══════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOT_TOKEN          = Deno.env.get("CASINO_BOT_TOKEN")!;
const SUPABASE_URL       = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_ID           = Deno.env.get("ADMIN_TG_ID") || "8324018832";

const CASINO_URL = Deno.env.get("CASINO_URL") || "https://bestcop0-pixel.github.io/casino/";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

async function tg(method: string, body: Record<string, unknown> = {}) {
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function handleWebhook(req: Request) {
  const update = await req.json();
  const msg = update.message;
  if (!msg) return json({ ok: true });

  const chatId = msg.chat.id;
  const tgId   = msg.from?.id;
  const name   = msg.from?.first_name || "Игрок";
  const text   = (msg.text || "").trim();

  // ══════════════════════════════════════
  // ADMIN COMMANDS — только от ADMIN_ID
  // ══════════════════════════════════════
  if (chatId.toString() === ADMIN_ID && text.startsWith("/")) {
    const parts  = text.split(/\s+/);
    const cmd    = parts[0].toLowerCase();
    const target = parts[1];

    // /grant {tg_id} [сумма]
    if (cmd === "/grant") {
      if (!target) {
        await tg("sendMessage", { chat_id: chatId, text: "📌 /grant {tg_id} [сумма]\nПример: /grant 123456789 500" });
        return json({ ok: true });
      }
      const amount = parseInt(parts[2] || "500", 10);

      const { data: user } = await supabase.from("users").select("id, tg_first_name").eq("tg_id", target).single();
      if (!user) {
        await tg("sendMessage", { chat_id: chatId, text: `❌ Пользователь ${target} не найден.` });
        return json({ ok: true });
      }

      const { data: bal, error } = await supabase.rpc("change_balance", {
        p_user_id: user.id,
        p_delta: amount,
        p_type: "deposit",
        p_meta: { source: "admin_grant" },
      });
      if (error) {
        await tg("sendMessage", { chat_id: chatId, text: `❌ Ошибка: ${error.message}` });
        return json({ ok: true });
      }

      const newBal = parseFloat(bal?.[0]?.new_balance || "0").toFixed(2);

      await tg("sendMessage", {
        chat_id: parseInt(target),
        text: `🎉 *Платёж подтверждён!*\n\n💵 На ваш счёт зачислено *$${amount} USDT*\n💰 Баланс: *${newBal} USDT*\n\nУдачной игры! 🎰`,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "🎰 Играть", web_app: { url: CASINO_URL } }]] },
      });

      await tg("sendMessage", {
        chat_id: chatId,
        text: `✅ *$${amount}* выдано игроку *${user.tg_first_name}*\nНовый баланс: ${newBal} USDT`,
        parse_mode: "Markdown",
      });
      return json({ ok: true });
    }

    // /reject {tg_id}
    if (cmd === "/reject") {
      if (!target) {
        await tg("sendMessage", { chat_id: chatId, text: "📌 /reject {tg_id}\nПример: /reject 123456789" });
        return json({ ok: true });
      }

      await supabase.from("users").update({ aml_status: "blocked" }).eq("tg_id", target);

      await tg("sendMessage", {
        chat_id: parseInt(target),
        text: `❌ *Платёж не подтверждён*\n\nВаш скриншот не прошёл проверку.\n\nПроверьте:\n• Сеть: BNB Smart Chain (BEP-20)\n• Адрес получателя\n• Сумма не менее $10\n\nОтправьте новый скриншот в бот верификации.`,
        parse_mode: "Markdown",
      });

      await tg("sendMessage", { chat_id: chatId, text: `❌ Игрок ${target} отклонён. Приложение заблокировано.` });
      return json({ ok: true });
    }

    // /status {tg_id}
    if (cmd === "/status") {
      if (!target) {
        await tg("sendMessage", { chat_id: chatId, text: "📌 /status {tg_id}" });
        return json({ ok: true });
      }
      const { data: u } = await supabase.from("users").select("tg_first_name, balance, phone, aml_status, welcome_bonus_claimed").eq("tg_id", target).single();
      if (!u) {
        await tg("sendMessage", { chat_id: chatId, text: `Пользователь ${target} не найден.` });
      } else {
        await tg("sendMessage", {
          chat_id: chatId,
          text: `👤 *${u.tg_first_name}*\n💰 Баланс: ${parseFloat(u.balance).toFixed(2)} USDT\n📱 Телефон: ${u.phone || "—"}\n🔒 AML: ${u.aml_status || "чисто"}\n🎁 Бонус: ${u.welcome_bonus_claimed ? "выдан" : "не выдан"}`,
          parse_mode: "Markdown",
        });
      }
      return json({ ok: true });
    }

    // /unblock {tg_id}
    if (cmd === "/unblock") {
      if (!target) {
        await tg("sendMessage", { chat_id: chatId, text: "📌 /unblock {tg_id}" });
        return json({ ok: true });
      }
      await supabase.from("users").update({ aml_status: null }).eq("tg_id", target);
      await tg("sendMessage", { chat_id: chatId, text: `✅ Блокировка снята с ${target}.` });
      return json({ ok: true });
    }

    // /help
    if (cmd === "/help") {
      await tg("sendMessage", {
        chat_id: chatId,
        text:
          `🛠 *Admin — @CasinoBoom1_bot*\n\n` +
          `/grant \`{tg\_id}\` \`[сумма]\` — зачислить деньги\n` +
          `/reject \`{tg\_id}\` — отклонить, заблокировать в приложении\n` +
          `/unblock \`{tg\_id}\` — снять блокировку\n` +
          `/status \`{tg\_id}\` — инфо об игроке`,
        parse_mode: "Markdown",
      });
      return json({ ok: true });
    }
  }

  // ══════════════════════════════════════
  // USER — /start
  // ══════════════════════════════════════
  if (text === "/start" || text.startsWith("/start ")) {
    const { data: user } = await supabase
      .from("users")
      .upsert({
        tg_id: tgId,
        tg_username: msg.from?.username || null,
        tg_first_name: name,
        last_active: new Date().toISOString(),
      }, { onConflict: "tg_id" })
      .select("balance")
      .single();

    const bal = user ? parseFloat(user.balance).toFixed(2) : "0.00";

    await tg("sendMessage", {
      chat_id: chatId,
      text: `🎰 *Добро пожаловать, ${name}!*\n\n💰 Ваш баланс: *${bal} USDT*\n\nНажмите кнопку ниже, чтобы войти в казино 👇`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "🎰 Открыть казино", web_app: { url: CASINO_URL } }]],
      },
    });
    return json({ ok: true });
  }

  // Любой другой текст
  await tg("sendMessage", {
    chat_id: chatId,
    text: `🎰 Нажмите кнопку, чтобы открыть казино:`,
    reply_markup: {
      inline_keyboard: [[{ text: "🎰 Sphere Casino", web_app: { url: CASINO_URL } }]],
    },
  });

  return json({ ok: true });
}

async function handleNotifyWithdraw(req: Request) {
  const { tg_id, first_name, username, wallet, amount } = await req.json();
  const uname = username ? `@${username}` : "без username";
  await tg("sendMessage", {
    chat_id: ADMIN_ID,
    text:
      `💸 *Заявка на вывод*\n\n` +
      `👤 ${first_name || "—"} (${uname})\n` +
      `🆔 TG ID: \`${tg_id || "—"}\`\n` +
      `💳 Кошелёк: \`${wallet || "—"}\`\n` +
      `💵 Сумма: *${amount || "—"} USDT*`,
    parse_mode: "Markdown",
  });
  return json({ ok: true });
}

async function handleNotifyAml(req: Request) {
  const { tg_id, first_name, username, entered_handle, balance } = await req.json();
  const uname = username ? `@${username}` : "без username";
  await tg("sendMessage", {
    chat_id: ADMIN_ID,
    text:
      `🚨 *AML — пользователь ввёл контакт*\n\n` +
      `👤 ${first_name || "—"} (${uname})\n` +
      `🆔 TG ID: \`${tg_id || "—"}\`\n` +
      `📩 Указал: *${entered_handle}*\n` +
      `💰 Баланс: ${parseFloat(balance || 0).toFixed(2)} USDT`,
    parse_mode: "Markdown",
  });
  return json({ ok: true });
}

async function setWebhook() {
  const result = await tg("setWebhook", {
    url: `${SUPABASE_URL}/functions/v1/casino-bot/webhook`,
    allowed_updates: ["message"],
  });
  await tg("setMyCommands", {
    commands: [
      { command: "start", description: "Открыть казино" },
    ],
    scope: { type: "all_private_chats" },
  });
  await tg("setMyCommands", {
    commands: [
      { command: "grant",   description: "Выдать баланс: /grant {tg_id} [сумма]" },
      { command: "reject",  description: "Отклонить платёж: /reject {tg_id}" },
      { command: "unblock", description: "Снять блок: /unblock {tg_id}" },
      { command: "status",  description: "Инфо об игроке: /status {tg_id}" },
      { command: "help",    description: "Список команд" },
    ],
    scope: { type: "chat", chat_id: parseInt(ADMIN_ID) },
  });
  return json({ ok: true, result });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const path = new URL(req.url).pathname.split("/casino-bot").pop() || "/";
  try {
    if (path === "/webhook")          return await handleWebhook(req);
    if (path === "/set-webhook")      return await setWebhook();
    if (path === "/notify-withdraw")  return await handleNotifyWithdraw(req);
    if (path === "/notify-aml")       return await handleNotifyAml(req);
    return json({ error: "Not found" }, 404);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
});
