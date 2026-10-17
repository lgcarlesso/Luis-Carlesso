# Fontes do garimpo

Pontos de partida, não verdades fixas: confirme que cada um ainda existe e está ativo antes de citar. Se achar uma fonte melhor durante a pesquisa, use-a.

## Sumário
1. Queries prontas para o GitHub
2. Curadorias (awesome-lists e repositórios oficiais)
3. Diretórios de conectores MCP
4. Rankings de modelos de IA
5. Comunidade (avaliações reais)

## 1. Queries prontas para o GitHub

URL base (via WebFetch): `https://github.com/search?q=<query>&type=repositories&s=stars&o=desc`
Para ver o que está em alta no momento: `https://github.com/trending?since=monthly` (aceita `/trending/<linguagem>`).

| Categoria | Exemplos de query |
|---|---|
| Templates / base | `<stack> starter`, `<stack> template stars:>200`, `<stack> boilerplate pushed:>AAAA-MM-DD` |
| Conectores MCP | `<serviço> mcp server`, `topic:mcp-server <tema>`, `mcp <tema> stars:>50` |
| Skills do Claude | `claude skills <tema>`, `topic:claude-skills`, `"SKILL.md" <tema>` (via WebSearch) |
| Claude Code (plugins, subagentes, hooks) | `claude code <tema> plugin`, `claude code subagents`, `topic:claude-code` |
| Prompts | `<tema> prompts`, `awesome <tema> prompts`, `system prompt <tema>`, `<modelo> prompting guide` |
| Agentes / apps de IA | `<tema> ai agent`, `llm <tema> app`, `topic:ai-agents <tema>` |
| Qualquer tema | `awesome <tema>` — quase todo assunto tem uma awesome-list |

## 2. Curadorias

**Índice geral**
- `sindresorhus/awesome` — índice de awesome-lists de praticamente qualquer tema.

**Conectores MCP**
- `modelcontextprotocol/servers` — oficial; servidores de referência e lista de servidores de terceiros.
- `punkpeye/awesome-mcp-servers` — a maior curadoria da comunidade, organizada por categoria.

**Skills, plugins e Claude Code**
- `anthropics/skills` — skills oficiais da Anthropic.
- `anthropics/claude-cookbooks` — receitas oficiais (tool use, agentes, RAG, prompts).
- `hesreallyhim/awesome-claude-code` — comandos, hooks, workflows, CLAUDE.md de exemplo.
- `travisvn/awesome-claude-skills`, `ComposioHQ/awesome-claude-skills` — skills da comunidade.
- `wshobson/agents`, `VoltAgent/awesome-claude-code-subagents` — subagentes prontos.

**Prompts**
- `anthropics/prompt-eng-interactive-tutorial` — guia oficial de engenharia de prompt.
- `dair-ai/Prompt-Engineering-Guide` — técnicas e artigos.
- `f/awesome-chatgpt-prompts` (prompts.chat) — biblioteca grande de prompts por papel.
- `danielmiessler/fabric` — "patterns": prompts estruturados por tarefa (resumir, extrair, analisar...).
- `x1xhlol/system-prompts-and-models-of-ai-tools` — system prompts de ferramentas de IA conhecidas, bom para estudar estrutura.
- Biblioteca de prompts na documentação da Anthropic (docs.claude.com).

**Apps e agentes de IA**
- `Shubhamsaboo/awesome-llm-apps` — apps de exemplo com código, muitos prontos para clonar.
- `e2b-dev/awesome-ai-agents` — panorama de agentes e frameworks.

## 3. Diretórios de conectores MCP

Mostram uso, avaliação ou verificação — úteis para desempatar entre servidores parecidos.
- Registro oficial: `registry.modelcontextprotocol.io`
- `smithery.ai` — contagem de uso e instalação fácil.
- `glama.ai/mcp/servers` — notas de segurança e qualidade.
- `mcp.so` — diretório amplo da comunidade.

Prefira sempre o servidor oficial do próprio serviço (ex.: o MCP publicado pela Notion, Stripe, GitHub) quando existir.

## 4. Rankings de modelos de IA

Consulte na hora — mudam com frequência.
- `lmarena.ai/leaderboard` — votação humana; abas de texto, código (WebDev), visão, texto→imagem, vídeo.
- `artificialanalysis.ai` — qualidade × preço × velocidade; tem arenas de imagem, vídeo e voz.
- `openrouter.ai/rankings` — uso real por tipo de tarefa.
- `swebench.com` — agentes de programação em tarefas reais.
- Hugging Face Open LLM Leaderboard — modelos open-source.
- Hugging Face Open ASR Leaderboard — transcrição de fala (Whisper e afins); confira se cobre o idioma da tarefa.
- TTS Arena (Hugging Face) e a arena de voz do artificialanalysis.ai — síntese de voz.

Alguns desses sites podem estar bloqueados no ambiente. Se nenhum abrir, busque "<tarefa> benchmark <ano atual>" no WebSearch e cite a data do dado.

## 5. Comunidade

- Reddit: r/ClaudeAI, r/LocalLLaMA, r/PromptEngineering, r/mcp, e o subreddit do tema da tarefa.
- Hacker News: `hn.algolia.com/?q=<termo>` — discussões técnicas, críticas honestas.
- Product Hunt — avaliações de ferramentas novas.
- Issues e Discussions do próprio repositório — revelam bugs crônicos e abandono.
