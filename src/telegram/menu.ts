import type { AdapterRegistry } from "../core/adapter-registry";
import type { TelegramInlineKeyboard } from "./client";

const BOT_LABELS: Record<string, string> = {
  faq: "🎓 School of Nursing FAQ",
};

const closeRow = [{ text: "✕ Close", callback_data: "menu:close" }];

export function mainMenuKeyboard(): TelegramInlineKeyboard {
  return {
    inline_keyboard: [
      [{ text: "🤖 Bots", callback_data: "menu:bots" }],
      [{ text: "⚙️ System", callback_data: "menu:system" }],
      closeRow,
    ],
  };
}

export function botsMenuKeyboard(registry: AdapterRegistry): TelegramInlineKeyboard {
  const rows = registry.listIds().map((id) => [
    { text: BOT_LABELS[id] ?? `🤖 ${id}`, callback_data: `bot:${id}` },
  ]);

  rows.push([{ text: "⬅️ Main Menu", callback_data: "menu:main" }]);
  rows.push(closeRow);
  return { inline_keyboard: rows };
}

export function faqMenuKeyboard(): TelegramInlineKeyboard {
  return {
    inline_keyboard: [
      [{ text: "🩺 Health", callback_data: "bot:faq:health" }],
      [{ text: "⬅️ Bots", callback_data: "menu:bots" }],
      closeRow,
    ],
  };
}

export function systemMenuKeyboard(): TelegramInlineKeyboard {
  return {
    inline_keyboard: [
      [{ text: "📊 Status", callback_data: "system:status" }],
      [{ text: "⬅️ Main Menu", callback_data: "menu:main" }],
      closeRow,
    ],
  };
}
