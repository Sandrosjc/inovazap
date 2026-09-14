import {
  createStartHandler,
  defaultStreamHandler,
  defineHandlerCallback,
} from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";

// Wrapper de erro de SSR: garante que uma falha ao renderizar uma rota no
// servidor vira uma resposta 500 legível, em vez de derrubar o processo.
const handlerComErro = defineHandlerCallback(async (ctx) => {
  try {
    return await defaultStreamHandler(ctx);
  } catch (error) {
    console.error("Erro de SSR:", error);
    return new Response("Erro interno ao renderizar a página.", { status: 500 });
  }
});

const fetch = createStartHandler(handlerComErro);

export default createServerEntry({
  fetch,
});
