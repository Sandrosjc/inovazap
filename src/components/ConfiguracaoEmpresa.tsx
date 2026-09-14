import React, { useState } from "react";
import {
  Stethoscope,
  ShoppingBag,
  Scale,
  Users,
  GraduationCap,
  Sparkles,
  Home,
  UtensilsCrossed,
  Check,
  ArrowRight,
  ArrowLeft,
  Building2,
  Clock,
  Phone,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getReferralCode } from "@/lib/referral";

type FormState = {
  nomeNegocio: string;
  nomeResponsavel: string;
  whatsapp: string;
  evolutionInstance: string;
  horarioInicio: string;
  horarioFim: string;
  foraDoHorario: boolean;
};

const palette = {
  bg: "#050B09",
  bgSoft: "#081712",
  panel: "rgba(255,255,255,0.035)",
  panelBorder: "rgba(255,255,255,0.09)",
  green: "#33F2A0",
  greenDim: "#1C8F63",
  greenText: "#0B3B29",
  purple: "#9C7BFF",
  text: "#EAF7F1",
  textDim: "#8FA79C",
  textFaint: "#5C6F67",
};

const segmentOptions = [
  { slug: "saude", label: "Saúde e clínicas", icon: Stethoscope },
  { slug: "varejo", label: "Comércio e varejo", icon: ShoppingBag },
  { slug: "juridico", label: "Advocacia e consultoria", icon: Scale },
  { slug: "servicos", label: "Serviços e prestadores", icon: Users },
  { slug: "educacao", label: "Educação e cursos", icon: GraduationCap },
  { slug: "beleza", label: "Beleza e estética", icon: Sparkles },
  { slug: "imoveis", label: "Imóveis", icon: Home },
  { slug: "alimentacao", label: "Alimentação", icon: UtensilsCrossed },
];

