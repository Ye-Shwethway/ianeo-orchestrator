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

type FaqOperationsPayload = {
  ok?: boolean;
  service?: string;
  environment?: string;
  monitoring?: { mode?: string };
  handoff?: { route?: string; staffInboxConfigured?: boolean };
  stats?: {
    users?: number;
    questions?: number;
    pendingQuestions?: number;
    activeCases?: number;
    activeStaff?: number;
    sudoAdmins?: number;
    humanControlledConversations?: number;
  };
  error?: string;
};

export class FaqAdapter implements ServiceAdapter {
  readonly id = "faq";
  private readonly baseUrl: string;
  private readonly serviceToken?: string;

  constructor(baseUrl: string, serviceToken?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.serviceToken = serviceToken;
  }

  async getCapabilities(): Promise<Capability[]> {
    const capabilities: Capability[] = [
      {
        id: "health",
        description: "Check School of Nursing FAQ Bot health",
        safety: "read",
      },
    ];

    if (this.serviceToken) {
      capabilities.push({
        id: "operations",
        description: "Read School of Nursing FAQ operational summary",
        safety: "read",
      });
    }

    return capabilities;
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

  private async operations(): Promise<ExecutionResult> {
    if (!this.serviceToken) {
      return {
        ok: false,
        message: "FAQ operations credential is not configured",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/internal/v1/status`, {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${this.serviceToken}`,
        },
      });

      const payload = (await response.json().catch(() => null)) as FaqOperationsPayload | null;
      if (!response.ok || payload?.ok !== true) {
        return {
          ok: false,
          message: `FAQ operations endpoint returned HTTP ${response.status}`,
          data: payload ?? undefined,
        };
      }

      return {
        ok: true,
        message: "FAQ operational summary loaded",
        data: payload,
      };
    } catch {
      return {
        ok: false,
        message: "FAQ operations endpoint unreachable",
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

    if (action === "operations") {
      return this.operations();
    }

    return {
      ok: false,
      message: `Unsupported FAQ action: ${action}`,
    };
  }
}
