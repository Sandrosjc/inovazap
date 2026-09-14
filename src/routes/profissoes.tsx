import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import MotorDeProfissoes from "@/components/MotorDeProfissoes";

export const Route = createFileRoute("/profissoes")({
  component: () => (
    <AppShell>
      <RequireAuth>
        <MotorDeProfissoes />
      </RequireAuth>
    </AppShell>
  ),
});
