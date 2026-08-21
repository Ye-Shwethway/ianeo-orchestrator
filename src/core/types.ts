export interface Capability {
  id: string;
  description: string;
  safety: "read" | "write" | "sensitive";
  label?: string;
  requiresConfirmation?: boolean;
}

export interface HealthResult {
  ok: boolean;
  message?: string;
  details?: Record<string, unknown>;
}

export interface StatusResult {
  ok: boolean;
  summary: string;
  details?: Record<string, unknown>;
}

export interface ExecutionResult {
  ok: boolean;
  message: string;
  data?: unknown;
}

export interface ServiceAdapter {
  readonly id: string;
  getCapabilities(): Promise<Capability[]>;
  health(): Promise<HealthResult>;
  status(): Promise<StatusResult>;
  execute(
    action: string,
    params?: Record<string, unknown>,
  ): Promise<ExecutionResult>;
}
