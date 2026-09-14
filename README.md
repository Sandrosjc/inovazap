# Inova Zap — pacote completo para colar no projeto

Este pacote agora inclui TUDO que o projeto precisa pra buildar: as páginas
e integrações que construímos, MAIS os arquivos de estrutura do TanStack
Start (`router.tsx`, `routes/__root.tsx`, `server.ts`, `styles.css`,
`lib/utils.ts`) que faltavam.

## 1. Substituir os arquivos
Copie TODO o conteúdo deste pacote para dentro do seu repositório,
substituindo o que existir com o mesmo nome (inclusive `package.json`,
`vite.config.ts`, `tsconfig.json` — o repositório atual está com uma
stack diferente da nossa e precisa voltar a ser TanStack Start).

## 2. Instalar dependências
```
bun install
```

## 2. Rodar o SQL, em ordem
No SQL Editor do Lovable Cloud (ou Supabase), rode nesta ordem:
1. `sql/001_create_empresas.sql`
2. `sql/002_create_afiliados.sql`
3. `sql/003_create_assinaturas.sql`
4. `sql/004_create_mensagens.sql`
5. `sql/005_atualizar_minhas_indicacoes.sql`
6. `sql/006_corrigir_permissoes_afiliados.sql`

## 3. Variáveis de ambiente
No `.env` do projeto (Lovable Cloud já injeta `VITE_SUPABASE_URL` e
`VITE_SUPABASE_PUBLISHABLE_KEY` automaticamente). Adicione também:

```
SUPABASE_URL=...                 # igual ao VITE_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=...    # Supabase > Project Settings > API > service_role
ASAAS_API_KEY=...                # Asaas > Integrações > API Key
ASAAS_ENV=sandbox                # troque para "production" quando for cobrar de verdade
ASAAS_WEBHOOK_TOKEN=...          # invente um token qualquer
EVOLUTION_API_URL=...            # ex: https://sua-evolution.onrender.com
EVOLUTION_API_KEY=...            # a "AUTHENTICATION_API_KEY" da sua Evolution API
GEMINI_API_KEYS=chave1,chave2,chave3,chave4,chave5,chave6
```

Nenhuma dessas variáveis leva o prefixo `VITE_` de propósito — são segredo
de servidor e não podem aparecer no navegador.

**Importante:** como essas chaves passaram por uma conversa de chat,
regenere todas elas nos respectivos painéis (Asaas, Evolution API,
Google AI Studio) antes de colocar em produção, e cole os valores novos
direto nas variáveis de ambiente — nunca em mensagem.

## 3.1 Conectar um negócio à Evolution API
No wizard de `/configuracao`, o campo "Nome da instância na Evolution
API" deve ser exatamente igual ao nome da instância criada no seu
servidor Evolution (é assim que o webhook sabe qual empresa responder).
Configure o webhook dessa instância para apontar para
`https://SEU-DOMINIO/api/webhooks/evolution`, escutando o evento
`messages.upsert`.

## 4. Ativar login (Google/Microsoft/Apple)
No painel do Supabase: Authentication > Providers, ative os provedores que
quiser usar (o `Login.tsx` já está pronto para os três).

## 5. Configurar o webhook do Asaas
No painel do Asaas: Integrações > Webhooks, cadastre a URL
`https://SEU-DOMINIO/api/webhooks/asaas`, selecione os eventos de
pagamento (PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE,
PAYMENT_DELETED) e use o mesmo valor de `ASAAS_WEBHOOK_TOKEN` como token
de acesso do webhook.

## 6. Publicar
`bun run dev` para testar local. Depois, dê push para o branch conectado
ao Lovable — ele sincroniza sozinho e publica no subdomínio
`SEUPROJETO.lovable.app`.

## O que ainda depende de você (fora do código)
- Criar conta no Asaas e pegar a API key
- Ativar os provedores de login no Supabase
- Rodar os 3 arquivos SQL
- Decidir se/quando sair do sandbox do Asaas para produção

## Mapa do que cada tela faz
| Rota | Arquivo | Precisa de login? |
|---|---|---|
| `/` | Painel principal | Não (mostra "Visitante" se não logado) |
| `/login` | Entrar com Google/Microsoft/Apple | — |
| `/configuracao` | Wizard de configuração do negócio | Sim |
| `/profissoes` | Fluxos de mensagem por segmento | Sim |
| `/planos` | Planos e checkout (Asaas) | Só no momento de assinar |
| `/afiliados` | Página pública do programa de afiliados | Não |
| `/afiliados/painel` | Link, indicações e comissão do afiliado | Sim |
| `/api/webhooks/asaas` | Recebe status de pagamento do Asaas | (chamado pelo Asaas, não por pessoas) |
| `/api/webhooks/evolution` | Recebe mensagem do WhatsApp e responde com a IA | (chamado pela Evolution API, não por pessoas) |
