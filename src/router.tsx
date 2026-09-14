import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// O TanStack Start exige uma função getRouter que devolve uma nova
// instância do router a cada chamada (uma por request no servidor).
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
  });
}
