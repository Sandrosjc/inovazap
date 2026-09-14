import React, { useEffect, useState } from "react";
import { Copy, Check, Percent, Users2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const palette = {
  bg: "#050B09",
  panel: "rgba(255,255,255,0.035)",
  panelBorder: "rgba(255,255,255,0.09)",
  green: "#33F2A0",
  greenText: "#0B3B29",
  text: "#EAF7F1",
  textDim: "#8FA79C",
  textFaint: "#5C6F67",
};

type Afiliado = {
  id: string;
  codigo: string;
  comissao_percentual: number;
  elite: boolean;
};

type Indicacao = {
  nome_negocio: string;
  segmento: string;
  criado_em: string;
  plano: "essencial" | "profissional" | null;
  status_assinatura: string | null;
};

const PLAN_VALUES: Record<string, number> = {
  essencial: 47,
  profissional: 97,
};

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

export default function PainelAfiliado() {
  const [loading, setLoading] = useState(true);
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [criando, setCriando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }
    const { data: afiliadoData } = await supabase
      .from("afiliados")
      .select("id, codigo, comissao_percentual, elite")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    setAfiliado(afiliadoData as Afiliado | null);

    if (afiliadoData) {
      const { data: indicacoesData } = await supabase.rpc("minhas_indicacoes");
      setIndicacoes((indicacoesData as Indicacao[]) || []);
    }
    setLoading(false);
  }

  async function tornarSeAfiliado() {
    setCriando(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      window.location.href = "/login";
      return;
    }
    const { data: codigoGerado, error: codigoError } = await supabase.rpc(
      "gerar_codigo_afiliado",
      { p_user_id: userData.user.id },
    );
    if (codigoError) {
      setError("Não foi possível gerar seu código. Tente novamente.");
      setCriando(false);
      return;
    }
    const { data, error: insertError } = await supabase
      .from("afiliados")
      .insert({ user_id: userData.user.id, codigo: codigoGerado })
      .select("id, codigo, comissao_percentual, elite")
      .single();

    setCriando(false);
    if (insertError) {
      setError("Não foi possível ativar seu link. Tente novamente.");
      return;
    }
    setAfiliado(data as Afiliado);
  }

  const link = afiliado
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${afiliado.codigo}`
    : "";

  const assinaturasAtivas = indicacoes.filter((i) => i.status_assinatura === "ativa" && i.plano);
  const comissaoEstimada = afiliado
    ? assinaturasAtivas.reduce(
        (soma, i) => soma + (PLAN_VALUES[i.plano as string] || 0) * (afiliado.comissao_percentual / 100),
        0,
      )
    : 0;

  function copiarLink() {
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div style={{ color: palette.text, minHeight: "100vh", padding: "36px 32px 64px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .iz-heading { font-family: 'Space Grotesk', Inter, sans-serif; }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="iz-heading" style={{ fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>
            Meu link de afiliado
          </h1>
          <p style={{ fontSize: 13.5, color: palette.textFaint, margin: 0 }}>
            Compartilhe e acompanhe suas indicações.
          </p>
        </div>

        {loading ? (
          <p style={{ fontSize: 13.5, color: palette.textDim }}>Carregando...</p>
        ) : !afiliado ? (
          <Panel style={{ padding: 30, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: palette.textDim, margin: "0 0 16px" }}>
              Você ainda não ativou seu link de afiliado.
            </p>
            <button
              onClick={tornarSeAfiliado}
              disabled={criando}
              style={{
                background: palette.green,
                color: palette.greenText,
                border: "none",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: criando ? "default" : "pointer",
                opacity: criando ? 0.7 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {criando ? "Ativando..." : "Ativar meu link de afiliado"}
              <ArrowRight size={14} />
            </button>
          </Panel>
        ) : (
          <>
            <Panel style={{ padding: 22, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: palette.textFaint, marginBottom: 8 }}>
                Seu link de indicação
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${palette.panelBorder}`,
                    borderRadius: 10,
                    padding: "10px 13px",
                    fontSize: 13,
                    color: palette.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {link}
                </div>
                <button
                  onClick={copiarLink}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: copiado ? "rgba(51,242,160,0.14)" : "transparent",
                    border: `1px solid ${palette.panelBorder}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: copiado ? palette.green : palette.textDim,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copiado ? <Check size={14} /> : <Copy size={14} />}
                  {copiado ? "Copiado" : "Copiar"}
                </button>
              </div>
            </Panel>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
              <Panel style={{ padding: 20 }}>
                <Percent size={16} color={palette.green} style={{ marginBottom: 10 }} />
                <div className="iz-heading" style={{ fontSize: 22, fontWeight: 600 }}>
                  {afiliado.comissao_percentual}%
                </div>
                <div style={{ fontSize: 12, color: palette.textFaint }}>
                  {afiliado.elite ? "Comissão Elite" : "Comissão recorrente"}
                </div>
              </Panel>
              <Panel style={{ padding: 20 }}>
                <Users2 size={16} color={palette.green} style={{ marginBottom: 10 }} />
                <div className="iz-heading" style={{ fontSize: 22, fontWeight: 600 }}>
                  {indicacoes.length}
                </div>
                <div style={{ fontSize: 12, color: palette.textFaint }}>Negócios indicados</div>
              </Panel>
              <Panel style={{ padding: 20 }}>
                <div className="iz-heading" style={{ fontSize: 22, fontWeight: 600, color: palette.green }}>
                  R$ {comissaoEstimada.toFixed(2).replace(".", ",")}
                </div>
                <div style={{ fontSize: 12, color: palette.textFaint }}>
                  Estimativa/mês ({assinaturasAtivas.length} assinatura{assinaturasAtivas.length === 1 ? "" : "s"} ativa{assinaturasAtivas.length === 1 ? "" : "s"})
                </div>
              </Panel>
            </div>

            <div style={{ fontSize: 12.5, color: palette.textFaint, marginBottom: 10 }}>
              Suas indicações
            </div>
            {indicacoes.length === 0 ? (
              <Panel style={{ padding: 20 }}>
                <p style={{ fontSize: 13, color: palette.textDim, margin: 0 }}>
                  Ninguém se cadastrou pelo seu link ainda. Compartilhe para começar a ganhar.
                </p>
              </Panel>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {indicacoes.map((i, idx) => (
                  <Panel
                    key={idx}
                    style={{
                      padding: 14,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 13,
                    }}
                  >
                    <span>{i.nome_negocio}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background:
                            i.status_assinatura === "ativa"
                              ? "rgba(51,242,160,0.14)"
                              : "rgba(255,255,255,0.06)",
                          color: i.status_assinatura === "ativa" ? palette.green : palette.textFaint,
                        }}
                      >
                        {i.status_assinatura === "ativa"
                          ? "Assinatura ativa"
                          : i.status_assinatura
                            ? i.status_assinatura
                            : "Sem assinatura ainda"}
                      </span>
                      <span style={{ color: palette.textFaint }}>
                        {new Date(i.criado_em).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </Panel>
                ))}
              </div>
            )}
          </>
        )}

        {error && <p style={{ fontSize: 13, color: "#F09595", marginTop: 14 }}>{error}</p>}
      </div>
    </div>
  );
}
