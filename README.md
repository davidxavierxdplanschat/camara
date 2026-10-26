# Cota Clara

Aplicação web mobile-first que transforma os dados oficiais da Cota para o Exercício da Atividade Parlamentar (CEAP) em informações simples, visuais e verificáveis.

> Projeto independente. Não representa oficialmente a Câmara dos Deputados. A interface apresenta registros publicados pela fonte oficial sem emitir juízo sobre parlamentares ou despesas.

## O que o MVP entrega

- dashboard nacional com filtros por ano, mês, partido e UF;
- resumo do período, Top 5 e distribuição por categorias em linguagem cidadã;
- busca de deputados com debounce e navegação por teclado;
- página individual com evolução mensal, categorias e principais fornecedores;
- camada BFF em Route Handlers do Next.js;
- cliente oficial com validação Zod, timeout, deduplicação, cache, paginação, concorrência limitada e retries para HTTP 429/5xx;
- estados de loading, vazio, erro e 404;
- metadados, sitemap, robots, cabeçalhos de segurança e acessibilidade básica.

## Fontes e estratégia de dados

Somente fontes da Câmara dos Deputados são usadas:

- [API REST v2](https://dadosabertos.camara.leg.br/api/v2) para busca, perfil e despesas individuais;
- [arquivo anual da CEAP](https://dadosabertos.camara.leg.br/swagger/api.html#staticfile) para o ranking e as agregações nacionais.

A API limita listagens a 100 itens. Fazer uma consulta de despesas para cada um dos mais de 500 parlamentares produziria centenas ou milhares de requisições. Por isso, o dashboard usa um retrato agregado gerado a partir do CSV anual oficial. O arquivo bruto não é versionado; apenas o JSON agregado, sem CPF/CNPJ ou documentos fiscais, entra no projeto.

O retrato atual cobre 2026 e mostra na interface sua data de geração e a URL exata da fonte. Para atualizá-lo:

```bash
npm run data:update -- --year 2026
```

Depois de adicionar outro ano a `src/data`, inclua-o em `AVAILABLE_YEARS`, em `src/lib/data/dashboard-data.ts`.

## Desenvolvimento

Requisitos: Node.js 20.9 ou superior e npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abra `http://localhost:3000`.

### Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Os testes end-to-end iniciam o servidor local automaticamente. Para instalar o Chromium do Playwright na primeira execução, use `npx playwright install chromium`.

## Variáveis de ambiente

| Variável                    | Padrão                  | Finalidade                        |
| --------------------------- | ----------------------- | --------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | `http://localhost:3000` | URL canônica, sitemap e metadados |
| `NEXT_PUBLIC_XD_PLANS_URL`  | vazio                   | Link opcional no rodapé           |
| `CAMARA_API_BASE_URL`       | API oficial v2          | Base do BFF                       |
| `CAMARA_REQUEST_TIMEOUT_MS` | `12000`                 | Timeout por tentativa             |
| `CAMARA_MAX_CONCURRENCY`    | `3`                     | Requisições simultâneas           |
| `CAMARA_MAX_PAGES`          | `30`                    | Limite defensivo de paginação     |

Nenhuma chave é necessária. Não coloque segredos em variáveis `NEXT_PUBLIC_*`.

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. Configure `NEXT_PUBLIC_SITE_URL` com a URL final.
3. Opcionalmente configure `NEXT_PUBLIC_XD_PLANS_URL`.
4. Use o preset Next.js e o comando de build `npm run build`.
5. Faça o primeiro deploy e verifique `/`, `/robots.txt` e `/sitemap.xml`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

O aplicativo não usa armazenamento persistente local em runtime. A atualização do arquivo anual deve ocorrer antes do deploy ou por uma automação externa que abra um pull request com o novo retrato.

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Decisões sobre dados](docs/DATA.md)
- [Contribuição](CONTRIBUTING.md)
- [Limitações conhecidas](docs/LIMITATIONS.md)

## Licença

Ainda não definida. Nenhuma licença de uso do código deve ser presumida até que um arquivo `LICENSE` seja adicionado pelo responsável pelo projeto.
