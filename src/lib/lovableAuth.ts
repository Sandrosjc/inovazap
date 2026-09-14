import { createLovableAuth } from "@lovable.dev/cloud-auth-js";

// Instância única do broker de OAuth do Lovable Cloud.
// Providers suportados hoje: "google" | "apple" | "microsoft" | "lovable"
export const lovableAuth = createLovableAuth();
