import { z } from "zod";

export const apiLinkSchema = z.object({
  rel: z.string(),
  href: z.string().url(),
});

export const deputySummarySchema = z.object({
  id: z.number().int(),
  uri: z.string(),
  nome: z.string(),
  siglaPartido: z.string(),
  uriPartido: z.string().nullable(),
  siglaUf: z.string(),
  idLegislatura: z.number().int(),
  urlFoto: z.string(),
  email: z.string().nullable().optional(),
});

export const deputyExpenseSchema = z.object({
  ano: z.number().int(),
  mes: z.number().int().min(1).max(12),
  tipoDespesa: z.string(),
  codDocumento: z.number().nullable().optional(),
  tipoDocumento: z.string().nullable().optional(),
  codTipoDocumento: z.number().nullable().optional(),
  dataDocumento: z.string().nullable().optional(),
  numDocumento: z.string().nullable().optional(),
  valorDocumento: z.number(),
  urlDocumento: z.string().nullable().optional(),
  nomeFornecedor: z.string(),
  cnpjCpfFornecedor: z.string().nullable().optional(),
  valorLiquido: z.number(),
  valorGlosa: z.number().nullable().optional(),
  numRessarcimento: z.string().nullable().optional(),
  codLote: z.number().nullable().optional(),
  parcela: z.number().nullable().optional(),
});

export const deputyDetailSchema = z.object({
  id: z.number().int(),
  uri: z.string(),
  nomeCivil: z.string(),
  ultimoStatus: deputySummarySchema.extend({ situacao: z.string().optional() }),
  cpf: z.string().optional(),
  sexo: z.string().optional(),
  urlWebsite: z.string().nullable().optional(),
});

export function listSchema<T extends z.ZodType>(item: T) {
  return z.object({
    dados: z.array(item),
    links: z.array(apiLinkSchema).default([]),
  });
}

export function itemSchema<T extends z.ZodType>(item: T) {
  return z.object({ dados: item, links: z.array(apiLinkSchema).optional() });
}
