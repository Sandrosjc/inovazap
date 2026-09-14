-- Empresas cadastradas pelos usuários no wizard de configuração
create table if not exists public.empresas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  segmento text not null,
  nome_negocio text not null,
  nome_responsavel text,
  whatsapp text not null,
  horario_inicio time not null default '08:00',
  horario_fim time not null default '18:00',
  fora_do_horario boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fluxos de mensagem automática associados a uma empresa
-- (gatilho -> mensagem), vinculados ao segmento escolhido
create table if not exists public.fluxos_mensagem (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  gatilho text not null,
  mensagem text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.empresas enable row level security;
alter table public.fluxos_mensagem enable row level security;

-- Cada usuário só vê e edita as próprias empresas
create policy "Usuários veem as próprias empresas"
  on public.empresas for select
  using (auth.uid() = user_id);

create policy "Usuários criam suas próprias empresas"
  on public.empresas for insert
  with check (auth.uid() = user_id);

create policy "Usuários atualizam as próprias empresas"
  on public.empresas for update
  using (auth.uid() = user_id);

create policy "Usuários apagam as próprias empresas"
  on public.empresas for delete
  using (auth.uid() = user_id);

-- Fluxos seguem a permissão da empresa dona
create policy "Usuários veem fluxos das próprias empresas"
  on public.fluxos_mensagem for select
  using (
    exists (
      select 1 from public.empresas
      where empresas.id = fluxos_mensagem.empresa_id
      and empresas.user_id = auth.uid()
    )
  );

create policy "Usuários criam fluxos nas próprias empresas"
  on public.fluxos_mensagem for insert
  with check (
    exists (
      select 1 from public.empresas
      where empresas.id = fluxos_mensagem.empresa_id
      and empresas.user_id = auth.uid()
    )
  );

create policy "Usuários atualizam fluxos das próprias empresas"
  on public.fluxos_mensagem for update
  using (
    exists (
      select 1 from public.empresas
      where empresas.id = fluxos_mensagem.empresa_id
      and empresas.user_id = auth.uid()
    )
  );

create policy "Usuários apagam fluxos das próprias empresas"
  on public.fluxos_mensagem for delete
  using (
    exists (
      select 1 from public.empresas
      where empresas.id = fluxos_mensagem.empresa_id
      and empresas.user_id = auth.uid()
    )
  );
