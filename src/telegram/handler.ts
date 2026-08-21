import type { Env } from "../config/env";
import type { AdapterRegistry } from "../core/adapter-registry";
import type { Capability } from "../core/types";
import {
  answerTelegramCallback,
  deleteTelegramMessage,
  editTelegramMessage,
  sendTelegramMessage,
} from "./client";
import { cancelMenuCleanup, scheduleMenuCleanup } from "./menu-cleanup";
import {
  botsMenuKeyboard,
  faqActionConfirmationKeyboard,
  faqMenuKeyboard,
  faqResultKeyboard,
  mainMenuKeyboard,
  systemMenuKeyboard,
  systemResultKeyboard,
} from "./menu";
import type { TelegramCallbackQuery, TelegramUpdate } from "./types";

function unauthorized(): Response {
  return new Response("Unauthorized", { status: 401 });
}

function ok(): Response {
  return new Response("OK", { status: 200 });
}

async function adapterStatusLines(registry: AdapterRegistry): Promise<string[]> {
  const ids = registry.listIds();
  if (ids.length === 0) return ["Adapters: none configured"];

  return Promise.all(
    ids.map(async (id) => {
      const adapter = registry.get(id);
      if (!adapter) return `🔴 ${id}: unavailable`;
      try {
        const status = await adapter.status();
        return `${status.ok ? "🟢" : "🔴"} ${id}: ${status.summary}`;
      } catch {
        return `🔴 ${id}: status check failed`;
      }
    }),
  );
}

async function systemStatusText(registry: AdapterRegistry): Promise<string> {
  const serviceLines = await adapterStatusLines(registry);
  return [
    "🟢 IANEO Orchestrator",
    "Runtime: Cloudflare Worker",
    "Mode: owner-only bootstrap",
    "",
    ...serviceLines,
  ].join("\n");
}

async function editCallbackMessage(
  env: Env,
  callback: TelegramCallbackQuery,
  text: string,
  keyboard: ReturnType<typeof mainMenuKeyboard>,
): Promise<void> {
  if (!callback.message) return;
  await editTelegramMessage(
    env.TELEGRAM_BOT_TOKEN,
    callback.message.chat.id,
    callback.message.message_id,
    text,
    keyboard,
  );
  await scheduleMenuCleanup(env, callback.message.chat.id, callback.message.message_id);
}

async function closeCallbackMessage(env: Env, callback: TelegramCallbackQuery): Promise<void> {
  if (!callback.message) return;
  await cancelMenuCleanup(env, callback.message.chat.id, callback.message.message_id);
  await deleteTelegramMessage(
    env.TELEGRAM_BOT_TOKEN,
    callback.message.chat.id,
    callback.message.message_id,
  );
}

async function sendMenuCard(
  env: Env,
  chatId: number,
  text: string,
  keyboard: ReturnType<typeof mainMenuKeyboard>,
): Promise<void> {
  const messageId = await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, chatId, text, keyboard);
  if (messageId !== null) await scheduleMenuCleanup(env, chatId, messageId);
}

function titleize(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function flattenData(value: unknown, prefix = ""): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value !== "object") return prefix ? [`${prefix}: ${String(value)}`] : [String(value)];
  if (Array.isArray(value)) {
    return value.map((item, index) => `${prefix || "Item"} ${index + 1}: ${String(item)}`);
  }

  const lines: string[] = [];
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (key === "service") continue;
    const label = prefix ? `${prefix} · ${titleize(key)}` : titleize(key);
    if (nested !== null && typeof nested === "object") {
      lines.push(...flattenData(nested, label));
    } else if (nested !== undefined) {
      lines.push(`${label}: ${String(nested)}`);
    }
  }
  return lines;
}

function faqActionText(
  capability: Capability,
  result: { ok: boolean; message: string; data?: unknown },
): string {
  return [
    `${result.ok ? "🟢" : "🔴"} School of Nursing FAQ`,
    capability.label ?? titleize(capability.id),
    "",
    result.message,
    ...flattenData(result.data),
  ].join("\n");
}

async function faqCapabilities(registry: AdapterRegistry): Promise<Capability[]> {
  const adapter = registry.get("faq");
  if (!adapter) return [];
  try {
    return await adapter.getCapabilities();
  } catch {
    return [];
  }
}

async function openFaqMenu(
  env: Env,
  registry: AdapterRegistry,
  callback: TelegramCallbackQuery,
): Promise<void> {
  const capabilities = await faqCapabilities(registry);
  await editCallbackMessage(
    env,
    callback,
    [
      "🎓 School of Nursing FAQ",
      "",
      "Controls are discovered from the FAQ service capability registry.",
      capabilities.length ? `${capabilities.length} capabilities available.` : "No capabilities available.",
    ].join("\n"),
    faqMenuKeyboard(capabilities),
  );
}

