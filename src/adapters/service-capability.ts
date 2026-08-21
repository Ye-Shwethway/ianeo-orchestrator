export type RemoteServiceCapability = {
  id: string;
  label: string;
  description?: string;
  safety: "read" | "write" | "sensitive";
  requiresConfirmation: boolean;
};
