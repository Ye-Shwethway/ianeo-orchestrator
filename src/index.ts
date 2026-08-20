import type { Env } from "./config/env";
import { AdapterRegistry } from "./core/adapter-registry";
import { handleTelegramWebhook } from "./telegram/handler";

const registry = new AdapterRegistry();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        ok: true,
        service: "ianeo-orchestrator",
        version: "0.1.0",
        adapters: registry.listIds(),
      });
    }

    if (request.method === "POST" && url.pathname === "/telegram/webhook") {
      return handleTelegramWebhook(request, env, registry);
    }

    return json({ ok: false, error: "Not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
