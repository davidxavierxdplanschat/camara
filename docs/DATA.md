# Decisões sobre dados

## Contratos oficiais validados

Em 26 de outubro de 2026, a especificação OpenAPI oficial informava:

- base `https://dadosabertos.camara.leg.br/api/v2/`;
- listagens com 15 itens por padrão e máximo de 100;
- `/deputados`: filtros `nome`, `siglaUf`, `siglaPartido`, datas e legislatura;
- `/deputados/{id}/despesas`: filtros `ano`, `mes`, legislatura e fornecedor;
- paginação por `pagina`, `itens` e links no corpo da resposta;
- sem filtro temporal, despesas retornam somente os seis meses anteriores.

Por isso, o Cota Clara sempre envia ano ao consultar despesas individuais e usa `itens=100` na paginação.

## Arquivo anual

A Câmara publica `https://www.camara.leg.br/cotas/Ano-{ano}.csv.zip`, atualizado diariamente. O campo `vlrLiquido` representa o valor efetivamente debitado, após glosas, e é a base dos totais mostrados. Valores negativos legítimos, como compensações de passagens, são preservados.

O script ignora linhas sem `ideCadastro` numérico, porque não podem ser vinculadas com segurança a um perfil da API. Lideranças partidárias e outros beneficiários não associados a um deputado identificável podem, portanto, não aparecer no ranking por parlamentar.

## Linguagem cidadã

O nome oficial é preservado no tooltip ou atributo de título. A regra central em `src/config/expense-categories.ts` cria agrupamentos de leitura simples. Categorias não mapeadas vão para “Outras despesas”.
