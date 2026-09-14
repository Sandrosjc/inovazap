// src/routes/api/webhooks/evolution.ts
//
// Configure esta URL (https://seudominio.com/api/webhooks/evolution) como
// webhook da sua instância na Evolution API, escutando o evento
// "messages.upsert".

import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseAdmin } from "../../../server/supabaseAdmin.server";
import { gerarRespostaIA, type MensagemHistorico } from "../../../server/gemini.server";
import { enviarMensagemWhatsapp } from "../../../server/evolutionApi.server";

const SEGMENT_LABELS: Record<string, string> = {
  saude: "saúde e clínicas",
  varejo: "comércio e varejo",
  juridico: "advocacia e consultoria",
  servicos: "serviços e prestadores",
  educacao: "educação e cursos",
  beleza: "beleza e estética",
  imoveis: "imóveis",
  alimentacao: "alimentação",
};

function extrairTexto(mensagem: any): string | null {
  return (
    mensagem?.conversation ||
    mensagem?.extendedTextMessage?.text ||
    mensagem?.buttonsResponseMessage?.selectedDisplayText ||
    mensagem?.listResponseMessage?.title ||
    null
  );
}

export const Route = createFileRoute("/api/webhooks/evolution")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();

        if (body?.event !== "messages.upsert") {
          return new Response("ignorado", { status: 200 });
        }

        const data = body?.data;
        // Ignora mensagens que o próprio número da empresa enviou
        // (senão a IA entraria em loop respondendo a si mesma).
        if (!data || data.key?.fromMe) {
          return new Response("ignorado", { status: 200 });
        }

        const texto = extrairTexto(data.message);
        const numeroCompleto: string | undefined = data.key?.remoteJid;
        const instance: string | undefined = body?.instance;

        if (!texto || !numeroCompleto || !instance) {
          return new Response("payload incompleto", { status: 200 });
        }

        const numero = numeroCompleto.replace("@s.whatsapp.net", "").replace("@g.us", "");

        const admin = getSupabaseAdmin();

        const { data: empresa } = await admin
          .from("empresas")
          .select("id, nome_negocio, segmento")
          .eq("evolution_instance", instance)
          .maybeSingle();

        if (!empresa) {
          return new Response("empresa não encontrada para esta instância", { status: 200 });
        }

        // Salva a mensagem recebida
        await admin.from("mensagens").insert({
          empresa_id: empresa.id,
          telefone_contato: numero,
          remetente: "cliente",
          conteudo: texto,
        });

        // Busca as últimas mensagens da conversa (contexto)
        const { data: historicoRaw } = await admin
          .from("mensagens")
          .select("remetente, conteudo, created_at")
          .eq("empresa_id", empresa.id)
          .eq("telefone_contato", numero)
          .order("created_at", { ascending: false })
          .limit(12);

        const historico: MensagemHistorico[] = (historicoRaw || [])
          .reverse()
          .slice(0, -1) // a última é a mensagem atual, que já vai separada
          .map((m) => ({ remetente: m.remetente as MensagemHistorico["remetente"], conteudo: m.conteudo }));

        // Busca os modelos de mensagem ativos do segmento, como guia de tom
        const { data: fluxos } = await admin
          .from("fluxos_mensagem")
          .select("gatilho, mensagem")
          .eq("empresa_id", empresa.id)
          .eq("ativo", true);

        let resposta: string;
        try {
          resposta = await gerarRespostaIA({
            nomeNegocio: empresa.nome_negocio,
            segmentoLabel: SEGMENT_LABELS[empresa.segmento] || empresa.segmento,
            fluxos: fluxos || [],
            historico,
            mensagemAtual: texto,
          });
        } catch (e) {
          console.error("Erro ao gerar resposta com Gemini:", e);
          resposta =
            "Recebemos sua mensagem! Nosso time vai te responder em instantes.";
        }

        try {
          await enviarMensagemWhatsapp({ instance, numero, texto: resposta });
          await admin.from("mensagens").insert({
            empresa_id: empresa.id,
            telefone_contato: numero,
            remetente: "ia",
            conteudo: resposta,
          });
        } catch (e) {
          console.error("Erro ao enviar mensagem via Evolution API:", e);
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