const steps = ["Segmento", "Dados do negócio", "Confirmação"];

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

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 18 }}>
      <span style={{ display: "block", fontSize: 12.5, color: palette.textDim, marginBottom: 7 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${palette.panelBorder}`,
  borderRadius: 10,
  padding: "10px 13px",
  fontSize: 14,
  color: palette.text,
  outline: "none",
};

export default function ConfiguracaoEmpresa() {
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    nomeNegocio: "",
    nomeResponsavel: "",
    whatsapp: "",
    evolutionInstance: "",
    horarioInicio: "08:00",
    horarioFim: "18:00",
    foraDoHorario: true,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canAdvance =
    step === 0 ? !!segment : step === 1 ? form.nomeNegocio && form.whatsapp : true;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSalvar() {
    setSaving(true);
    setSaveError(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      window.location.href = "/login";
      return;
    }

    let afiliadoId: string | null = null;
    const refCode = getReferralCode();
    if (refCode) {
      const { data: afiliadoData } = await supabase
        .from("afiliados")
        .select("id")
        .eq("codigo", refCode)
        .maybeSingle();
      afiliadoId = afiliadoData?.id ?? null;
    }

    const { error } = await supabase.from("empresas").insert({
      user_id: userData.user.id,
      segmento: segment,
      nome_negocio: form.nomeNegocio,
      nome_responsavel: form.nomeResponsavel || null,
      whatsapp: form.whatsapp,
      evolution_instance: form.evolutionInstance || null,
      horario_inicio: form.horarioInicio,
      horario_fim: form.horarioFim,
      fora_do_horario: form.foraDoHorario,
      afiliado_id: afiliadoId,
    });
    setSaving(false);
    if (error) {
      setSaveError("Não foi possível salvar. Tente novamente.");
      return;
    }
    setSaved(true);
  }

  const selected = segmentOptions.find((s) => s.slug === segment);

  return (
    <div
      style={{
        background: `radial-gradient(1100px 520px at 14% -10%, rgba(51,242,160,0.14), transparent 60%), ${palette.bg}`,
        color: palette.text,
        minHeight: "100vh",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "40px 20px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .iz-heading { font-family: 'Space Grotesk', Inter, sans-serif; }
        .iz-seg-card:hover { border-color: rgba(255,255,255,0.22); }
        .iz-input:focus { border-color: ${palette.green} !important; }
        .iz-btn-primary:hover { filter: brightness(1.06); }
        .iz-btn-ghost:hover { background: rgba(255,255,255,0.05); }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
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
              marginBottom: 14,
            }}
          >
            Configuração inicial
          </span>
          <h1 className="iz-heading" style={{ fontSize: 26, fontWeight: 600, margin: "0 0 8px" }}>
            Vamos ajustar o Inova Zap ao seu negócio
          </h1>
          <p style={{ fontSize: 14, color: palette.textDim, margin: 0 }}>
            Leva menos de 2 minutos. Você pode mudar tudo isso depois.
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28, gap: 6 }}>
          {steps.map((label, i) => (
            <React.Fragment key={label}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    background: i <= step ? palette.green : "rgba(255,255,255,0.06)",
                    color: i <= step ? palette.greenText : palette.textFaint,
                  }}
                >
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 12.5,
                    color: i <= step ? palette.text : palette.textFaint,
                    display: "none",
                  }}
                  className="iz-step-label"
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: i < step ? palette.green : palette.panelBorder,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <Panel style={{ padding: 30 }}>
          {step === 0 && (
            <>
              <h2 className="iz-heading" style={{ fontSize: 17, fontWeight: 600, margin: "0 0 4px" }}>
                Qual é o seu ramo de atuação?
              </h2>
              <p style={{ fontSize: 13, color: palette.textFaint, margin: "0 0 20px" }}>
                Isso ajusta os modelos de mensagem e agenda pro seu tipo de negócio.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                }}
              >
                {segmentOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = segment === opt.slug;
                  return (
                    <button
                      key={opt.slug}
                      onClick={() => setSegment(opt.slug)}
                      className="iz-seg-card"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "14px 12px",
                        borderRadius: 12,
                        cursor: "pointer",
                        textAlign: "left",
                        border: active
                          ? `1px solid ${palette.green}`
                          : `1px solid ${palette.panelBorder}`,
                        background: active ? "rgba(51,242,160,0.08)" : "rgba(255,255,255,0.02)",
                        color: palette.text,
                      }}
                    >
                      <Icon size={18} color={active ? palette.green : palette.textDim} />
                      <span style={{ fontSize: 12.5, lineHeight: 1.3 }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="iz-heading" style={{ fontSize: 17, fontWeight: 600, margin: "0 0 20px" }}>
                Conte sobre o seu negócio
              </h2>
              <Field label="Nome do negócio">
                <div style={{ position: "relative" }}>
                  <Building2
                    size={15}
                    color={palette.textFaint}
                    style={{ position: "absolute", left: 12, top: 12 }}
                  />
                  <input
                    className="iz-input"
                    style={{ ...inputStyle, paddingLeft: 34 }}
                    placeholder="Clínica Vida Plena"
                    value={form.nomeNegocio}
                    onChange={(e) => update("nomeNegocio", e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Número de WhatsApp para atendimento">
                <div style={{ position: "relative" }}>
                  <Phone
                    size={15}
                    color={palette.textFaint}
                    style={{ position: "absolute", left: 12, top: 12 }}
                  />
                  <input
                    className="iz-input"
                    style={{ ...inputStyle, paddingLeft: 34 }}
                    placeholder="(11) 91234-5678"
                    value={form.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Nome da instância na Evolution API">
                <input
                  className="iz-input"
                  style={inputStyle}
                  placeholder="Ex: clinica-vida-plena"
                  value={form.evolutionInstance}
                  onChange={(e) => update("evolutionInstance", e.target.value)}
                />
              </Field>
              <Field label="Nome do responsável">
                <input
                  className="iz-input"
                  style={inputStyle}
                  placeholder="Sandro"
                  value={form.nomeResponsavel}
                  onChange={(e) => update("nomeResponsavel", e.target.value)}
                />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Atendimento a partir de">
                  <div style={{ position: "relative" }}>
                    <Clock
                      size={15}
                      color={palette.textFaint}
                      style={{ position: "absolute", left: 12, top: 12 }}
                    />
                    <input
                      type="time"
                      className="iz-input"
                      style={{ ...inputStyle, paddingLeft: 34 }}
                      value={form.horarioInicio}
                      onChange={(e) => update("horarioInicio", e.target.value)}
                    />
                  </div>
                </Field>
                <Field label="Até">
                  <input
                    type="time"
                    className="iz-input"
                    style={inputStyle}
                    value={form.horarioFim}
                    onChange={(e) => update("horarioFim", e.target.value)}
                  />
                </Field>
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: palette.textDim,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.foraDoHorario}
                  onChange={(e) => update("foraDoHorario", e.target.checked)}
                />
                Responder automaticamente também fora do horário de atendimento
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="iz-heading" style={{ fontSize: 17, fontWeight: 600, margin: "0 0 20px" }}>
                Confirme os dados
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Ramo de atuação", value: selected ? selected.label : "—" },
                  { label: "Negócio", value: form.nomeNegocio || "—" },
                  { label: "Responsável", value: form.nomeResponsavel || "—" },
                  { label: "WhatsApp", value: form.whatsapp || "—" },
                  { label: "Instância Evolution API", value: form.evolutionInstance || "—" },
                  {
                    label: "Horário de atendimento",
                    value: `${form.horarioInicio} às ${form.horarioFim}`,
                  },
                  {
                    label: "Fora do horário",
                    value: form.foraDoHorario ? "Responde automaticamente" : "Não responde",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13.5,
                      paddingBottom: 12,
                      borderBottom: `1px solid ${palette.panelBorder}`,
                    }}
                  >
                    <span style={{ color: palette.textFaint }}>{row.label}</span>
                    <span style={{ fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="iz-btn-ghost"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: `1px solid ${palette.panelBorder}`,
                borderRadius: 10,
                padding: "10px 16px",
                fontSize: 13,
                color: step === 0 ? palette.textFaint : palette.textDim,
                cursor: step === 0 ? "default" : "pointer",
                opacity: step === 0 ? 0.5 : 1,
              }}
            >
              <ArrowLeft size={14} />
              Voltar
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={() => canAdvance && setStep((s) => s + 1)}
                className="iz-btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: canAdvance ? palette.green : "rgba(255,255,255,0.08)",
                  color: canAdvance ? palette.greenText : palette.textFaint,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: canAdvance ? "pointer" : "default",
                }}
              >
                Continuar
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSalvar}
                disabled={saving || saved}
                className="iz-btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: saved ? "rgba(51,242,160,0.35)" : palette.green,
                  color: palette.greenText,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving || saved ? "default" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Check size={14} />
                {saved ? "Configuração salva" : saving ? "Salvando..." : "Salvar configuração"}
              </button>
            )}
          </div>

          {saveError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 14,
                fontSize: 13,
                color: "#F09595",
              }}
            >
              <AlertCircle size={15} />
              {saveError}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
