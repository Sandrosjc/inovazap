// @lovable.dev/vite-tanstack-config já inclui o seguinte — NÃO adicione
// manualmente ou o app quebra com plugins duplicados:
//   - TanStack devtools (dev-only, primeiro), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only usando cloudflare como alvo padrão), injeção de env VITE_*,
//     alias @, dedupe React/TanStack, plugins de log de erro, e detecção de sandbox
//     (porta/host/strictPort).
// Passe config adicional via defineConfig({ vite: { ... }, etc... }) se precisar.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redireciona o server entry embutido do TanStack Start para src/server.ts
    // (nosso wrapper de erro de SSR). nitro/vite fazem o build a partir disso.
    server: { entry: "server" },
  },
});
