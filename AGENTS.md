<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Regras deste projeto (Inova Zap)

- NÃO gere uma landing page nova, depoimentos, ou qualquer conteúdo de
  marketing "genérico" sem pedido explícito do dono do projeto.
- NÃO troque a stack (React + TanStack Start + Supabase). Nunca reescreva
  isto para Express/vanilla JS ou qualquer outra stack.
- As páginas reais do produto ficam em `src/routes/`, os componentes em
  `src/components/`, lógica de servidor em `src/server/`. Não crie
  estruturas paralelas.
- Preços dos planos (R$47/R$97), comissão de afiliados (25%/30%) e a
  integração com Asaas/Evolution API/Gemini já foram decididos — não
  altere sem confirmação explícita.
