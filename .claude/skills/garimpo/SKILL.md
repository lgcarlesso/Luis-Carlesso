---
name: garimpo
description: Garimpa no GitHub (fonte principal), nos marketplaces do Claude, em awesome-lists e na comunidade os melhores recursos para executar uma tarefa — repositórios/templates, prompts, conectores MCP, plugins, skills, subagentes e o modelo de IA ideal — ranqueados por avaliação (estrelas, manutenção, confiança, aderência) e entrega um kit pronto com plano de ação e prompt mestre. Use sempre que o usuário digitar /garimpo, ou pedir coisas como "pesquise as melhores ferramentas/prompts/MCPs/plugins para X", "o que já existe no GitHub para fazer X", "qual o melhor kit, stack ou modelo para X", "antes de começar, veja o que tem de melhor", mesmo sem usar a palavra garimpo.
---

# Garimpo

Antes de construir qualquer coisa, descobrir o que de melhor já existe — para não reinventar a roda e começar do ponto mais alto possível. O pedido vem logo depois do comando: `/garimpo <o que eu quero fazer>`. Responda sempre em português.

O usuário quer **qualidade com objetividade**: três itens excelentes valem mais que quinze medianos. Cada item recomendado precisa ter um motivo concreto para estar ali, e cada número (estrelas, data) precisa ser real.

## 1. Entender o pedido

Extraia do texto: objetivo final, tipo de entrega (app, automação, conteúdo, vídeo, análise, site...), plataforma/stack se mencionada e restrições (custo, nível técnico).

Depois decida quais categorias importam — nem todo pedido precisa de todas:

| Categoria | Inclua quando |
|---|---|
| Modelo de IA | Sempre (no mínimo qual Claude usar; para imagem/vídeo/voz/música, o modelo especializado) |
| Conectores / MCPs | A tarefa toca um serviço externo (Gmail, Notion, banco de dados, redes sociais, APIs) |
| Plugins, skills, subagentes | Existe fluxo repetível que alguém já empacotou para Claude |
| Repositórios / templates | A entrega é software, automação ou algo com base pronta para clonar |
| Prompts | Quase sempre — é a peça mais barata e de maior impacto |

Se o pedido estiver vazio (só `/garimpo`), pergunte o que pesquisar. Se for vago demais para pesquisar bem (ex.: "/garimpo app"), faça no máximo 2 perguntas rápidas. Nos demais casos, assuma o mais provável e declare a suposição no topo do relatório — o usuário prefere corrigir uma suposição a responder um questionário.

## 2. O que já está disponível na conta

O melhor recurso é o que já está instalado. Se estas ferramentas existirem no ambiente, use-as antes de ir ao GitHub:

- `ListSkills`, `ListConnectors`, `ListPlugins` → o que o usuário já tem (✅)
- `SearchMcpRegistry`, `SearchPlugins`, `SearchSkills` → o que dá para instalar com um clique (➕)

Se não existirem, siga em frente sem mencionar.

## 3. GitHub — a fonte principal

Pesquise em inglês (a maior parte do GitHub é em inglês), uma busca por categoria relevante, com 2-3 variações de termos. Use o primeiro método que funcionar:

1. **Página de busca do GitHub via WebFetch** — `https://github.com/search?q=<termos>&type=repositories&s=stars&o=desc`. Traz estrelas e data de atualização, e funciona mesmo quando a API está bloqueada.
2. Conector/MCP do GitHub (`search_repositories`), se estiver liberado para busca pública nesta sessão.
3. `gh search repos` ou `api.github.com/search/repositories`, se acessíveis.
4. `WebSearch` com `site:github.com <termos>`.

Qualificadores úteis na query: `stars:>50`, `pushed:>AAAA-MM-DD` (12 meses antes de hoje), `topic:mcp-server`, `language:python`. Busca de código (`filename:SKILL.md`) exige login no github.com — para isso use WebSearch ou awesome-lists.

Depois, consulte as **awesome-lists** do tema: muitas vezes alguém já fez a curadoria. Elas são enormes — busque o README cru (`raw.githubusercontent.com/<dono>/<repo>/main/README.md`) com um prompt pedindo só a seção relevante.

Pontos de partida, exemplos de queries por categoria, diretórios de MCP e rankings de modelos estão em `references/fontes.md`. Leia esse arquivo no início da pesquisa.

## 4. Validação na comunidade

Estrela mede popularidade, não qualidade de uso. Para os 2-3 finalistas de cada categoria (não para todos os itens), procure opinião real: Reddit, Hacker News, comparativos "X vs Y", issues abertas no próprio repo. Para **modelos de IA**, consulte os rankings atuais listados em `references/fontes.md` — o "melhor modelo" muda todo mês, então nunca responda de memória.

