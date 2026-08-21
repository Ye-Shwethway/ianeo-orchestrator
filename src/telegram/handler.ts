import type { Env } from "../config/env";
import type { AdapterRegistry } from "../core/adapter-registry";
import {
  answerTelegramCallback,
  deleteTelegramMessage,
  editTelegramMessage,
  sendTelegramMessage,
} from "./client";
import {
  botsMenuKeyboard,
  faqMenuKeyboard,
  mainMenuKeyboard,
  systemMenuKeyboard,
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
}

async function closeCallbackMessage(
  env: Env,
  callback: TelegramCallbackQuery,
): Promise<void> {
  if (!callback.message) return;
  await deleteTelegramMessage(
    env.TELEGRAM_BOT_TOKEN,
    callback.message.chat.id,
    callback.message.message_id,
  );
}

async function sendResultAndClose(
  env: Env,
  callback: TelegramCallbackQuery,
  text: string,
): Promise<void> {
  if (!callback.message) return;
  await sendTelegramMessage(
    env.TELEGRAM_BOT_TOKEN,
    callback.message.chat.id,
    text,
  );
  await closeCallbackMessage(env, callback);
}

function executionEnvironment(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const environment = (data as Record<string, unknown>).environment;
  return typeof environment === "string" ? environment : null;
}

function faqOperationsText(ok: boolean, message: string, data: unknown): string {
  if (!ok || !data || typeof data !== "object") {
    return [`🔴 School of Nursing FAQ`, "", message].join("\n");
  }

  const payload = data as Record<string, unknown>;
  const monitoring = payload.monitoring as Record<string, unknown> | undefined;
  const handoff = payload.handoff as Record<string, unknown> | undefined;
  const stats = payload.stats as Record<string, unknown> | undefined;

  const value = (key: string) => {
    const raw = stats?.[key];
    return typeof raw === "number" ? String(raw) : "—";
  };

  return [
    "📊 School of Nursing FAQ",
    "Operational Summary",
    "",
    `Environment: ${typeof payload.environment === "string" ? payload.environment : "unknown"}`,
    `Monitoring: ${typeof monitoring?.mode === "string" ? monitoring.mode : "unknown"}`,
    `Handoff: ${typeof handoff?.route === "string" ? handoff.route : "unknown"}`,
    `Staff Inbox: ${handoff?.staffInboxConfigured === true ? "configured" : "not configured"}`,
    "",
    `Users: ${value("users")}`,
    `Questions: ${value("questions")}`,
    `Pending questions: ${value("pendingQuestions")}`,
    `Active cases: ${value("activeCases")}`,
    `Active staff: ${value("activeStaff")}`,
    `Sudo Admins: ${value("sudoAdmins")}`,
    `Human-controlled conversations: ${value("humanControlledConversations")}`,
  ].join("\n");
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
    await sendResultAndClose(env, callback, await systemStatusText(registry));
    return;
  }

  if (data === "bot:faq") {
    await editCallbackMessage(
      env,
      callback,
      "🎓 School of Nursing FAQ\n\nConnected through direct HTTPS.\nAvailable controls: health + read-only operations.",
      faqMenuKeyboard(),
    );
    return;
  }

  const adapter = registry.get("faq");

  if (data === "bot:faq:health") {
    if (!adapter) {
      await sendResultAndClose(
        env,
        callback,
        "🔴 School of Nursing FAQ\n\nAdapter is not configured.",
      );
      return;
    }

    const result = await adapter.execute("health");
    const environment = executionEnvironment(result.data);
    await sendResultAndClose(
      env,
      callback,
      [
        `${result.ok ? "🟢" : "🔴"} School of Nursing FAQ`,
        "",
        result.message,
        environment ? `Environment: ${environment}` : null,
      ].filter(Boolean).join("\n"),
    );
    return;
  }

  if (data === "bot:faq:operations") {
    if (!adapter) {
      await sendResultAndClose(
        env,
        callback,
        "🔴 School of Nursing FAQ\n\nAdapter is not configured.",
      );
      return;
    }

    const result = await adapter.execute("operations");
    await sendResultAndClose(
      env,
      callback,
      faqOperationsText(result.ok, result.message, result.data),
    );
  }
}

export async function handleTelegramWebhook(
  request: Request,
  env: Env,
  registry: AdapterRegistry,
): Promise<Response> {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || secret !== env.TELEGRAM_WEBHOOK_SECRET) {
    return unauthorized();
  }

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
  if (!message?.from || !message.text) {
    return ok();
  }

  if (String(message.from.id) !== env.TELEGRAM_OWNER_ID) {
    return ok();
  }

  const command = message.text.trim().split(/\s+/, 1)[0]?.split("@", 1)[0];

  if (command === "/start" || command === "/menu") {
    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      message.chat.id,
      "🤖 IANEO\n\nPersonal command center online.",
      mainMenuKeyboard(),
    );
    return ok();
  }

  if (command === "/bots") {
    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      message.chat.id,
      "🤖 Bots\n\nChoose a connected service.",
      botsMenuKeyboard(registry),
    );
    return ok();
  }

  if (command === "/status") {
    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      message.chat.id,
      await systemStatusText(registry),
      systemMenuKeyboard(),
    );
    return ok();
  }

  await sendTelegramMessage(
    env.TELEGRAM_BOT_TOKEN,
    message.chat.id,
    "Unknown command. Use /start, /bots, or /status.",
    mainMenuKeyboard(),
  );

  return ok();
}
