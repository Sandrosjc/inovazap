import React, { useState } from "react";
import { Zap, AlertCircle } from "lucide-react";
import { lovableAuth } from "@/lib/lovableAuth";
import { supabase } from "@/lib/supabaseClient";

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

type Provider = "google" | "microsoft" | "apple";

const providers: { id: Provider; label: string; swatch: string }[] = [
  { id: "google", label: "Continuar com Google", swatch: "#4FC3F5" },
  { id: "microsoft", label: "Continuar com Microsoft", swatch: "#33F2A0" },
  { id: "apple", label: "Continuar com Apple", swatch: "#9C7BFF" },
];

export default function Login() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(provider: Provider) {
    setError(null);
    setLoadingProvider(provider);
    const result = await lovableAuth.signInWithOAuth(provider);

    if (result.redirected) {
      // a página está navegando para o provedor OAuth
      return;
    }
    if (result.error) {
      setError("Não foi possível entrar. Tente novamente.");
      setLoadingProvider(null);
      return;
    }

    await supabase.auth.setSession(result.tokens);
    window.location.href = "/configuracao";
  }

  return (
    <div
      style={{
        background: `radial-gradient(1100px 520px at 50% -10%, rgba(51,242,160,0.14), transparent 60%), ${palette.bg}`,
        color: palette.text,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: 20,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .iz-heading { font-family: 'Space Grotesk', Inter, sans-serif; }
        .iz-provider-btn:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.04); }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: palette.panel,
          border: `1px solid ${palette.panelBorder}`,
          borderRadius: 18,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          padding: "34px 30px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: palette.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={18} color={palette.greenText} fill={palette.greenText} />
          </div>
          <div>
            <div className="iz-heading" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.1 }}>
              Inova Zap
            </div>
            <div style={{ fontSize: 11, color: palette.textFaint }}>
              Atendimento para todo negócio
            </div>
          </div>
        </div>

        <h1 className="iz-heading" style={{ fontSize: 19, fontWeight: 600, margin: "0 0 6px" }}>
          Entrar
        </h1>
        <p style={{ fontSize: 13.5, color: palette.textDim, margin: "0 0 24px" }}>
          Entre para configurar e acompanhar o atendimento do seu negócio.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSignIn(p.id)}
              disabled={loadingProvider !== null}
              className="iz-provider-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                boxSizing: "border-box",
                background: "transparent",
                border: `1px solid ${palette.panelBorderStrong}`,
                borderRadius: 10,
                padding: "11px 14px",
                fontSize: 13.5,
                fontWeight: 500,
                color: palette.text,
                cursor: loadingProvider !== null ? "default" : "pointer",
                opacity: loadingProvider && loadingProvider !== p.id ? 0.5 : 1,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: p.swatch,
                  flexShrink: 0,
                }}
              />
              {loadingProvider === p.id ? "Entrando..." : p.label}
            </button>
          ))}
        </div>

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

        <p style={{ fontSize: 11.5, color: palette.textFaint, marginTop: 22, textAlign: "center" }}>
          Ao continuar, você concorda com os termos de uso do Inova Zap.
        </p>
      </div>
    </div>
  );
}
