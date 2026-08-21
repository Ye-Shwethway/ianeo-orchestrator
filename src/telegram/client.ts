export type TelegramInlineKeyboard = {
  inline_keyboard: Array<Array<{ text: string; callback_data: string }>>;
};

type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

async function telegramApi<T>(
  botToken: string,
  method: string,
  body: Record<string, unknown>,
): Promise<T | undefined> {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/${method}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  const payload = (await response.json().catch(() => null)) as TelegramApiResponse<T> | null;
  if (!response.ok || payload?.ok !== true) {
    throw new Error(`Telegram ${method} failed: ${payload?.description ?? response.status}`);
  }

  return payload.result;
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  replyMarkup?: TelegramInlineKeyboard,
): Promise<number | null> {
  const result = await telegramApi<{ message_id?: number }>(botToken, "sendMessage", {
    chat_id: chatId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
  const messageId = result?.message_id;
  return typeof messageId === "number" && Number.isSafeInteger(messageId) ? messageId : null;
}

export async function editTelegramMessage(
  botToken: string,
  chatId: number,
  messageId: number,
  text: string,
  replyMarkup?: TelegramInlineKeyboard,
): Promise<void> {
  await telegramApi(botToken, "editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

export async function deleteTelegramMessage(
  botToken: string,
  chatId: number,
  messageId: number,
): Promise<void> {
  await telegramApi(botToken, "deleteMessage", {
    chat_id: chatId,
    message_id: messageId,
  });
}

export async function answerTelegramCallback(
  botToken: string,
  callbackQueryId: string,
  text?: string,
): Promise<void> {
  await telegramApi(botToken, "answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
  });
}
