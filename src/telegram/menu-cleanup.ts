import type { Env } from "../config/env";

const MENU_TTL_MS = 5 * 60 * 1000;

type MenuTarget = {
  chatId: number;
  messageId: number;
};

export class MenuCleanup {
  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Env,
  ) {}

  async fetch(request: Request): Promise<Response> {
    if (request.method === "POST") {
      const target = (await request.json()) as MenuTarget;
      await this.state.storage.put("target", target);
      await this.state.storage.setAlarm(Date.now() + MENU_TTL_MS);
      return new Response("scheduled");
    }

    if (request.method === "DELETE") {
      await this.state.storage.deleteAlarm();
      await this.state.storage.delete("target");
      return new Response("cancelled");
    }

    return new Response("Method not allowed", { status: 405 });
  }

  async alarm(): Promise<void> {
    const target = await this.state.storage.get<MenuTarget>("target");
    if (!target) return;

    try {
      await fetch(`https://api.telegram.org/bot${this.env.TELEGRAM_BOT_TOKEN}/deleteMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: target.chatId,
          message_id: target.messageId,
        }),
      });
    } finally {
      await this.state.storage.delete("target");
    }
  }
}

function stubFor(env: Env, chatId: number, messageId: number): DurableObjectStub {
  const id = env.MENU_CLEANUP.idFromName(`${chatId}:${messageId}`);
  return env.MENU_CLEANUP.get(id);
}

export async function scheduleMenuCleanup(
  env: Env,
  chatId: number,
  messageId: number,
): Promise<void> {
  try {
    await stubFor(env, chatId, messageId).fetch("https://menu-cleanup/schedule", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chatId, messageId }),
    });
  } catch {
    // Cleanup scheduling must never block Telegram interaction handling.
  }
}

export async function cancelMenuCleanup(
  env: Env,
  chatId: number,
  messageId: number,
): Promise<void> {
  try {
    await stubFor(env, chatId, messageId).fetch("https://menu-cleanup/cancel", {
      method: "DELETE",
    });
  } catch {
    // Manual close still succeeds even if alarm cancellation fails.
  }
}
