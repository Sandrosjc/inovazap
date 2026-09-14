import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import PlanosComerciais from "@/components/PlanosComerciais";

export const Route = createFileRoute("/planos")({
  component: () => (
    <AppShell>
      <PlanosComerciais />
    </AppShell>
  ),
});
