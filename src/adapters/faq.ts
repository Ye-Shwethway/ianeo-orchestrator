import type {
  Capability,
  ExecutionResult,
  HealthResult,
  ServiceAdapter,
  StatusResult,
} from "../core/types";

type FaqHealthPayload = {
  ok?: boolean;
  service?: string;
  environment?: string;
};

export class FaqAdapter implements ServiceAdapter {
  readonly id = "faq";
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async getCapabilities(): Promise<Capability[]> {
    return [
      {
        id: "health",
        description: "Check School of Nursing FAQ Bot health",
        safety: "read",
      },
    ];
  }

  async health(): Promise<HealthResult> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: { accept: "application/json" },
      });

      if (!response.ok) {
        return {
          ok: false,
          message: `FAQ health endpoint returned HTTP ${response.status}`,
        };
      }

      const payload = (await response.json()) as FaqHealthPayload;
      const ok = payload.ok === true;

      return {
        ok,
        message: ok ? "FAQ Bot healthy" : "FAQ Bot reported unhealthy",
        details: {
          service: payload.service ?? "school-of-nursing-faq-bot",
          environment: payload.environment ?? "unknown",
        },
      };
    } catch {
      return {
        ok: false,
        message: "FAQ Bot unreachable",
      };
    }
  }

  async status(): Promise<StatusResult> {
    const health = await this.health();
    return {
      ok: health.ok,
      summary: health.message ?? (health.ok ? "FAQ Bot healthy" : "FAQ Bot unavailable"),
      details: health.details,
    };
  }

  async execute(action: string): Promise<ExecutionResult> {
    if (action === "health") {
      const health = await this.health();
      return {
        ok: health.ok,
        message: health.message ?? "FAQ health check complete",
        data: health.details,
      };
    }

    return {
      ok: false,
      message: `Unsupported FAQ action: ${action}`,
    };
  }
}
