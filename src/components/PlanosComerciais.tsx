import React, { useState } from "react";
import { Check, ArrowRight, Zap, Building2, Rocket, X, AlertCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/lib/supabaseClient";
import { criarAssinaturaAsaas } from "@/server/asaas.server";

const palette = {
  bg: "#050B09",
  panel: "rgba(255,255,255,0.035)",
  panelBorder: "rgba(255,255,255,0.09)",
  panelBorderStrong: "rgba(255,255,255,0.18)",
  green: "#33F2A0",
  greenText: "#0B3B29",
  text: "#EAF7F1",
  textDim: "#8FA79C",
  textFaint: "#5C6F67",
};

type PlanoId = "essencial" | "profissional";
type Ciclo = "monthly" | "quarterly" | "yearly";

const plans: {
  id: PlanoId | "comecar";
  name: string;
  icon: typeof Zap;
  monthly: number;
  quarterly: number;
  yearly: number;
  description: string;
  cta: string;
  highlighted: boolean;
  features: string[];
}[] = [
  {
    id: "comecar",
    name: "Começar",
    icon: Zap,
    monthly: 0,
    quarterly: 0,
    yearly: 0,
    description: "Para testar o atendimento automático com um único número.",
    cta: "Começar grátis",
    highlighted: false,
    features: [
      "1 número de WhatsApp conectado",
      "Até 200 conversas por mês",
      "1 segmento de profissão configurado",
      "Modelos de mensagem prontos",
    ],
  },
  {
    id: "essencial",
    name: "Essencial",
    icon: Rocket,
    monthly: 47,
    quarterly: 42.3,
    yearly: 39.17,
    description: "Para quem atende sozinho e quer parar de perder cliente por demora.",
    cta: "Assinar Essencial",
    highlighted: false,
    features: [
      "1 número de WhatsApp conectado",
      "1.500 conversas incluídas por mês",
      "Todos os 8 segmentos de profissão",
      "Modelos de mensagem prontos e editáveis",
    ],
  },
  {
    id: "profissional",
    name: "Profissional",
    icon: Building2,
    monthly: 97,
    quarterly: 87.3,
    yearly: 80.83,
    description: "Para negócios com equipe e atendimento diário em volume.",
    cta: "Assinar Profissional",
    highlighted: true,
    features: [
      "3 números de WhatsApp conectados",
      "Conversas ilimitadas",
      "Relatórios de vendas e atendimento",
      "Até 5 pessoas na equipe",
      "Suporte prioritário",
    ],
  },
];

const cycles: { id: Ciclo; label: string; badge?: string }[] = [
  { id: "monthly", label: "Mensal" },
  { id: "quarterly", label: "Trimestral", badge: "-10%" },
  { id: "yearly", label: "Anual", badge: "2 meses grátis" },
];

function formatPrice(v: number) {
  if (v === 0) return "Grátis";
  return `R$ ${v.toFixed(2).replace(".", ",").replace(",00", "")}`;
}

function Panel({ children, style, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      style={{
        background: palette.panel,
        border: `1px solid ${palette.panelBorder}`,
        borderRadius: 18,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function PlanosComerciais() {
  const [cycle, setCycle] = useState<Ciclo>("monthly");
  const [checkoutPlano, setCheckoutPlano] = useState<PlanoId | null>(null);
  const [form, setForm] = useState({ nomeCompleto: "", cpfCnpj: "", telefone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const criarAssinatura = useServerFn(criarAssinaturaAsaas);

  function abrirCheckout(planoId: PlanoId) {
    setCheckoutPlano(planoId);
    setError(null);
  }

  async function confirmarAssinatura() {
    if (!checkoutPlano) return;
    setLoading(true);
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const { data: userData } = await supabase.auth.getUser();
    if (!sessionData.session || !userData.user) {
      window.location.href = "/login";
      return;
    }

    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .select("id")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (empresaError || !empresa) {
      setError("Configure seu negócio antes de assinar um plano.");
      setLoading(false);
      return;
    }

    try {
      const result = await criarAssinatura({
        data: {
          accessToken: sessionData.session.access_token,
          empresaId: empresa.id,
          plano: checkoutPlano,
          ciclo: cycle,
          nomeCompleto: form.nomeCompleto,
          cpfCnpj: form.cpfCnpj,
          email: userData.user.email || "",
          telefone: form.telefone,
        },
      });
      window.location.href = result.invoiceUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar a assinatura.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        color: palette.text,
        minHeight: "100vh",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "48px 24px 64px",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .iz-heading { font-family: 'Space Grotesk', Inter, sans-serif; }
        .iz-plan-cta:hover { filter: brightness(1.06); }
        .iz-cycle-btn:hover { background: rgba(255,255,255,0.05); }
        .iz-input:focus { border-color: ${palette.green} !important; }
      `}</style>

      <div style={{ maxWidth: 1020, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 className="iz-heading" style={{ fontSize: 28, fontWeight: 600, margin: "0 0 10px" }}>
            Um plano para cada tamanho de negócio
          </h1>
          <p style={{ fontSize: 14.5, color: palette.textDim, margin: "0 auto", maxWidth: 480 }}>
            Pagamento via Pix, boleto ou cartão, direto no Asaas.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${palette.panelBorder}`,
              borderRadius: 12,
              padding: 4,
              gap: 2,
            }}
          >
            {cycles.map((c) => {
              const active = cycle === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCycle(c.id)}
                  className="iz-cycle-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 14px",
                    borderRadius: 9,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    background: active ? palette.green : "transparent",
                    color: active ? palette.greenText : palette.textDim,
                  }}
                >
                  {c.label}
                  {c.badge && (
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: 999,
                        background: active ? "rgba(11,59,41,0.18)" : "rgba(51,242,160,0.14)",
                        color: active ? palette.greenText : palette.green,
                      }}
                    >
                      {c.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = plan[cycle];
            return (
              <Panel
                key={plan.name}
                style={{
                  padding: 26,
                  display: "flex",
                  flexDirection: "column",
                  border: plan.highlighted ? `1.5px solid ${palette.green}` : `1px solid ${palette.panelBorder}`,
                  position: "relative",
                }}
              >
                {plan.highlighted && (
                  <span
                    style={{
                      position: "absolute",
                      top: -12,
                      left: 26,
                      background: palette.green,
                      color: palette.greenText,
                      fontSize: 11.5,
                      fontWeight: 600,
                      borderRadius: 999,
                      padding: "3px 10px",
                    }}
                  >
                    Mais escolhido
                  </span>
                )}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: plan.highlighted ? "rgba(51,242,160,0.14)" : "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon size={18} color={plan.highlighted ? palette.green : palette.textDim} />
                </div>
                <div className="iz-heading" style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
                  {plan.name}
                </div>
                <p style={{ fontSize: 13, color: palette.textFaint, lineHeight: 1.5, margin: "0 0 18px", minHeight: 40 }}>
                  {plan.description}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 22 }}>
                  <span className="iz-heading" style={{ fontSize: 26, fontWeight: 600 }}>
                    {formatPrice(price)}
                  </span>
                  {price > 0 && <span style={{ fontSize: 13, color: palette.textFaint }}>/mês</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, flex: 1 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 9, fontSize: 13, color: palette.textDim }}>
                      <Check size={14} color={plan.highlighted ? palette.green : palette.textFaint} style={{ flexShrink: 0, marginTop: 2 }} />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => (plan.id === "comecar" ? (window.location.href = "/configuracao") : abrirCheckout(plan.id))}
                  className="iz-plan-cta"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: plan.highlighted ? palette.green : "transparent",
                    color: plan.highlighted ? palette.greenText : palette.text,
                    border: plan.highlighted ? "none" : `1px solid ${palette.panelBorderStrong}`,
                    borderRadius: 10,
                    padding: "11px 16px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {plan.cta}
                  <ArrowRight size={14} />
                </button>
              </Panel>
            );
          })}
        </div>
      </div>

      {/* Checkout modal */}
      {checkoutPlano && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 50,
          }}
        >
          <Panel style={{ padding: 26, width: "100%", maxWidth: 400, position: "relative" }}>
            <button
              onClick={() => setCheckoutPlano(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: palette.textFaint, cursor: "pointer" }}
            >
              <X size={18} />
            </button>
            <h2 className="iz-heading" style={{ fontSize: 17, fontWeight: 600, margin: "0 0 4px" }}>
              Finalizar assinatura
            </h2>
            <p style={{ fontSize: 12.5, color: palette.textFaint, margin: "0 0 20px" }}>
              Você será direcionado ao Asaas para escolher Pix, boleto ou cartão.
            </p>

            {["nomeCompleto", "cpfCnpj", "telefone"].map((field) => (
              <input
                key={field}
                className="iz-input"
                placeholder={
                  field === "nomeCompleto" ? "Nome completo" : field === "cpfCnpj" ? "CPF ou CNPJ" : "Telefone (com DDD)"
                }
                value={(form as Record<string, string>)[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${palette.panelBorder}`,
                  borderRadius: 10,
                  padding: "10px 13px",
                  fontSize: 14,
                  color: palette.text,
                  outline: "none",
                  marginBottom: 10,
                }}
              />
            ))}

            <button
              onClick={confirmarAssinatura}
              disabled={loading || !form.nomeCompleto || !form.cpfCnpj || !form.telefone}
              style={{
                width: "100%",
                background: palette.green,
                color: palette.greenText,
                border: "none",
                borderRadius: 10,
                padding: "11px 16px",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
              }}
            >
              {loading ? "Criando assinatura..." : "Ir para o pagamento"}
            </button>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 12.5, color: "#F09595" }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
