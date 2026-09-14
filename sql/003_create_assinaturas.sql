create table if not exists public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  asaas_customer_id text not null,
  asaas_subscription_id text not null,
  plano text not null,
  ciclo text not null, -- 'monthly' | 'quarterly' | 'yearly'
  status text not null default 'pendente', -- pendente | ativa | atrasada | cancelada
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assinaturas enable row level security;

create policy "Dono da empresa vê a própria assinatura"
  on public.assinaturas for select
  using (
    exists (
      select 1 from public.empresas
      where empresas.id = assinaturas.empresa_id
      and empresas.user_id = auth.uid()
    )
  );

-- Inserções/atualizações de assinatura só acontecem pelo server (service role),
-- nunca direto do navegador, por isso não há policy de insert/update para
-- o usuário comum aqui.
