import type {
  Capability,
  CapabilityInput,
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

type RemoteCapabilityPayload = {
  id?: string;
  label?: string;
  description?: string;
  safety?: "read" | "write" | "sensitive";
  requiresConfirmation?: boolean;
  input?: CapabilityInput;
};

type RemoteCapabilitiesResponse = {
  ok?: boolean;
  capabilities?: RemoteCapabilityPayload[];
};

type RemoteActionResponse = {
  ok?: boolean;
  action?: string;
  safety?: string;
  data?: unknown;
  error?: string;
};

function validChoiceInput(input: unknown): input is CapabilityInput {
  if (!input || typeof input !== "object") return false;
  const candidate = input as CapabilityInput;
  return typeof candidate.name === "string" &&
    typeof candidate.label === "string" &&
    candidate.type === "choice" &&
    Array.isArray(candidate.choices) &&
    candidate.choices.every((choice) =>
      typeof choice?.value === "string" && typeof choice?.label === "string"
    );
}

export class FaqAdapter implements ServiceAdapter {
  readonly id = "faq";
  private readonly baseUrl: string;
  private readonly serviceToken?: string;

  constructor(baseUrl: string, serviceToken?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.serviceToken = serviceToken;
  }

  private authHeaders(): Record<string, string> {
    return {
      accept: "application/json",
      ...(this.serviceToken ? { authorization: `Bearer ${this.serviceToken}` } : {}),
    };
  }

  async getCapabilities(): Promise<Capability[]> {
    const capabilities: Capability[] = [
      {
        id: "health",
        label: "Health",
        description: "Check School of Nursing FAQ Bot health",
        safety: "read",
        requiresConfirmation: false,
      },
    ];

    if (!this.serviceToken) return capabilities;

    try {
      const response = await fetch(`${this.baseUrl}/internal/v1/capabilities`, {
        method: "GET",
        headers: this.authHeaders(),
      });
      const payload = (await response.json().catch(() => null)) as RemoteCapabilitiesResponse | null;
      if (!response.ok || payload?.ok !== true || !Array.isArray(payload.capabilities)) {
        throw new Error("capability discovery failed");
      }

      for (const remote of payload.capabilities) {
        if (!remote.id || !remote.description || !remote.safety) continue;
        capabilities.push({
          id: remote.id,
          label: remote.label ?? remote.id,
          description: remote.description,
          safety: remote.safety,
          requiresConfirmation: remote.requiresConfirmation === true,
          ...(validChoiceInput(remote.input) ? { input: remote.input } : {}),
        });
      }
      return capabilities;
    } catch {
      capabilities.push({
        id: "operations.status",
        label: "Operational Summary",
        description: "Read School of Nursing FAQ operational summary",
        safety: "read",
        requiresConfirmation: false,
      });
      return capabilities;
    }
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
      return { ok: false, message: "FAQ Bot unreachable" };
    }
  }

  private async remoteAction(
    action: string,
    params?: Record<string, unknown>,
  ): Promise<ExecutionResult> {
    if (!this.serviceToken) {
      return { ok: false, message: "FAQ operations credential is not configured" };
    }

    const confirmed = params?.__confirmed === true;
    const actionParams = { ...(params ?? {}) };
    delete actionParams.__confirmed;

    try {
      const response = await fetch(
        `${this.baseUrl}/internal/v1/actions/${encodeURIComponent(action)}`,
        {
          method: "POST",
          headers: {
            ...this.authHeaders(),
            "content-type": "application/json",
          },
          body: JSON.stringify({ confirmed, params: actionParams }),
        },
      );
      const payload = (await response.json().catch(() => null)) as RemoteActionResponse | null;
      if (!response.ok || payload?.ok !== true) {
        return {
          ok: false,
          message: payload?.error
            ? `FAQ action blocked: ${payload.error}`
            : `FAQ action ${action} returned HTTP ${response.status}`,
          data: payload ?? undefined,
        };
      }
      return {
        ok: true,
        message: `${action} completed`,
        data: payload.data,
      };
    } catch {
      return { ok: false, message: `FAQ action ${action} is unreachable` };
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

  async execute(
    action: string,
    params?: Record<string, unknown>,
  ): Promise<ExecutionResult> {
    if (action === "health") {
      const health = await this.health();
      return {
        ok: health.ok,
        message: health.message ?? "FAQ health check complete",
        data: health.details,
      };
    }

    // Backwards compatibility with the first static Operations button.
    if (action === "operations") action = "operations.status";
    return this.remoteAction(action, params);
  }
}
