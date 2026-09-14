import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import PainelAfiliado from "@/components/PainelAfiliado";

export const Route = createFileRoute("/afiliados/painel")({
  component: () => (
    <AppShell>
      <RequireAuth>
        <PainelAfiliado />
      </RequireAuth>
    </AppShell>
  ),
});
