-- Corrige dois bugs de permissão encontrados na revisão:

-- 1) gerar_codigo_afiliado precisa ler auth.users, mas sem "security definer"
--    o Supabase bloqueia esse acesso para o usuário comum.
create or replace function public.gerar_codigo_afiliado(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
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

-- 2) Quem se cadastra a partir de um link de afiliado precisa conseguir
--    resolver o "codigo" pra descobrir o afiliado_id — mas a única policy
--    de select existente só permite o próprio afiliado ver a si mesmo.
--    Como o código de indicação é, por natureza, algo feito pra ser
--    compartilhado publicamente, liberamos a leitura da tabela toda.
create policy "Qualquer usuário autenticado pode resolver um código de indicação"
  on public.afiliados for select
  to authenticated
  using (true);
