// src/routes/api/webhooks/asaas.ts
//
// Configure esta URL (https://seudominio.com/api/webhooks/asaas) no painel
// do Asaas em Integrações > Webhooks, selecionando os eventos de pagamento
// (PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE, PAYMENT_DELETED).
//
// Se você configurar um "token de acesso" no webhook do Asaas, ele chega
// no header asaas-access-token — valide contra ASAAS_WEBHOOK_TOKEN abaixo
// antes de confiar no payload.

import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseAdmin } from "../../../server/supabaseAdmin.server";

const STATUS_MAP: Record<string, string> = {
  PAYMENT_CONFIRMED: "ativa",
  PAYMENT_RECEIVED: "ativa",
  PAYMENT_OVERDUE: "atrasada",
  PAYMENT_DELETED: "cancelada",
  SUBSCRIPTION_CANCELLED: "cancelada",
};

export const Route = createFileRoute("/api/webhooks/asaas")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
        if (expectedToken) {
          const receivedToken = request.headers.get("asaas-access-token");
          if (receivedToken !== expectedToken) {
            return new Response("Token inválido", { status: 401 });
          }
        }

        const body = await request.json();
        const evento = body?.event as string | undefined;
        const subscriptionId = body?.payment?.subscription as string | undefined;
        const novoStatus = evento ? STATUS_MAP[evento] : undefined;

        if (subscriptionId && novoStatus) {
          const admin = getSupabaseAdmin();
          await admin
            .from("assinaturas")
            .update({ status: novoStatus, updated_at: new Date().toISOString() })
            .eq("asaas_subscription_id", subscriptionId);
        }

        // Sempre responda 200 rápido, senão o Asaas reenvia o mesmo evento.
        return new Response("ok", { status: 200 });
      },
    },
  },
});
