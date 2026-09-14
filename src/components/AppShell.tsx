import React, { useEffect } from "react";
import {
  Zap,
  LayoutGrid,
  Settings,
  Puzzle,
  BarChart3,
  Users2,
  CircleUser,
  LogOut,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { captureReferralCode } from "@/lib/referral";

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

const navItems = [
  { label: "Visão geral", href: "/", icon: LayoutGrid },
  { label: "Configuração", href: "/configuracao", icon: Settings },
  { label: "Motor de profissões", href: "/profissoes", icon: Puzzle },
  { label: "Planos", href: "/planos", icon: BarChart3 },
  { label: "Programa de afiliados", href: "/afiliados", icon: Users2 },
  { label: "Meu link de afiliado", href: "/afiliados/painel", icon: Users2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const displayName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user?.email ||
    "Visitante";

  useEffect(() => {
    captureReferralCode();
  }, []);

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  return (
    <div
      style={{
        background: palette.bg,
        minHeight: "100vh",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .iz-heading { font-family: 'Space Grotesk', Inter, sans-serif; }
        .iz-nav-item:hover { background: rgba(255,255,255,0.05); }
      `}</style>

      <div style={{ display: "flex", maxWidth: 1360, margin: "0 auto" }}>
        <aside
          style={{
            width: 232,
            flexShrink: 0,
            padding: "28px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            borderRight: `1px solid ${palette.panelBorder}`,
            minHeight: "100vh",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px 28px" }}>
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
              <div className="iz-heading" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.1, color: palette.text }}>
                Inova Zap
              </div>
              <div style={{ fontSize: 11, color: palette.textFaint }}>Atendimento para todo negócio</div>
            </div>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className="iz-nav-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: active ? "rgba(51,242,160,0.12)" : "transparent",
                  color: active ? palette.green : palette.textDim,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <Icon size={17} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}

          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${palette.panelBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px 10px" }}>
              <CircleUser size={20} color={palette.textDim} />
              <div style={{ fontSize: 12.5, color: palette.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {loading ? "Carregando..." : user ? displayName : "Visitante"}
              </div>
            </div>
            {!loading && user ? (
              <button
                onClick={handleSignOut}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  boxSizing: "border-box",
                  background: "transparent",
                  border: "none",
                  color: palette.textFaint,
                  fontSize: 12.5,
                  padding: "8px 10px",
                  cursor: "pointer",
                }}
              >
                <LogOut size={13} />
                Sair
              </button>
            ) : !loading ? (
              <Link
                to="/login"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  fontSize: 12.5,
                  color: palette.green,
                  textDecoration: "none",
                }}
              >
                Entrar
              </Link>
            ) : null}
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}
