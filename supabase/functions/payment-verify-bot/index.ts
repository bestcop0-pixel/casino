// ═══════════════════════════════════════════════════
// Payment Verify Bot — скриншот → кнопки у админа → разблокировка вывода
// ═══════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOT_TOKEN            = Deno.env.get("PAYMENT_VERIFY_BOT_TOKEN")!;
const ADMIN_ID             = Deno.env.get("ADMIN_TG_ID") || "8324018832";
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DEPOSIT_ADDR = "0x0204C039DE6d13ACe6F873484D0D9A71BFBACA06";
const CASINO_BOT   = "@CasinoBoom1_bot";

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

  // ── Callback (admin нажал кнопку) ──
  if (update.callback_query) {
    const cb     = update.callback_query;
    const data   = cb.data || "";

    // ✅ Подтвердить
    if (data.startsWith("pv_ok:")) {
      const tgId    = data.split(":")[1];
      const tgIdInt = parseInt(tgId, 10);

      // Разблокируем вывод в БД — Realtime на фронте поймает
      const { error: dbErr, count } = await supabase
        .from("users")
        .update({ payment_verified: true })
        .eq("tg_id", tgIdInt);

      if (dbErr) {
        await tg("sendMessage", { chat_id: ADMIN_ID, text: `❌ DB error при подтверждении ${tgId}: ${dbErr.message}` });
      } else if (!count) {
        await tg("sendMessage", { chat_id: ADMIN_ID, text: `⚠️ Подтверждение ${tgId}: пользователь не найден в базе (0 строк обновлено).` });
      }

      // Уведомляем пользователя
      await tg("sendMessage", {
        chat_id: tgIdInt,
        text:
          `✅ *Платёж подтверждён!*\n\n` +
          `Вывод средств разблокирован.\n\n` +
          `Перейдите в казино и нажмите *Вывод* 👇`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "💸 Перейти к выводу", url: `https://t.me/${CASINO_BOT.replace("@","")}` },
          ]],
        },
      });

      await tg("editMessageReplyMarkup", {
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        reply_markup: { inline_keyboard: [] },
      });

      await tg("answerCallbackQuery", {
        callback_query_id: cb.id,
        text: "✅ Вывод разблокирован. Пользователь уведомлён.",
        show_alert: true,
      });
    }

    // ❌ Отклонить
    if (data.startsWith("pv_reject:")) {
      const tgId = data.split(":")[1];

      await tg("sendMessage", {
        chat_id: parseInt(tgId),
        text:
          `❌ *Платёж не подтверждён*\n\n` +
          `Скриншот не прошёл проверку.\n\n` +
          `Возможные причины:\n` +
          `• Неверная сеть (нужна BNB Smart Chain · BEP-20)\n` +
          `• Адрес получателя не совпадает\n` +
          `• Сумма меньше $10\n\n` +
          `Адрес для оплаты:\n\`${DEPOSIT_ADDR}\`\n\n` +
          `Исправьте и отправьте новый скриншот.`,
        parse_mode: "Markdown",
      });

      await tg("editMessageReplyMarkup", {
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        reply_markup: { inline_keyboard: [] },
      });

      await tg("answerCallbackQuery", {
        callback_query_id: cb.id,
        text: "❌ Отклонено. Пользователь уведомлён.",
        show_alert: true,
      });
    }

    return json({ ok: true });
  }

  const msg = update.message;
  if (!msg) return json({ ok: true });

  const chatId   = msg.chat.id;
  const tgId     = msg.from?.id;
  const name     = msg.from?.first_name || "Игрок";
  const username = msg.from?.username ? `@${msg.from.username}` : "без username";
  const text     = (msg.text || "").trim();

  // Сохраняем последний msg_id пользователя
  async function saveMsgId(userTgId: number, sentMsgId: number) {
    await supabase.from("users").update({ pv_last_msg_id: sentMsgId }).eq("tg_id", userTgId);
  }

  // ── Фото (скриншот оплаты) ──
  if (msg.photo) {
    const fileId = msg.photo[msg.photo.length - 1].file_id;

    // Подтверждение пользователю
    const sent = await tg("sendMessage", {
      chat_id: chatId,
      text:
        `📨 *Скриншот получен!*\n\n` +
        `Проверяем оплату вручную — обычно до *15 минут*.\n\n` +
        `Как только платёж подтвердят, кнопка вывода в казино станет активной.`,
      parse_mode: "Markdown",
    });
    if (sent?.result?.message_id) await saveMsgId(tgId, sent.result.message_id);

    // Скриншот + кнопки админу
    await tg("sendPhoto", {
      chat_id: ADMIN_ID,
      photo: fileId,
      caption:
        `🧾 *Скриншот оплаты $10*\n\n` +
        `👤 ${name} (${username})\n` +
        `🆔 TG ID: \`${tgId}\`\n\n` +
        `Подтвердить и разблокировать вывод?`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[
          { text: "✅ Подтвердить",  callback_data: `pv_ok:${tgId}` },
          { text: "❌ Отклонить",   callback_data: `pv_reject:${tgId}` },
        ]],
      },
    });

    return json({ ok: true });
  }

  // ── /clear {tg_id} (только для админа) ──
  if (text.startsWith("/clear") && chatId.toString() === ADMIN_ID) {
    const parts  = text.split(/\s+/);
    const target = parts[1] ? parseInt(parts[1]) : null;
    if (!target) {
      await tg("sendMessage", { chat_id: chatId, text: "📌 /clear {tg_id}" });
      return json({ ok: true });
    }
    const { data: u } = await supabase.from("users").select("pv_last_msg_id").eq("tg_id", target).single();
    const lastId = u?.pv_last_msg_id;
    if (!lastId) {
      await tg("sendMessage", { chat_id: chatId, text: `⚠️ Нет сохранённых сообщений для ${target}.` });
      return json({ ok: true });
    }
    const del = [];
    for (let i = lastId; i > Math.max(1, lastId - 150); i--) {
      del.push(tg("deleteMessage", { chat_id: target, message_id: i }));
    }
    await Promise.allSettled(del);
    await tg("sendMessage", { chat_id: chatId, text: `✅ Чат с ${target} очищен.` });
    return json({ ok: true });
  }

  // ── /start ──
  if (text === "/start" || text.startsWith("/start ")) {
    await tg("sendMessage", {
      chat_id: chatId,
      text:
        `👋 *Верификация платежа — Sphere Casino*\n\n` +
        `Для разблокировки вывода:\n\n` +
        `1️⃣ Переведи *$10 USDT (BEP-20)* на адрес:\n` +
        `\`${DEPOSIT_ADDR}\`\n\n` +
        `2️⃣ Сделай скриншот транзакции\n\n` +
        `3️⃣ Отправь скриншот сюда 📸\n\n` +
        `После подтверждения кнопка вывода в казино разблокируется автоматически ✅`,
      parse_mode: "Markdown",
    });
    return json({ ok: true });
  }

  // Любой другой текст
  await tg("sendMessage", {
    chat_id: chatId,
    text: `📸 Отправь *скриншот транзакции* — просто фото в этот чат.\n\nАдрес для оплаты $10 USDT (BEP-20):\n\`${DEPOSIT_ADDR}\``,
    parse_mode: "Markdown",
  });

  return json({ ok: true });
}

async function setWebhook() {
  const result = await tg("setWebhook", {
    url: `${SUPABASE_URL}/functions/v1/payment-verify-bot/webhook`,
    allowed_updates: ["message", "callback_query"],
  });
  await tg("setMyCommands", {
    commands: [{ command: "start", description: "Верификация платежа $10" }],
  });
  return json({ ok: true, result });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const path = new URL(req.url).pathname.split("/payment-verify-bot").pop() || "/";
  try {
    if (path === "/webhook")     return await handleWebhook(req);
    if (path === "/set-webhook") return await setWebhook(req);
    return json({ error: "Not found" }, 404);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
});
