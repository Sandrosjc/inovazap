import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import ProgramaAfiliados from "@/components/ProgramaAfiliados";

export const Route = createFileRoute("/afiliados/")({
  component: () => (
    <AppShell>
      <ProgramaAfiliados />
    </AppShell>
  ),
});
