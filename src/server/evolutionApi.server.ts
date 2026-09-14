// Roda só no servidor. Nunca importe este arquivo em um componente.

function getConfig() {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("Faltam EVOLUTION_API_URL / EVOLUTION_API_KEY no .env do servidor");
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey };
}

export async function enviarMensagemWhatsapp(params: {
  instance: string;
  numero: string; // com DDI, ex: 5511999999999
  texto: string;
}) {
  const { baseUrl, apiKey } = getConfig();

  const res = await fetch(`${baseUrl}/message/sendText/${params.instance}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify({
      number: params.numero,
      text: params.texto,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Evolution API respondeu ${res.status} ao enviar mensagem: ${body}`);
  }

  return res.json();
}
