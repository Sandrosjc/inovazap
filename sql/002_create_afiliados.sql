-- Cadastro de afiliados
create table if not exists public.afiliados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  codigo text not null unique,
  comissao_percentual numeric not null default 25,
  elite boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.afiliados enable row level security;

create policy "Afiliado vê o próprio cadastro"
  on public.afiliados for select
  using (auth.uid() = user_id);

create policy "Usuário pode virar afiliado"
  on public.afiliados for insert
  with check (auth.uid() = user_id);

-- Vínculo: qual afiliado trouxe qual empresa (preenchido no cadastro,
-- a partir do código de indicação salvo no link/cookie)
alter table public.empresas
  add column if not exists afiliado_id uuid references public.afiliados(id) on delete set null;

-- Gera um código de indicação simples e legível, ex: sandro-a1b2
create or replace function public.gerar_codigo_afiliado(p_user_id uuid)
returns text
language plpgsql
as $$
declare
  base text;
  sufixo text;
begin
  select coalesce(split_part(email, '@', 1), 'afiliado') into base
  from auth.users where id = p_user_id;
  sufixo := substr(md5(random()::text), 1, 4);
  return lower(regexp_replace(base, '[^a-zA-Z0-9]', '', 'g')) || '-' || sufixo;
end;
$$;

-- Função seletiva: devolve só o necessário para o painel do afiliado
-- (nunca expõe whatsapp, nome do responsável etc. das empresas indicadas)
create or replace function public.minhas_indicacoes()
returns table (
  nome_negocio text,
  segmento text,
  criado_em timestamptz
)
language sql
security definer
set search_path = public
as $$
  select e.nome_negocio, e.segmento, e.created_at
  from public.empresas e
  join public.afiliados a on a.id = e.afiliado_id
  where a.user_id = auth.uid()
  order by e.created_at desc;
$$;

grant execute on function public.minhas_indicacoes() to authenticated;
grant execute on function public.gerar_codigo_afiliado(uuid) to authenticated;
