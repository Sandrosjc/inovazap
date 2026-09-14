import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import ConfiguracaoEmpresa from "@/components/ConfiguracaoEmpresa";

export const Route = createFileRoute("/configuracao")({
  component: () => (
    <AppShell>
      <RequireAuth>
        <ConfiguracaoEmpresa />
      </RequireAuth>
    </AppShell>
  ),
});
