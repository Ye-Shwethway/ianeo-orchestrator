import type { Env } from "../config/env";
import type { AdapterRegistry } from "../core/adapter-registry";
import { sendTelegramMessage } from "./client";
import type { TelegramUpdate } from "./types";

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

  const message = update.message;
  if (!message?.from || !message.text) {
    return ok();
  }

  if (String(message.from.id) !== env.TELEGRAM_OWNER_ID) {
    return ok();
  }

  const command = message.text.trim().split(/\s+/, 1)[0]?.split("@", 1)[0];

  if (command === "/start") {
    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      message.chat.id,
      [
        "🤖 IANEO",
        "",
        "Personal command center online.",
        "",
        "Available now:",
        "• /status — Orchestrator and service health",
      ].join("\n"),
    );
    return ok();
  }

  if (command === "/status") {
    const serviceLines = await adapterStatusLines(registry);

    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      message.chat.id,
      [
        "🟢 IANEO Orchestrator",
        "Runtime: Cloudflare Worker",
        "Mode: owner-only bootstrap",
        "",
        ...serviceLines,
      ].join("\n"),
    );
    return ok();
  }

  await sendTelegramMessage(
    env.TELEGRAM_BOT_TOKEN,
    message.chat.id,
    "Unknown command. Use /start or /status.",
  );

  return ok();
}
