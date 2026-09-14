import React, { useEffect, useState } from "react";
import {
  Zap,
  MessageCircle,
  Bell,
  ArrowRight,
  Clock,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  Cloud,
  Headphones,
  Stethoscope,
  ShoppingBag,
  Scale,
  Users,
  Settings,
  BarChart3,
  UserCog,
  LayoutGrid,
  Puzzle,
  CircleUser,
  LogOut,
  Bot,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";

const palette = {
  bg: "#050B09",
  bgSoft: "#081712",
  panel: "rgba(255,255,255,0.035)",
  panelBorder: "rgba(255,255,255,0.09)",
  panelBorderStrong: "rgba(255,255,255,0.16)",
  green: "#33F2A0",
  greenDim: "#1C8F63",
  greenText: "#0B3B29",
  purple: "#9C7BFF",
  purpleText: "#241A4A",
  blue: "#4FC3F5",
  blueText: "#0C2E3A",
  amber: "#FFB454",
  amberText: "#3A2506",
  text: "#EAF7F1",
  textDim: "#8FA79C",
  textFaint: "#5C6F67",
};

const navItems = [
  { label: "Visão geral", icon: LayoutGrid },
  { label: "Conversas", icon: MessageCircle, badge: 12 },
  { label: "Configurações", icon: Settings },
  { label: "Relatórios", icon: BarChart3 },
  { label: "Integrações", icon: Puzzle },
  { label: "Equipe", icon: UserCog },
];

const painPoints = [
  "Cliente manda mensagem e espera horas pela resposta",
  "Pedido, consulta ou orçamento se perde no meio da conversa",
  "Cada atendente responde de um jeito diferente",
];

const segments = [
  {
    slug: "saude",
    title: "Saúde e clínicas",
    description:
      "Confirma consultas, lembra o paciente do horário e reagenda faltas sozinho.",
    cta: "Ver para clínicas",
    icon: Stethoscope,
    accent: palette.blue,
    accentText: palette.blueText,
  },
  {
    slug: "varejo",
    title: "Comércio e varejo",
    description:
      "Recupera carrinho abandonado, envia catálogo e fecha o pedido pelo chat.",
    cta: "Ver para lojas",
    icon: ShoppingBag,
    accent: palette.green,
    accentText: palette.greenText,
  },
  {
    slug: "juridico",
    title: "Advocacia e consultoria",
    description:
      "Faz a triagem do caso, agenda a primeira reunião e nunca deixa um lead esfriar.",
    cta: "Ver para escritórios",
    icon: Scale,
    accent: palette.purple,
    accentText: palette.purpleText,
  },
  {
    slug: "servicos",
    title: "Serviços e prestadores",
    description:
      "Orça, agenda visita e confirma o serviço sem seu time tocar no celular.",
    cta: "Ver para prestadores",
    icon: Users,
    accent: palette.amber,
    accentText: palette.amberText,
  },
];

// Coloque uma foto para cada segmento em public/images/segments/ com estes
// nomes de arquivo exatos (jpg ou png). Até lá, o card mostra um fundo
// ilustrativo na cor do segmento no lugar da foto.
function segmentImageSrc(slug) {
  return `/images/segments/${slug}.jpg`;
}

const trustItems = [
  { label: "Dados protegidos ponta a ponta", icon: ShieldCheck },
  { label: "Funciona em qualquer aparelho", icon: Smartphone },
  { label: "Conecta com sua ferramenta atual", icon: Cloud },
  { label: "Suporte com gente de verdade", icon: Headphones },
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

export default function InovaZapDashboard() {
  const [activeNav, setActiveNav] = useState("Visão geral");
  const { user, loading, signOut } = useAuth();
  const displayName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user?.email ||
    "Visitante";

  const [empresaNome, setEmpresaNome] = useState<string | null>(null);
  const [conversasHoje, setConversasHoje] = useState<number | null>(null);
  const [respondidasIA, setRespondidasIA] = useState<number | null>(null);
  const [planoAtual, setPlanoAtual] = useState<string | null>(null);
  const [statusAssinatura, setStatusAssinatura] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("id, nome_negocio")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!empresa) return;
      setEmpresaNome(empresa.nome_negocio);

      const inicioHoje = new Date();
      inicioHoje.setHours(0, 0, 0, 0);

      const { count: countCliente } = await supabase
        .from("mensagens")
        .select("id", { count: "exact", head: true })
        .eq("empresa_id", empresa.id)
        .eq("remetente", "cliente")
        .gte("created_at", inicioHoje.toISOString());
      setConversasHoje(countCliente ?? 0);

      const { count: countIA } = await supabase
        .from("mensagens")
        .select("id", { count: "exact", head: true })
        .eq("empresa_id", empresa.id)
        .eq("remetente", "ia")
        .gte("created_at", inicioHoje.toISOString());
      setRespondidasIA(countIA ?? 0);

      const { data: assinatura } = await supabase
        .from("assinaturas")
        .select("plano, status")
        .eq("empresa_id", empresa.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setPlanoAtual(assinatura?.plano ?? null);
      setStatusAssinatura(assinatura?.status ?? null);
    })();
  }, [user]);

  const stats = [
    {
      label: "Conversas hoje",
      value: conversasHoje === null ? "—" : String(conversasHoje),
      delta: empresaNome ? empresaNome : "Configure seu negócio",
      icon: MessageCircle,
      accent: palette.green,
      accentText: palette.greenText,
    },
    {
      label: "Respondidas pela IA",
      value: respondidasIA === null ? "—" : String(respondidasIA),
      delta: "Hoje",
      icon: Bot,
      accent: palette.purple,
      accentText: palette.purpleText,
    },
    {
      label: "Assinatura",
      value: planoAtual ? planoAtual[0].toUpperCase() + planoAtual.slice(1) : "Grátis",
      delta:
        statusAssinatura === "ativa"
          ? "Ativa"
          : statusAssinatura === "pendente"
            ? "Pagamento pendente"
            : statusAssinatura || "Sem plano pago",
      icon: Clock,
      accent: palette.blue,
      accentText: palette.blueText,
    },
  ];

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  return (
    <div
      style={{
        background: `radial-gradient(1100px 520px at 14% -10%, rgba(51,242,160,0.16), transparent 60%), radial-gradient(900px 480px at 100% 0%, rgba(156,123,255,0.14), transparent 55%), ${palette.bg}`,
        color: palette.text,
        minHeight: "100vh",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .iz-heading { font-family: 'Space Grotesk', Inter, sans-serif; }
        .iz-nav-item:hover { background: rgba(255,255,255,0.05); }
        .iz-card:hover { border-color: rgba(255,255,255,0.22); transform: translateY(-2px); }
        .iz-card { transition: border-color .2s ease, transform .2s ease; }
        .iz-cta:hover { filter: brightness(1.06); }
      `}</style>

      <div style={{ maxWidth: 1128, margin: "0 auto", padding: "28px 32px 64px" }}>
          {/* Topbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircleUser size={22} color={palette.textDim} />
              </div>
              <div>
                <div className="iz-heading" style={{ fontSize: 15, fontWeight: 600 }}>
                  {loading ? "Carregando..." : user ? `Olá, ${displayName}` : "Visitante"}
                </div>
                <div style={{ fontSize: 12, color: palette.textFaint }}>
                  Painel do seu negócio
                </div>
              </div>
              {!loading && user && (
                <button
                  onClick={handleSignOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "transparent",
                    border: `1px solid ${palette.panelBorder}`,
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 12,
                    color: palette.textDim,
                    cursor: "pointer",
                    marginLeft: 4,
                  }}
                >
                  <LogOut size={13} />
                  Sair
                </button>
              )}
              {!loading && !user && (
                <Link
                  to="/login"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "transparent",
                    border: `1px solid ${palette.panelBorder}`,
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 12,
                    color: palette.green,
                    textDecoration: "none",
                    marginLeft: 4,
                  }}
                >
                  Entrar
                </Link>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                className="iz-cta"
                style={{
                  background: palette.green,
                  color: palette.greenText,
                  border: "none",
                  borderRadius: 12,
                  padding: "11px 18px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Ativar atendimento automático
                <ArrowRight size={15} />
              </button>
              <button
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `1px solid ${palette.panelBorder}`,
                  background: "transparent",
                  color: palette.textDim,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <Bell size={17} style={{ margin: "auto" }} />
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 9,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: palette.amber,
                  }}
                />
              </button>
            </div>
          </div>

          {/* Hero */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr",
              gap: 20,
              marginBottom: 20,
            }}
          >
            <Panel style={{ padding: "32px 32px 28px" }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: palette.green,
                  background: "rgba(51,242,160,0.1)",
                  border: `1px solid rgba(51,242,160,0.25)`,
                  borderRadius: 999,
                  padding: "5px 12px",
                  marginBottom: 18,
                }}
              >
                Um sistema, qualquer tipo de negócio
              </span>
              <h1
                className="iz-heading"
                style={{
                  fontSize: 34,
                  lineHeight: 1.18,
                  fontWeight: 600,
                  margin: "0 0 14px",
                  maxWidth: 480,
                }}
              >
                Seu negócio nunca mais perde um cliente por demora
              </h1>
              <p
                style={{
                  color: palette.textDim,
                  fontSize: 15,
                  lineHeight: 1.6,
                  maxWidth: 440,
                  margin: "0 0 26px",
                }}
              >
                Clínica, loja, escritório ou prestador de serviço: o Inova Zap
                responde, agenda e vende pelo WhatsApp enquanto você cuida do
                resto do negócio.
              </p>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {["Sem cartão para testar", "Configura em 2 minutos", "Funciona hoje mesmo"].map(
                  (t) => (
                    <div
                      key={t}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        color: palette.textDim,
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: "rgba(51,242,160,0.14)",
                          color: palette.green,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                        }}
                      >
                        ✓
                      </span>
                      {t}
                    </div>
                  ),
                )}
              </div>
            </Panel>

            {/* chat preview */}
            <Panel style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 12, color: palette.textFaint, marginBottom: 2 }}>
                Pré-visualização da conversa
              </div>
              {[
                { from: "cliente", text: "Oi, vocês têm horário essa semana?" },
                {
                  from: "bot",
                  text: "Oi! Temos sim — quarta às 14h ou sexta às 10h. Qual fica melhor?",
                },
                { from: "cliente", text: "Sexta às 10h" },
                { from: "bot", text: "Perfeito, já reservei o seu horário 🙂" },
              ].map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.from === "cliente" ? "flex-start" : "flex-end",
                    maxWidth: "82%",
                    background:
                      m.from === "cliente" ? "rgba(255,255,255,0.06)" : palette.green,
                    color: m.from === "cliente" ? palette.text : palette.greenText,
                    padding: "9px 13px",
                    borderRadius: 14,
                    fontSize: 13.5,
                    lineHeight: 1.4,
                  }}
                >
                  {m.text}
                </div>
              ))}
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: 10,
                  borderTop: `1px solid ${palette.panelBorder}`,
                  fontSize: 12,
                  color: palette.textFaint,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MessageCircle size={13} />
                Respondido automaticamente
              </div>
            </Panel>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginBottom: 20,
            }}
          >
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <Panel key={s.label} style={{ padding: 20 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: `${s.accent}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    <Icon size={17} color={s.accent} />
                  </div>
                  <div style={{ fontSize: 12, color: palette.textFaint, marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div className="iz-heading" style={{ fontSize: 24, fontWeight: 600 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: s.accent, marginTop: 4 }}>{s.delta}</div>
                </Panel>
              );
            })}
          </div>

          {/* Pain points */}
          <Panel
            style={{
              padding: "18px 24px",
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            {painPoints.map((p) => (
              <div
                key={p}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13.5,
                  color: palette.textDim,
                  flex: "1 1 240px",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: palette.amber,
                    flexShrink: 0,
                  }}
                />
                {p}
              </div>
            ))}
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: palette.green,
                whiteSpace: "nowrap",
              }}
            >
              O Inova Zap resolve os três
            </div>
          </Panel>

          {/* Segments */}
          <div style={{ marginBottom: 16 }}>
            <h2 className="iz-heading" style={{ fontSize: 19, fontWeight: 600, margin: "0 0 4px" }}>
              Feito para o seu tipo de negócio
            </h2>
            <p style={{ fontSize: 13.5, color: palette.textFaint, margin: 0 }}>
              O mesmo motor de atendimento, ajustado para o seu setor.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 18,
              marginBottom: 32,
            }}
          >
            {segments.map((seg) => {
              const Icon = seg.icon;
              return (
                <Panel
                  key={seg.title}
                  className="iz-card"
                  style={{ padding: 0, overflow: "hidden" }}
                >
                  <div
                    style={{
                      position: "relative",
                      height: 150,
                      background: `linear-gradient(160deg, ${seg.accent}33, ${seg.accent}0d)`,
                    }}
                  >
                    <img
                      src={segmentImageSrc(seg.slug)}
                      alt={seg.title}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 16,
                        bottom: -18,
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: palette.bgSoft,
                        border: `1px solid ${palette.panelBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={20} color={seg.accent} />
                    </div>
                  </div>
                  <div style={{ padding: "30px 22px 22px" }}>
                    <div className="iz-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                      {seg.title}
                    </div>
                    <p style={{ fontSize: 13.5, color: palette.textDim, lineHeight: 1.55, margin: "0 0 16px" }}>
                      {seg.description}
                    </p>
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        color: seg.accent,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {seg.cta}
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </Panel>
              );
            })}
          </div>

          {/* Trust strip */}
          <Panel
            style={{
              padding: "18px 28px",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 18,
            }}
          >
            {trustItems.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 12.5,
                    color: palette.textDim,
                  }}
                >
                  <Icon size={15} color={palette.green} />
                  {t.label}
                </div>
              );
            })}
          </Panel>
      </div>
    </div>
  );
}
