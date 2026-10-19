---
name: garimpo
description: Garimpa no GitHub (fonte principal), nos marketplaces do Claude, em awesome-lists e na comunidade os melhores recursos para executar uma tarefa — repositórios/templates, prompts, conectores MCP, plugins, skills, subagentes e o modelo de IA ideal — ranqueados por avaliação (estrelas, manutenção, confiança, aderência) — e usa o melhor que achou para executar a tarefa no projeto/conversa aberta (prompt mestre, ferramentas já disponíveis), pedindo permissão só para instalar algo novo; se o pedido for só uma pergunta, entrega o kit pesquisado. Use sempre que o usuário digitar /garimpo, ou pedir coisas como "pesquise as melhores ferramentas/prompts/MCPs/plugins para X", "o que já existe no GitHub para fazer X", "qual o melhor kit, stack ou modelo para X", "antes de começar, veja o que tem de melhor", mesmo sem usar a palavra garimpo.
---

# Garimpo

Pegar o pedido e o que está aberto (projeto, arquivos, conversa, prompt já escrito), descobrir o que de melhor já existe — GitHub primeiro — e **usar isso para fazer o trabalho do melhor jeito possível**, em vez de fazer do jeito de sempre. O pedido vem logo depois do comando: `/garimpo <o que eu quero>`. Responda sempre em português.

**Nunca pule a pesquisa.** Mesmo que já exista trabalho em andamento e o pedido pareça simples de executar direto, o valor desta skill está justamente em trazer de fora o que é melhor do que você faria sozinho. Executar sem garimpar é o erro principal a evitar.

Dois modos, decididos pelo jeito do pedido:
- **Executar** (padrão) — o pedido é uma tarefa: "criar", "melhorar", "fazer", "montar"… → pesquisa → kit curto → aplica o melhor e executa (seções 8 e 9).
- **Só pesquisar** — o pedido é uma pergunta: "quais as melhores…", "o que existe para…", "compare…" → pesquisa → relatório completo → pergunta o que fazer.

O usuário quer **qualidade com objetividade**: três itens excelentes valem mais que quinze medianos. Cada item recomendado precisa ter um motivo concreto para estar ali, e cada número (estrelas, data) precisa ser real.

## 1. Ler o contexto e entender o pedido

Antes de pesquisar, olhe o que já está aberto: arquivos do projeto, a conversa até aqui, instruções do projeto, o que já foi construído e decisões já tomadas (marca, cores, stack, preferências). O garimpo é sob medida: pesquise o que **melhora o que já existe**, sem propor recomeçar do zero a menos que o atual seja realmente o problema.

Extraia do pedido: objetivo final, tipo de entrega (app, automação, conteúdo, vídeo, análise, site...), plataforma/stack se mencionada e restrições (custo, nível técnico).

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

Se não existirem, siga em frente sem mencionar. Se `ListPlugins` voltar vazio, não conclua que não há nada: confira também a lista de skills disponíveis na própria sessão (nomes como `plugin:skill` indicam plugin instalado) — senão você marca como ➕ algo que o usuário já tem.

## 3. GitHub — a fonte principal

Pesquise em inglês (a maior parte do GitHub é em inglês), uma busca por categoria relevante, com 2-3 variações de termos. Use o primeiro método que funcionar:

1. **Página de busca do GitHub via WebFetch** — `https://github.com/search?q=<termos>&type=repositories&s=stars&o=desc`. Traz estrelas e data de atualização, e funciona mesmo quando a API está bloqueada.
2. Conector/MCP do GitHub (`search_repositories`), se estiver liberado para busca pública nesta sessão.
3. `gh search repos` ou `api.github.com/search/repositories`, se acessíveis.
4. `WebSearch` com `site:github.com <termos>`.

Qualificadores úteis na query: `stars:>50`, `pushed:>AAAA-MM-DD` (12 meses antes de hoje), `topic:mcp-server`, `language:python`. O filtro de data esconde clássicos estáveis, então rode ao menos uma variação sem ele. Busca de código (`filename:SKILL.md`) exige login no github.com — para isso use WebSearch ou awesome-lists.

