import type { ServiceAdapter } from "./types";

export class AdapterRegistry {
  private readonly adapters = new Map<string, ServiceAdapter>();

  constructor(adapters: ServiceAdapter[] = []) {
    for (const adapter of adapters) {
      this.register(adapter);
    }
  }

  register(adapter: ServiceAdapter): void {
    if (this.adapters.has(adapter.id)) {
      throw new Error(`Adapter already registered: ${adapter.id}`);
    }

    this.adapters.set(adapter.id, adapter);
  }

  get(id: string): ServiceAdapter | undefined {
    return this.adapters.get(id);
  }

  listIds(): string[] {
    return [...this.adapters.keys()].sort();
  }
}
