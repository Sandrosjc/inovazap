import { createClient } from "@supabase/supabase-js";

// ATENÇÃO: usa a service_role key (Project Settings > API no Supabase/Lovable
// Cloud). Essa chave ignora RLS — por isso este arquivo só pode ser
// importado dentro de createServerFn (código de servidor), nunca em
// componentes ou hooks do lado do cliente.
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env do servidor");
  }
  return createClient(url, serviceKey);
}
