export interface ApiLink {
  rel: string;
  href: string;
}

export interface DeputySummary {
  id: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string | null;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email?: string | null;
}

export interface DeputyExpense {
  ano: number;
  mes: number;
  tipoDespesa: string;
  codDocumento?: number | null;
  tipoDocumento?: string | null;
  codTipoDocumento?: number | null;
  dataDocumento?: string | null;
  numDocumento?: string | null;
  valorDocumento: number;
  urlDocumento?: string | null;
  nomeFornecedor: string;
  cnpjCpfFornecedor?: string | null;
  valorLiquido: number;
  valorGlosa?: number | null;
  numRessarcimento?: string | null;
  codLote?: number | null;
  parcela?: number | null;
}

export interface DeputyDetail {
  id: number;
  uri: string;
  nomeCivil: string;
  ultimoStatus: {
    id: number;
    uri: string;
    nome: string;
    siglaPartido: string;
    uriPartido: string | null;
    siglaUf: string;
    idLegislatura: number;
    urlFoto: string;
    email?: string | null;
    situacao?: string;
  };
  cpf?: string;
  sexo?: string;
  urlWebsite?: string | null;
}

export interface ApiListResponse<T> {
  dados: T[];
  links: ApiLink[];
}

export interface ApiItemResponse<T> {
  dados: T;
  links?: ApiLink[];
}
