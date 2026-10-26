export const branding = {
  name: "Cota Clara",
  shortDescription: "Gastos da Cota Parlamentar em linguagem simples.",
  description:
    "Explore dados oficiais da Cota para o Exercício da Atividade Parlamentar de forma simples, visual e verificável.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  xdPlansUrl: process.env.NEXT_PUBLIC_XD_PLANS_URL ?? "",
  officialSourceUrl: "https://dadosabertos.camara.leg.br/",
  officialApiUrl: "https://dadosabertos.camara.leg.br/api/v2",
} as const;
