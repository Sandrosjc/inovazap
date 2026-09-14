import {
  Stethoscope,
  ShoppingBag,
  Scale,
  Users,
  GraduationCap,
  Sparkles,
  Home,
  UtensilsCrossed,
} from "lucide-react";

export const professionDefaults = {
  saude: {
    label: "Saúde e clínicas",
    icon: Stethoscope,
    accent: "#4FC3F5",
    templates: [
      { gatilho: "Confirmação de consulta", mensagem: "Olá {nome}! Sua consulta é amanhã às {hora}. Confirma presença?" },
      { gatilho: "Falta do paciente", mensagem: "Notamos que você não pôde comparecer. Quer reagendar para esta semana?" },
    ],
  },
  varejo: {
    label: "Comércio e varejo",
    icon: ShoppingBag,
    accent: "#33F2A0",
    templates: [
      { gatilho: "Carrinho abandonado", mensagem: "Vi que você separou uns itens mas não fechou o pedido. Posso ajudar a finalizar?" },
      { gatilho: "Chegada de estoque", mensagem: "O produto que você perguntou chegou! Quer que eu separe um pra você?" },
    ],
  },
  juridico: {
    label: "Advocacia e consultoria",
    icon: Scale,
    accent: "#9C7BFF",
    templates: [
      { gatilho: "Triagem inicial", mensagem: "Pra te direcionar ao advogado certo, me conta em uma frase qual é o seu caso." },
      { gatilho: "Proposta sem resposta", mensagem: "Sua proposta está pronta há 3 dias. Quer que eu agende uma ligação pra tirar dúvidas?" },
    ],
  },
  servicos: {
    label: "Serviços e prestadores",
    icon: Users,
    accent: "#FFB454",
    templates: [
      { gatilho: "Pedido de orçamento", mensagem: "Pra te passar um orçamento, me diz: qual é o problema e o endereço?" },
      { gatilho: "Confirmação de visita", mensagem: "Confirmando: amanhã às {hora} estarei aí pra fazer o serviço." },
    ],
  },
  educacao: {
    label: "Educação e cursos",
    icon: GraduationCap,
    accent: "#F09595",
    templates: [
      { gatilho: "Lembrete de aula", mensagem: "Sua próxima aula é hoje às {hora}. O material já está no link abaixo." },
      { gatilho: "Aluno inativo", mensagem: "Faz um tempo que você não acessa o curso. Posso te ajudar a retomar?" },
    ],
  },
  beleza: {
    label: "Beleza e estética",
    icon: Sparkles,
    accent: "#ED93B1",
    templates: [
      { gatilho: "Horários disponíveis", mensagem: "Temos horário quinta às 15h ou sexta às 11h. Qual prefere?" },
      { gatilho: "Lembrete de retorno", mensagem: "Já faz {semanas} semanas desde o seu último atendimento. Bora marcar o retorno?" },
    ],
  },
  imoveis: {
    label: "Imóveis",
    icon: Home,
    accent: "#EF9F27",
    templates: [
      { gatilho: "Qualificação de interessado", mensagem: "Pra te mostrar os imóveis certos: qual bairro e faixa de valor você procura?" },
      { gatilho: "Novo imóvel compatível", mensagem: "Chegou um imóvel novo que combina com o que você buscava. Quer ver?" },
    ],
  },
  alimentacao: {
    label: "Alimentação",
    icon: UtensilsCrossed,
    accent: "#BA7517",
    templates: [
      { gatilho: "Status do pedido", mensagem: "Seu pedido saiu para entrega e chega em cerca de {min} minutos." },
      { gatilho: "Confirmação de reserva", mensagem: "Mesa confirmada para {qtd} pessoas às {hora}. Te esperamos!" },
    ],
  },
};
