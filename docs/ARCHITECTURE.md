# Arquitetura

## Visão geral

O Cota Clara usa Next.js App Router. Páginas e agregações são renderizadas no servidor; componentes cliente são reservados à busca interativa e aos gráficos.

```text
Navegador
  ├─ páginas Server Components
  └─ /api/* (dados normalizados)
          │
          ├─ snapshot agregado anual → dashboard nacional
          └─ cliente Câmara v2 → busca e perfil individual
```

## Camadas

- `src/app`: páginas, estados globais e Route Handlers.
- `src/components`: componentes por domínio e elementos visuais.
- `src/config`: identidade e tradução de categorias.
- `src/lib/api`: cliente HTTP, schemas, paginação e limite de concorrência.
- `src/lib/aggregations`: regras puras de agregação do dashboard.
- `src/lib/services`: orquestração de busca, perfil e despesas.
- `src/data`: retratos anuais agregados, derivados da fonte oficial.
- `scripts`: atualização reprodutível dos dados nacionais.

## Resiliência

Cada chamada usa timeout com `AbortController`, até três retentativas com backoff exponencial e jitter, e respeita `Retry-After`. Respostas externas são validadas com Zod. Requisições iguais em andamento são deduplicadas; o cache nativo do Next usa revalidação de uma hora para despesas e busca e de um dia para cadastro.

A paginação segue apenas o link `next`, registra URLs visitadas e termina no limite defensivo configurado. A fila limita a concorrência a três chamadas por padrão.

## Dados nacionais

O CSV anual é processado em streaming. O artefato retém apenas deputado, partido, UF, mês, categoria e soma líquida. O navegador nunca recebe o arquivo bruto. Essa decisão reduz custo, latência e risco de indisponibilidade sem apresentar dados simulados.
