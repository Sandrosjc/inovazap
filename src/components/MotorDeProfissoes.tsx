import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  MessageCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabaseClient";
import { professionDefaults } from "./professionDefaults";

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

type Empresa = {
  id: string;
  nome_negocio: string;
  segmento: keyof typeof professionDefaults;
};

type Fluxo = {
  id: string;
  empresa_id: string;
  gatilho: string;
  mensagem: string;
  ativo: boolean;
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

export default function MotorDeProfissoes() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null);
  const [fluxos, setFluxos] = useState<Fluxo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [novoGatilho, setNovoGatilho] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }
      const { data, error: empresasError } = await supabase
        .from("empresas")
        .select("id, nome_negocio, segmento")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (empresasError) {
        setError("Não foi possível carregar suas empresas.");
        setLoading(false);
        return;
      }
      setEmpresas((data as Empresa[]) || []);
      if (data && data.length > 0) {
        setSelectedEmpresaId(data[0].id);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedEmpresaId) {
      setFluxos([]);
      return;
    }
    (async () => {
      const { data, error: fluxosError } = await supabase
        .from("fluxos_mensagem")
        .select("id, empresa_id, gatilho, mensagem, ativo")
        .eq("empresa_id", selectedEmpresaId)
        .order("created_at", { ascending: true });

      if (fluxosError) {
        setError("Não foi possível carregar os fluxos de mensagem.");
        return;
      }
      setFluxos((data as Fluxo[]) || []);
    })();
  }, [selectedEmpresaId]);

  const empresaSelecionada = empresas.find((e) => e.id === selectedEmpresaId);
  const segmento = empresaSelecionada ? professionDefaults[empresaSelecionada.segmento] : null;

  async function usarModelosPadrao() {
    if (!selectedEmpresaId || !segmento) return;
    const rows = segmento.templates.map((t) => ({
      empresa_id: selectedEmpresaId,
      gatilho: t.gatilho,
      mensagem: t.mensagem,
      ativo: true,
    }));
    const { data, error: insertError } = await supabase
      .from("fluxos_mensagem")
      .insert(rows)
      .select("id, empresa_id, gatilho, mensagem, ativo");

    if (insertError) {
      setError("Não foi possível criar os modelos padrão.");
      return;
    }
    setFluxos((f) => [...f, ...((data as Fluxo[]) || [])]);
  }

  async function adicionarFluxo() {
    if (!selectedEmpresaId || !novoGatilho.trim() || !novaMensagem.trim()) return;
    const { data, error: insertError } = await supabase
      .from("fluxos_mensagem")
      .insert({
        empresa_id: selectedEmpresaId,
        gatilho: novoGatilho,
        mensagem: novaMensagem,
        ativo: true,
      })
      .select("id, empresa_id, gatilho, mensagem, ativo")
      .single();

    if (insertError) {
      setError("Não foi possível adicionar o fluxo.");
      return;
    }
    setFluxos((f) => [...f, data as Fluxo]);
    setNovoGatilho("");
    setNovaMensagem("");
  }

  async function removerFluxo(id: string) {
    const previous = fluxos;
    setFluxos((f) => f.filter((x) => x.id !== id));
    const { error: deleteError } = await supabase.from("fluxos_mensagem").delete().eq("id", id);
    if (deleteError) {
      setError("Não foi possível remover o fluxo.");
      setFluxos(previous);
    }
  }

  async function alternarAtivo(id: string, ativo: boolean) {
    setFluxos((f) => f.map((x) => (x.id === id ? { ...x, ativo: !ativo } : x)));
    const { error: updateError } = await supabase
      .from("fluxos_mensagem")
      .update({ ativo: !ativo })
      .eq("id", id);
    if (updateError) {
      setError("Não foi possível atualizar o fluxo.");
      setFluxos((f) => f.map((x) => (x.id === id ? { ...x, ativo } : x)));
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${palette.panelBorder}`,
    borderRadius: 10,
    padding: "9px 12px",
    fontSize: 13,
    color: palette.text,
    outline: "none",
  };

  return (
    <div
      style={{
        background: `radial-gradient(1100px 520px at 14% -10%, rgba(51,242,160,0.12), transparent 60%), ${palette.bg}`,
        color: palette.text,
        minHeight: "100vh",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "36px 32px 64px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .iz-heading { font-family: 'Space Grotesk', Inter, sans-serif; }
        .iz-input:focus { border-color: ${palette.green} !important; }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {loading ? (
          <p style={{ fontSize: 13.5, color: palette.textDim }}>Carregando...</p>
        ) : empresas.length === 0 ? (
          <Panel style={{ padding: 30, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: palette.textDim, margin: "0 0 16px" }}>
              Você ainda não configurou nenhum negócio.
            </p>
            <Link
              to="/configuracao"
              style={{
                background: palette.green,
                color: palette.greenText,
                border: "none",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: 13.5,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Configurar meu negócio
              <ArrowRight size={14} />
            </Link>
          </Panel>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <h1 className="iz-heading" style={{ fontSize: 20, fontWeight: 600, margin: "0 0 4px" }}>
                Fluxos de mensagem
              </h1>
              <p style={{ fontSize: 13, color: palette.textFaint, margin: 0 }}>
                Modelos que respondem automaticamente pelo WhatsApp de cada negócio.
              </p>
            </div>

            {empresas.length > 1 && (
              <select
                value={selectedEmpresaId ?? ""}
                onChange={(e) => setSelectedEmpresaId(e.target.value)}
                style={{ ...inputStyle, marginBottom: 18, maxWidth: 320 }}
              >
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome_negocio}
                  </option>
                ))}
              </select>
            )}

            {fluxos.length === 0 ? (
              <Panel style={{ padding: 26, textAlign: "center", marginBottom: 20 }}>
                <p style={{ fontSize: 13.5, color: palette.textDim, margin: "0 0 16px" }}>
                  Nenhum fluxo configurado ainda para {empresaSelecionada?.nome_negocio}.
                </p>
                <button
                  onClick={usarModelosPadrao}
                  style={{
                    background: palette.green,
                    color: palette.greenText,
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 18px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Usar modelos padrão do segmento
                  <ArrowRight size={14} />
                </button>
              </Panel>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {fluxos.map((f) => (
                  <Panel key={f.id} style={{ padding: 16, opacity: f.ativo ? 1 : 0.5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", gap: 10, flex: 1 }}>
                        <MessageCircle
                          size={15}
                          color={segmento?.accent || palette.green}
                          style={{ flexShrink: 0, marginTop: 3 }}
                        />
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>
                            {f.gatilho}
                          </div>
                          <div style={{ fontSize: 13, color: palette.textDim, lineHeight: 1.5 }}>
                            {f.mensagem}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11.5,
                            color: palette.textFaint,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={f.ativo}
                            onChange={() => alternarAtivo(f.id, f.ativo)}
                          />
                          Ativo
                        </label>
                        <button
                          onClick={() => removerFluxo(f.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: palette.textFaint,
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Panel>
                ))}
              </div>
            )}

            <Panel style={{ padding: 18 }}>
              <div style={{ fontSize: 12.5, color: palette.textFaint, marginBottom: 10 }}>
                Adicionar novo fluxo
              </div>
              <input
                className="iz-input"
                placeholder="Gatilho (ex: Confirmação de pedido)"
                value={novoGatilho}
                onChange={(e) => setNovoGatilho(e.target.value)}
                style={{ ...inputStyle, marginBottom: 8 }}
              />
              <textarea
                className="iz-input"
                placeholder="Mensagem automática"
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                rows={2}
                style={{ ...inputStyle, resize: "vertical", marginBottom: 10, fontFamily: "inherit" }}
              />
              <button
                onClick={adicionarFluxo}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: "transparent",
                  border: `1px solid ${palette.panelBorder}`,
                  borderRadius: 10,
                  padding: "9px 14px",
                  fontSize: 13,
                  color: palette.text,
                  cursor: "pointer",
                }}
              >
                <Plus size={14} />
                Adicionar fluxo
              </button>
            </Panel>
          </>
        )}

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
              fontSize: 13,
              color: "#F09595",
            }}
          >
            <AlertCircle size={15} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
