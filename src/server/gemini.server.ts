// Roda só no servidor. Nunca importe este arquivo em um componente.
//
// Lê as chaves do Gemini de GEMINI_API_KEYS, separadas por vírgula, ex:
// GEMINI_API_KEYS="chave1,chave2,chave3,chave4,chave5,chave6"
//
// Alterna entre elas (round-robin) e, se uma falhar (limite de requisição
// ou erro), tenta a próxima automaticamente antes de desistir.

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function getKeys(): string[] {
  const raw = process.env.GEMINI_API_KEYS || "";
  const keys = raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (keys.length === 0) {
    throw new Error("Falta GEMINI_API_KEYS no .env do servidor");
  }
  return keys;
}

// Índice compartilhado em memória do processo, só para distribuir a carga
// entre as chaves — não precisa ser perfeito entre reinícios do servidor.
let cursor = 0;

export type MensagemHistorico = {
  remetente: "cliente" | "ia" | "humano";
  conteudo: string;
};

type GerarRespostaInput = {
  nomeNegocio: string;
  segmentoLabel: string;
  fluxos: { gatilho: string; mensagem: string }[];
  historico: MensagemHistorico[];
  mensagemAtual: string;
};

function montarSystemInstruction(input: GerarRespostaInput) {
  const exemplos = input.fluxos
    .map((f) => `- Gatilho "${f.gatilho}": ${f.mensagem}`)
    .join("\n");

  return [
    `Você é o atendimento automático via WhatsApp do negócio "${input.nomeNegocio}", do ramo ${input.segmentoLabel}.`,
    "Responda de forma curta, natural e educada, como um atendente humano digitando no WhatsApp — sem parecer um robô.",
    "Use o histórico da conversa para manter contexto e não repetir perguntas já respondidas.",
    exemplos
      ? `Use estes modelos como guia de tom e do que o negócio costuma responder (adapte, não copie literalmente):\n${exemplos}`
      : "",
    "Se não souber responder algo com segurança, diga que vai verificar e chamar um atendente humano.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function chamarGemini(apiKey: string, body: unknown) {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text();
    const err = new Error(`Gemini respondeu ${res.status}: ${errBody}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function gerarRespostaIA(input: GerarRespostaInput): Promise<string> {
  const keys = getKeys();
  const systemInstruction = montarSystemInstruction(input);

  const contents = [
    ...input.historico.map((m) => ({
      role: m.remetente === "cliente" ? "user" : "model",
      parts: [{ text: m.conteudo }],
    })),
    { role: "user", parts: [{ text: input.mensagemAtual }] },
  ];

  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents,
  };

  let ultimoErro: unknown = null;

  // Tenta cada chave, começando de onde parou da última vez (round-robin)
  for (let tentativa = 0; tentativa < keys.length; tentativa++) {
    const key = keys[(cursor + tentativa) % keys.length];
    try {
      const data = await chamarGemini(key, body);
      cursor = (cursor + tentativa + 1) % keys.length;
      const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!texto) {
        throw new Error("Gemini não retornou texto na resposta");
      }
      return texto.trim();
    } catch (e) {
      ultimoErro = e;
      const status = (e as { status?: number })?.status;
      // 429 = limite de requisição, 403 = chave sem permissão/inválida.
      // Nesses casos vale tentar a próxima chave. Outros erros, também
      // tentamos a próxima antes de desistir — mas paramos se já testamos todas.
      continue;
    }
  }

  throw ultimoErro instanceof Error
    ? ultimoErro
    : new Error("Não foi possível gerar resposta com nenhuma das chaves do Gemini");
}