async function runFaqAction(
  env: Env,
  registry: AdapterRegistry,
  callback: TelegramCallbackQuery,
  actionId: string,
  confirmed: boolean,
): Promise<void> {
  const adapter = registry.get("faq");
  if (!adapter) {
    await editCallbackMessage(
      env,
      callback,
      "🔴 School of Nursing FAQ\n\nAdapter is not configured.",
      faqResultKeyboard(),
    );
    return;
  }

  const capabilities = await adapter.getCapabilities();
  const capability = capabilities.find((item) => item.id === actionId);
  if (!capability) {
    await editCallbackMessage(
      env,
      callback,
      `🔴 School of Nursing FAQ\n\nUnknown capability: ${actionId}`,
      faqResultKeyboard(),
    );
    return;
  }

  if (!confirmed && (capability.requiresConfirmation || capability.safety !== "read")) {
    await editCallbackMessage(
      env,
      callback,
      [
        "⚠️ Confirm FAQ action",
        "",
        capability.label ?? capability.id,
        capability.description,
        `Safety: ${capability.safety}`,
      ].join("\n"),
      faqActionConfirmationKeyboard(actionId),
    );
    return;
  }

  const result = await adapter.execute(actionId);
  await editCallbackMessage(env, callback, faqActionText(capability, result), faqResultKeyboard());
}

async function handleCallback(
  env: Env,
  registry: AdapterRegistry,
  callback: TelegramCallbackQuery,
): Promise<void> {
  if (String(callback.from.id) !== env.TELEGRAM_OWNER_ID) {
    await answerTelegramCallback(env.TELEGRAM_BOT_TOKEN, callback.id, "Owner only");
    return;
  }

  const data = callback.data ?? "";
  await answerTelegramCallback(env.TELEGRAM_BOT_TOKEN, callback.id);

  if (data === "menu:close") {
    await closeCallbackMessage(env, callback);
    return;
  }

  if (data === "menu:main") {
    await editCallbackMessage(
      env,
      callback,
      "🤖 IANEO\n\nPersonal command center online.",
      mainMenuKeyboard(),
    );
    return;
  }

  if (data === "menu:bots") {
    await editCallbackMessage(
      env,
      callback,
      "🤖 Bots\n\nChoose a connected service.",
      botsMenuKeyboard(registry),
    );
    return;
  }

  if (data === "menu:system") {
    await editCallbackMessage(
      env,
      callback,
      "⚙️ System\n\nIANEO runtime controls and status.",
      systemMenuKeyboard(),
    );
    return;
  }

  if (data === "system:status") {
    await editCallbackMessage(
      env,
      callback,
      await systemStatusText(registry),
      systemResultKeyboard(),
    );
    return;
  }

  if (data === "bot:faq") {
    await openFaqMenu(env, registry, callback);
    return;
  }

  const actionMatch = data.match(/^bot:faq:action:([a-z0-9._-]+)$/);
  if (actionMatch) {
    await runFaqAction(env, registry, callback, actionMatch[1], false);
    return;
  }

  const confirmMatch = data.match(/^bot:faq:confirm:([a-z0-9._-]+)$/);
  if (confirmMatch) {
    await runFaqAction(env, registry, callback, confirmMatch[1], true);
  }
}

export async function handleTelegramWebhook(
  request: Request,
  env: Env,
  registry: AdapterRegistry,
): Promise<Response> {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || secret !== env.TELEGRAM_WEBHOOK_SECRET) return unauthorized();

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (update.callback_query) {
    await handleCallback(env, registry, update.callback_query);
    return ok();
  }

  const message = update.message;
  if (!message?.from || !message.text) return ok();
  if (String(message.from.id) !== env.TELEGRAM_OWNER_ID) return ok();

  const command = message.text.trim().split(/\s+/, 1)[0]?.split("@", 1)[0];

  if (command === "/start" || command === "/menu") {
    await sendMenuCard(
      env,
      message.chat.id,
      "🤖 IANEO\n\nPersonal command center online.",
      mainMenuKeyboard(),
    );
    return ok();
  }

  if (command === "/bots") {
    await sendMenuCard(
      env,
      message.chat.id,
      "🤖 Bots\n\nChoose a connected service.",
      botsMenuKeyboard(registry),
    );
    return ok();
  }

  if (command === "/status") {
    await sendMenuCard(
      env,
      message.chat.id,
      await systemStatusText(registry),
      systemResultKeyboard(),
    );
    return ok();
  }

  await sendMenuCard(
    env,
    message.chat.id,
    "Unknown command. Use /start, /bots, or /status.",
    mainMenuKeyboard(),
  );
  return ok();
}
