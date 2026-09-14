-- Substitui minhas_indicacoes() para incluir plano e status da assinatura,
-- permitindo calcular a comissão estimada no painel do afiliado.
create or replace function public.minhas_indicacoes()
returns table (
  nome_negocio text,
  segmento text,
  criado_em timestamptz,
  plano text,
  status_assinatura text
)
language sql
security definer
set search_path = public
as $$
  select
    e.nome_negocio,
    e.segmento,
    e.created_at,
    a.plano,
    a.status
  from public.empresas e
  join public.afiliados af on af.id = e.afiliado_id
  left join lateral (
    select plano, status
    from public.assinaturas
    where assinaturas.empresa_id = e.id
    order by created_at desc
    limit 1
  ) a on true
  where af.user_id = auth.uid()
  order by e.created_at desc;
$$;

grant execute on function public.minhas_indicacoes() to authenticated;