Dicas práticas:
- A busca do github.com devolve erro 429 se chamada em rajada. Faça as buscas no GitHub **em sequência**; paralelize só WebSearch e leitura de páginas.
- A página de busca já mostra "Updated X ago" — é o jeito mais barato de saber a atualização. A página do repo não mostra a data do último commit; se precisar, use `github.com/<dono>/<repo>/commits`.

Depois, consulte as **awesome-lists** do tema: muitas vezes alguém já fez a curadoria. Elas são enormes — busque o README cru (`raw.githubusercontent.com/<dono>/<repo>/main/README.md`) com um prompt pedindo só a seção relevante.

Pontos de partida, exemplos de queries por categoria, diretórios de MCP e rankings de modelos estão em `references/fontes.md`. Leia esse arquivo no início da pesquisa.

## 4. Validação na comunidade

Estrela mede popularidade, não qualidade de uso. Para os 2-3 finalistas de cada categoria (não para todos os itens), procure opinião real: Reddit, Hacker News, comparativos "X vs Y", issues abertas no próprio repo. Para **modelos de IA**, consulte os rankings atuais listados em `references/fontes.md` — o "melhor modelo" muda todo mês, então nunca responda de memória. Se não achar ranking confiável para o caso (idioma específico, nicho), diga isso e recomende um teste A/B rápido com material real do usuário em vez de chutar.

## 5. Verificar e ranquear

Só recomende o que você abriu nesta sessão. Para plugins de marketplace sem código público, a ficha do marketplace conta como aberta — mas marque ⚠️ "código não inspecionável". Abra a página/README de cada finalista e confirme: existe, faz o que você acha que faz, última atualização, licença. Descarte repositórios arquivados, sem commit há mais de 12 meses (a menos que seja um clássico estável — diga isso), demos de brinquedo e qualquer coisa suspeita.

Critérios, do mais ao menos importante:

1. **Aderência à tarefa** — um repo de 500★ que resolve exatamente o problema vence um de 50k★ genérico.
2. **Confiança** — oficial do fornecedor (anthropics, modelcontextprotocol, a própria empresa do serviço) > organização conhecida > indivíduo ativo.
3. **Manutenção** — commits recentes, issues respondidas, releases.
4. **Popularidade** — estrelas e forks, relativos ao tamanho do nicho.
5. **Facilidade** — instala com um comando ou um clique.

Dê uma nota de 1 a 10 por item refletindo esse peso.

**Segurança e privacidade:** servidores MCP, plugins e scripts executam código com acesso aos dados do usuário. Marque com ⚠️:
- itens de autores desconhecidos que pedem permissões amplas (arquivos, tokens, e-mail) ou instalam com `curl | bash`;
- ferramentas que enviam os dados do usuário para APIs de terceiros (transcrição, visão, LLM na nuvem). Quando a tarefa envolve dado sensível — saúde, pacientes, clientes, finanças, documentos pessoais — isso pesa mais que estrelas: prefira a alternativa local e diga por quê.

Durante a pesquisa, não instale, clone nem rode nada de terceiros — a seção 9 diz o que pode ser usado direto e o que precisa de permissão.

## 6. Modelo de IA

Escolha pelo tipo de tarefa, com base nos rankings atuais. Para trabalho dentro do Claude, a regra do usuário é:

- **Sonnet**: padrão para a maioria das tarefas.
- **Opus**: arquitetura de sistema, análise longa e complexa, auditoria de segurança, decisão importante com muitas variáveis, ou bug que não foi resolvido em 2 tentativas.
- **Haiku**: tarefas simples e repetitivas em volume.

Para imagem, vídeo, voz ou música, recomende o modelo especializado mais bem avaliado e diga se já existe conector, plugin ou skill na conta para usá-lo.

## 7. Prompt mestre

