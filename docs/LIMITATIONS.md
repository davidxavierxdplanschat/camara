# Limitações conhecidas e próximos passos

- O dashboard inclui somente o retrato de 2026; anos anteriores exigem gerar e registrar novos artefatos.
- O retrato anual é atualizado por comando, não em tempo real. Uma rotina agendada pode abrir pull requests diários.
- A filiação nos arquivos CEAP reflete o cadastro associado ao ano e pode divergir do status atual da API.
- Linhas sem identificador de cadastro não entram no ranking individual.
- O agrupamento de categorias é editorial e deve evoluir com revisão cidadã e testes de compreensão.
- A página de deputado limita a paginação a 30 páginas (3.000 registros) por consulta; ao atingir o teto, uma futura versão deve sinalizar explicitamente o resultado parcial.
- Lighthouse, axe e testes em dispositivos reais devem fazer parte da validação de cada release.
- Não há licença definida.
