-- Liga cada empresa a uma instância da Evolution API (o mesmo servidor
-- Evolution pode ter várias instâncias, uma por número de WhatsApp).
alter table public.empresas
  add column if not exists evolution_instance text unique;

-- Histórico de conversas, usado para dar contexto à IA a cada nova mensagem
create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  telefone_contato text not null,
  remetente text not null check (remetente in ('cliente', 'ia', 'humano')),
  conteudo text not null,
  created_at timestamptz not null default now()
);

create index if not exists mensagens_empresa_contato_idx
  on public.mensagens (empresa_id, telefone_contato, created_at desc);

alter table public.mensagens enable row level security;

create policy "Dono da empresa vê as próprias mensagens"
  on public.mensagens for select
  using (
    exists (
      select 1 from public.empresas
      where empresas.id = mensagens.empresa_id
      and empresas.user_id = auth.uid()
    )
  );

-- Inserções de mensagem acontecem só pelo webhook (service role),
-- por isso não há policy de insert para usuário comum aqui.