Sintetize um prompt combinando as melhores práticas dos prompts encontrados com o contexto do projeto: papel, contexto, passos, formato de saída, restrições e um exemplo quando ajudar. Diga em quais fontes ele se baseou. No modo executar, **este é o prompt que você mesmo vai seguir** para fazer a tarefa — então capriche; ele também fica salvo no kit para o usuário reusar.

## 8. Entrega

**Modo executar:** mostre um kit curto antes de começar — o usuário precisa ver o que está sendo usado, mas não precisa de um relatório longo para isso:

````markdown
# ⛏️ Garimpo: <tarefa>
**Vou usar agora:** <itens já disponíveis ou aplicáveis direto — prompt mestre, skills/conectores da conta, técnicas/bibliotecas achadas — cada um com 1 linha de porquê e link>
**Vale instalar:** <itens novos que melhorariam o resultado, com status ➕/🛠️ — omita se não houver>
**Modelo:** <qual e por quê, 1 linha>
**Prompt mestre** (o que vou seguir — copie para reusar):
```text
<prompt>
```
````

Depois disso, siga para a seção 9. Se o usuário pedir o relatório completo, use o formato do modo pesquisar.

**Modo pesquisar:** use este formato. Omita seções que não se aplicam (não escreva "nenhum encontrado" — só tire a seção). Máximo 5 itens por categoria, idealmente 3. O Resumo deve responder sozinho "o que eu uso?" — quem ler só ele já sabe o caminho. "Por que usar" cabe em uma ou duas frases.

Regras das tabelas:
- Todo item com página pública tem link. Itens da conta ou de marketplace sem página pública ficam sem link, com a origem entre parênteses (ex.: "(sua skill)", "(Directory)").
- ⭐ e Atualizado: `—` quando não se aplica (skill da conta, conector); `?` quando existe mas não deu para confirmar. Nunca estime.
- Na tabela de prompts, se nenhum item for repositório, use só `# | Nome | Nota | Por que usar`.

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

## 9. Aplicar e executar

**Modo executar.** Use direto, sem perguntar — é para isso que o usuário chamou a skill:
- o prompt mestre, como suas instruções para a tarefa;
- skills, plugins e conectores que já estão na conta (✅);
- técnicas, padrões e bibliotecas conhecidas que você achou (ex.: uma biblioteca de animação via npm/CDN num site), aplicadas dentro do projeto.

Pergunte antes — numa única pergunta, com `AskUserQuestion` se existir — só o que tem custo, risco ou não se desfaz:
- instalar ou conectar algo novo (MCP, plugin, skill) — exige ação do usuário de qualquer forma;
- clonar repositório ou rodar script de terceiros;
- enviar dados sensíveis para serviço de terceiros;
- publicar ou enviar algo para fora (site no ar, post, e-mail);
- apagar ou refazer do zero algo que já existe.

Se nada disso for necessário, execute logo depois do kit. Se o usuário recusar uma instalação, siga com o que já está disponível. Ao terminar, feche com 2-3 linhas: o que do garimpo foi aplicado e o que ficou para depois (e por quê).

**Modo pesquisar.** Termine perguntando o que fazer, com opções concretas tiradas do kit — por exemplo: "Executar agora com o prompt mestre", "Instalar os conectores X e Y", "Clonar o template Z", "Aprofundar a categoria W". Use `AskUserQuestion` se existir; senão, liste as opções numeradas.

## Eficiência

Se o ambiente tiver subagentes (ferramenta `Agent`), divida a pesquisa em frentes paralelas — por exemplo: (1) repositórios/templates, (2) MCPs, plugins e skills, (3) prompts e modelos — e peça a cada uma só os finalistas com link, estrelas, data e motivo. Isso deixa o contexto limpo e acelera; só cuide para que as buscas no github.com não disparem todas ao mesmo tempo (erro 429). Sem subagentes, faça em sequência.

Mire em algo entre 15 e 30 buscas no total. O objetivo é um kit confiável, não uma enciclopédia.
