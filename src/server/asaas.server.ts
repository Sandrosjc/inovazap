import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdmin } from "./supabaseAdmin.server";

// Base da API do Asaas: use sandbox enquanto testa, troque para produção
// depois. Configure ASAAS_ENV=production no .env quando for cobrar de verdade.
const ASAAS_BASE_URL =
  process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3";

const PLAN_VALUES: Record<string, Record<"monthly" | "quarterly" | "yearly", number>> = {
  essencial: { monthly: 47, quarterly: 126.9, yearly: 470 },
  profissional: { monthly: 97, quarterly: 261.9, yearly: 970 },
};

const CYCLE_TO_ASAAS: Record<"monthly" | "quarterly" | "yearly", string> = {
  monthly: "MONTHLY",
  quarterly: "QUARTERLY",
  yearly: "YEARLY",
};

type CriarAssinaturaInput = {
  accessToken: string; // token de sessão do supabase.auth.getSession() no cliente
  empresaId: string;
  plano: "essencial" | "profissional";
  ciclo: "monthly" | "quarterly" | "yearly";
  nomeCompleto: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
};

async function asaasFetch(path: string, options: RequestInit) {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    throw new Error("Falta ASAAS_API_KEY no .env do servidor");
  }
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.errors?.[0]?.description || "Erro ao chamar a API do Asaas");
  }
  return data;
}

export const criarAssinaturaAsaas = createServerFn({ method: "POST" })
  .validator((data: CriarAssinaturaInput) => data)
  .handler(async ({ data }) => {
    const admin = getSupabaseAdmin();

    // 1. Confirma quem é o usuário a partir do token enviado pelo cliente
    const { data: userData, error: userError } = await admin.auth.getUser(data.accessToken);
    if (userError || !userData.user) {
      throw new Error("Sessão inválida. Faça login novamente.");
    }

    // 2. Confirma que a empresa pertence a esse usuário
    const { data: empresa, error: empresaError } = await admin
      .from("empresas")
      .select("id, user_id, nome_negocio")
      .eq("id", data.empresaId)
      .single();
    if (empresaError || !empresa || empresa.user_id !== userData.user.id) {
      throw new Error("Empresa não encontrada para este usuário.");
    }

    const valor = PLAN_VALUES[data.plano][data.ciclo];

    // 3. Cria (ou reaproveita) o cliente no Asaas
    const customer = await asaasFetch("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: data.nomeCompleto,
        cpfCnpj: data.cpfCnpj.replace(/\D/g, ""),
        email: data.email,
        phone: data.telefone.replace(/\D/g, ""),
        externalReference: empresa.id,
      }),
    });

    // 4. Cria a assinatura. billingType "UNDEFINED" deixa o cliente escolher
    // Pix, boleto ou cartão na página de fatura do próprio Asaas.
    const hoje = new Date().toISOString().slice(0, 10);
    const subscription = await asaasFetch("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        customer: customer.id,
        billingType: "UNDEFINED",
        cycle: CYCLE_TO_ASAAS[data.ciclo],
        value: valor,
        nextDueDate: hoje,
        description: `Inova Zap — plano ${data.plano} (${empresa.nome_negocio})`,
        externalReference: empresa.id,
      }),
    });

    // 5. Busca a primeira cobrança gerada pela assinatura, pra pegar o link de pagamento
    const payments = await asaasFetch(`/payments?subscription=${subscription.id}`, {
      method: "GET",
    });
    const invoiceUrl = payments?.data?.[0]?.invoiceUrl as string | undefined;

    // 6. Grava o vínculo no nosso banco
    await admin.from("assinaturas").insert({
      empresa_id: empresa.id,
      asaas_customer_id: customer.id,
      asaas_subscription_id: subscription.id,
      plano: data.plano,
      ciclo: data.ciclo,
      status: "pendente",
    });

    if (!invoiceUrl) {
      throw new Error(
        "Assinatura criada, mas não veio o link de pagamento. Confira no painel do Asaas.",
      );
    }

    return { invoiceUrl };
  });
