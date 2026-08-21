import { FaqAdapter } from "./adapters/faq";
import type { Env } from "./config/env";
import { AdapterRegistry } from "./core/adapter-registry";
import type { ServiceAdapter } from "./core/types";
import { handleTelegramWebhook } from "./telegram/handler";

function buildRegistry(env: Env): AdapterRegistry {
  const adapters: ServiceAdapter[] = [];

  if (env.FAQ_SERVICE_URL) {
    adapters.push(new FaqAdapter(env.FAQ_SERVICE_URL));
  }

  return new AdapterRegistry(adapters);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const registry = buildRegistry(env);

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
