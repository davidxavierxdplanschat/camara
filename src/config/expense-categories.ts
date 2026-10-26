const CATEGORY_RULES: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern: /PASSAG|BILHETE A.REO|LOCOMO..O|T.XI|PED.GIO|ESTACIONAMENTO/i,
    label: "Viagens e passagens",
  },
  { pattern: /COMBUST.V|LUBRIFICANTE/i, label: "Combustíveis" },
  {
    pattern: /MANUTEN..O DE ESCRIT.RIO|ESCRIT.RIO DE APOIO/i,
    label: "Escritório parlamentar",
  },
  { pattern: /DIVULGA..O DA ATIVIDADE/i, label: "Divulgação" },
  {
    pattern: /TELEFONIA|INTERNET|ASSINATURA DE LINHAS/i,
    label: "Telefone e internet",
  },
  { pattern: /SERVI.OS POSTAIS|CORREIO/i, label: "Correios e entregas" },
  {
    pattern: /CONSULTORIA|PESQUISA|TRABALHO T.CNICO/i,
    label: "Consultorias e serviços técnicos",
  },
  { pattern: /SEGURAN.A|VIGIL.NCIA/i, label: "Segurança" },
  { pattern: /HOSPEDAGEM|ALIMENTA..O/i, label: "Hospedagem e alimentação" },
  {
    pattern: /LOCA..O.*VE.CULO|FRETAMENTO|EMBARCA..O/i,
    label: "Aluguel de veículos",
  },
  { pattern: /ASSINATURA.*PUBLICA|PUBLICA..ES|LIVROS/i, label: "Publicações" },
];

export function citizenCategory(officialName: string): string {
  const normalized = officialName
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return (
    CATEGORY_RULES.find(({ pattern }) => pattern.test(normalized))?.label ??
    "Outras despesas"
  );
}

export function categoryWithOfficialName(officialName: string) {
  return { label: citizenCategory(officialName), officialName };
}