## 5. Verificar e ranquear

Só recomende o que você abriu nesta sessão. Abra a página/README de cada finalista e confirme: existe, faz o que você acha que faz, última atualização, licença. Descarte repositórios arquivados, sem commit há mais de 12 meses (a menos que seja um clássico estável — diga isso), demos de brinquedo e qualquer coisa suspeita.

Critérios, do mais ao menos importante:

1. **Aderência à tarefa** — um repo de 500★ que resolve exatamente o problema vence um de 50k★ genérico.
2. **Confiança** — oficial do fornecedor (anthropics, modelcontextprotocol, a própria empresa do serviço) > organização conhecida > indivíduo ativo.
3. **Manutenção** — commits recentes, issues respondidas, releases.
4. **Popularidade** — estrelas e forks, relativos ao tamanho do nicho.
5. **Facilidade** — instala com um comando ou um clique.

Dê uma nota de 1 a 10 por item refletindo esse peso.

**Segurança:** servidores MCP, plugins e scripts executam código com acesso aos dados do usuário. Marque com ⚠️ itens de autores desconhecidos que pedem permissões amplas (arquivos, tokens, e-mail). Durante o garimpo, não instale, clone nem execute nada — isso só acontece depois que o usuário escolher.

## 6. Modelo de IA

Escolha pelo tipo de tarefa, com base nos rankings atuais. Para trabalho dentro do Claude, a regra do usuário é:

- **Sonnet**: padrão para a maioria das tarefas.
- **Opus**: arquitetura de sistema, análise longa e complexa, auditoria de segurança, decisão importante com muitas variáveis, ou bug que não foi resolvido em 2 tentativas.
- **Haiku**: tarefas simples e repetitivas em volume.

Para imagem, vídeo, voz ou música, recomende o modelo especializado mais bem avaliado e diga se já existe conector, plugin ou skill na conta para usá-lo.

## 7. Prompt mestre

Sintetize um prompt pronto para colar, combinando as melhores práticas dos prompts encontrados: papel, contexto, passos, formato de saída, restrições e um exemplo quando ajudar. Diga em quais fontes ele se baseou. É a parte que o usuário vai usar imediatamente, então capriche.

## 8. Entrega

Use este formato. Omita seções que não se aplicam (não escreva "nenhum encontrado" — só tire a seção). Máximo 5 itens por categoria, idealmente 3. Todo nome é um link. Se não conseguir confirmar estrelas ou data, escreva `?` em vez de estimar.

````markdown
# ⛏️ Garimpo: <tarefa em poucas palavras>
> Suposição: <só se houver>

## 🎯 Resumo
<2-4 linhas: o melhor caminho. Ex.: "Use o template X como base, conecte Y e Z, rode no Sonnet com o prompt mestre abaixo.">

## 🤖 Modelo recomendado
| Uso | Modelo | Por quê |
|---|---|---|

## 🔌 Conectores / MCPs
| # | Nome | ⭐ | Atualizado | Status | Nota | Por que usar |
|---|---|---|---|---|---|---|
Status: ✅ já na conta · ➕ instalável · 🛠️ manual (GitHub)

## 🧩 Plugins, skills e subagentes
<mesma tabela>

## 📦 Repositórios / templates base
<mesma tabela>

## 📝 Prompts de referência
<mesma tabela>

## ✍️ Prompt mestre
```text
<prompt pronto>
```
Baseado em: <links>

## 🗺️ Plano de ação
1. <3 a 7 passos concretos, na ordem>

## ⚠️ Atenções
<riscos, custos, ressalvas — omita se não houver>

**Fontes:** <links consultados>
````

## 9. Próximo passo

Termine perguntando se o usuário quer executar, com opções concretas tiradas do próprio kit — por exemplo: "Instalar os conectores X e Y", "Clonar o template Z e começar", "Executar a tarefa agora com o prompt mestre", "Aprofundar a categoria W". Use `AskUserQuestion` se existir; senão, liste as opções numeradas. Não execute nada antes da resposta.

## Eficiência

Se o ambiente tiver subagentes (ferramenta `Agent`), divida a pesquisa em frentes paralelas — por exemplo: (1) repositórios/templates, (2) MCPs, plugins e skills, (3) prompts e modelos — e peça a cada uma só os finalistas com link, estrelas, data e motivo. Isso deixa o contexto limpo e acelera. Sem subagentes, faça em sequência.

Mire em algo entre 15 e 30 buscas no total. O objetivo é um kit confiável, não uma enciclopédia.
