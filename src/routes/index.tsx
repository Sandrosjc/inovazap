import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import InovaZapDashboard from "@/components/InovaZapDashboard";

export const Route = createFileRoute("/")({
  component: () => (
    <AppShell>
      <InovaZapDashboard />
    </AppShell>
  ),
});
