import React from "react";
import { Check, ArrowRight, Percent, Wallet, Users2, ShieldCheck, TrendingUp } from "lucide-react";

const palette = {
  bg: "#050B09",
  panel: "rgba(255,255,255,0.035)",
  panelBorder: "rgba(255,255,255,0.09)",
  panelBorderStrong: "rgba(255,255,255,0.18)",
  green: "#33F2A0",
  greenText: "#0B3B29",
  purple: "#9C7BFF",
  text: "#EAF7F1",
  textDim: "#8FA79C",
  textFaint: "#5C6F67",
};

// Referência de mercado (set/2026): BotConversa promete até 30% recorrente
// (mas tem reclamações no Reclame Aqui de comissão não paga), HubSpot 30%
// por 12 meses, SocialHub e Hostoo com modelo recorrente de 10-30%.
const tiers = [
  {
    name: "Afiliado",
    commission: "25%",
    requirement: "Sem mínimo de vendas",
    description: "Todo mundo começa aqui. Comissão recorrente desde a primeira venda.",
    highlighted: false,
  },
  {
    name: "Afiliado Elite",
    commission: "30%",
    requirement: "A partir de 10 clientes ativos",
    description: "Mais materiais, prioridade no suporte e bônus por metas trimestrais.",
    highlighted: true,
  },
];

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Comissão paga enquanto o cliente pagar",
    text: "Recorrente de verdade: você recebe todo mês que o indicado continuar assinante, sem prazo de corte.",
  },
  {
    icon: Wallet,
    title: "Pix, todo mês, com extrato aberto",
    text: "Pagamento em até 5 dias úteis após o fechamento do mês, com dashboard mostrando cada venda e cada centavo.",
  },
  {
    icon: TrendingUp,
    title: "60 dias de cookie",
    text: "Se alguém clicar no seu link e assinar em até 60 dias, a venda é sua — mesmo sem comprar na hora.",
  },
];

function Panel({ children, style, ...rest }) {
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

export default function ProgramaAfiliados() {
  return (
    <div
      style={{
        background: `radial-gradient(1100px 520px at 50% -10%, rgba(51,242,160,0.12), transparent 60%), ${palette.bg}`,
        color: palette.text,
        minHeight: "100vh",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "48px 24px 64px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .iz-heading { font-family: 'Space Grotesk', Inter, sans-serif; }
        .iz-cta:hover { filter: brightness(1.06); }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 500,
              color: palette.green,
              background: "rgba(51,242,160,0.1)",
              border: "1px solid rgba(51,242,160,0.25)",
              borderRadius: 999,
              padding: "5px 12px",
              marginBottom: 16,
            }}
          >
            Programa de afiliados
          </span>
          <h1 className="iz-heading" style={{ fontSize: 27, fontWeight: 600, margin: "0 0 10px" }}>
            Indique o Inova Zap e ganhe todo mês
          </h1>
          <p style={{ fontSize: 14.5, color: palette.textDim, margin: "0 auto", maxWidth: 520 }}>
            Comissão recorrente de até 30% — pra consultores, agências e quem já
            atende médicos, advogados, lojistas e prestadores de serviço.
          </p>
        </div>

        {/* Tiers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginBottom: 20 }}>
          {tiers.map((t) => (
            <Panel
              key={t.name}
              style={{
                padding: 26,
                border: t.highlighted ? `1.5px solid ${palette.green}` : `1px solid ${palette.panelBorder}`,
                position: "relative",
              }}
            >
              {t.highlighted && (
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
                  Melhor comissão
                </span>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "rgba(51,242,160,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Percent size={17} color={palette.green} />
                </div>
                <div className="iz-heading" style={{ fontSize: 16, fontWeight: 600 }}>
                  {t.name}
                </div>
              </div>
              <div className="iz-heading" style={{ fontSize: 32, fontWeight: 600, marginBottom: 4 }}>
                {t.commission}
                <span style={{ fontSize: 13, color: palette.textFaint, fontWeight: 400 }}> recorrente</span>
              </div>
              <div style={{ fontSize: 12, color: palette.textFaint, marginBottom: 12 }}>{t.requirement}</div>
              <p style={{ fontSize: 13, color: palette.textDim, lineHeight: 1.5, margin: 0 }}>{t.description}</p>
            </Panel>
          ))}
        </div>

        {/* Example earnings */}
        <Panel style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 12.5, color: palette.textFaint, marginBottom: 14 }}>
            Exemplo com o plano Profissional (R$ 97/mês)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "5 clientes indicados", value: "R$ 121/mês" },
              { label: "15 clientes indicados", value: "R$ 364/mês" },
              { label: "30 clientes indicados", value: "R$ 873/mês" },
            ].map((row) => (
              <div key={row.label}>
                <div className="iz-heading" style={{ fontSize: 20, fontWeight: 600, color: palette.green }}>
                  {row.value}
                </div>
                <div style={{ fontSize: 12, color: palette.textFaint }}>{row.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: palette.textFaint, marginTop: 14 }}>
            Comissão de 25% (Afiliado), enquanto os clientes indicados continuarem assinantes.
          </div>
        </Panel>

        {/* Trust points */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {trustPoints.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title}>
                <Icon size={18} color={palette.green} style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>{p.title}</div>
                <div style={{ fontSize: 12.5, color: palette.textFaint, lineHeight: 1.5 }}>{p.text}</div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            className="iz-cta"
            style={{
              background: palette.green,
              color: palette.greenText,
              border: "none",
              borderRadius: 10,
              padding: "13px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Quero ser afiliado
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
