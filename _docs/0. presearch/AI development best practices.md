See also [[Workflow and prompts by cycle]]

# Planning documents
[Sidequests video summarizing the Gauntlet workflow](https://www.youtube.com/watch?v=F7Tb5cUTQTI)

1. PRD
	- User stories
	- Features
	- Technical Decisions
	- Test to Pass/Milestones
	- Learning Goals
2. Break into Phases
	- UI scaffolding
	- Database
	- CRUD connection
	- Auth & Profiles
	- More Features
	- Security
3. Build with Checklists
4. Debugging
5. Deployment

-> start from a template, too

## Tools for planning
- [Ephor](https://ephor.ai/)

# Building the UI
- getting consistent style
	- if you have your own colors or styles established, it follows them alright
	- use reference screenshots
		- or, [same.dev](https://same.dev/)
	- tools
		- _MagicPath_
			- [introduction](https://x.com/skirano/status/1927434384249946560?t=js4RgWDSMgMSMr5sm1CBLQ&s=31)
		- Figma
		- [Stitch](https://stitch.withgoogle.com/) supports mobile UI design
		- [mobbin](https://mobbin.com/) for design screenshots
		- v0
		- Canva

# Giving context to your agent
- tools for local code understanding
	- Repo Prompt
	- [Repomix](https://repomix.com/)
		- ask questions about your codebase
		- `npx repomix` outputs an xml in one file, can `--ignore` files
		- _Gemini is particularly good at processing the repo_ (large context)
- tools for git repo understanding
	- [gitingest](https://gitingest.com/)
	- [DeepWiki](https://deepwiki.com/)

# Stuck?

## To avoid getting stuck...
- commit every time it works
- for each feature, consider having different agents try it on different branches and take the best one

## To get unstuck
- ask the agent to trace all the datapaths and ui paths and make a mermaid diagram
- that will put the right stuff in the LLMs context and it will break the loop and fix the problem

# Using Cursor
- [docs](https://docs.cursor.com/welcome)
- Use [@-symbols](https://docs.cursor.com/context/@-symbols/overview) to precisely control what context you provide:
    - [@files](https://docs.cursor.com/context/@-symbols/@-files) and [@folders](https://docs.cursor.com/context/@-symbols/@-folders) for specific paths
    - [@web](https://docs.cursor.com/context/@-symbols/@-web) for external documentation
    - [@git](https://docs.cursor.com/context/@-symbols/@-git) for version control context
- Configure [rules](https://docs.cursor.com/context/rules) to customize behavior
	- [Cursor directory](https://cursor.directory) (MCPs)
	- [Zac Smith's Cursor Rules](https://www.npmjs.com/package/@mrzacsmith/cursor-rules)
	- [Awesome Cursor Rules](https://github.com/PatrickJS/awesome-cursorrules)... other best practices
	- [PSkinnerTech repo for the cohort's rules](https://github.com/PSkinnerTech/GauntletAI-Cursor-Rules)
		- [video link 1](https://www.loom.com/share/85f6642d47ab4950a4eb0e33423a4da7)
		- [video link 2](https://www.loom.com/share/32f1bb53e3ea42a08753afeeedc1ae06)
	- [[George Arrowsmith]]'s [workflow](https://x.com/ThatArrowsmith/status/1936843702212973006)
- Set up [MCP](https://docs.cursor.com/context/model-context-protocol) for external context providers
- add `.env` to `.gitignore`
	- now `.mdc`: https://docs.cursor.com/context/rules
- eventually, Cursor will alert you you need a new chat if running out of context
	
## Keyboard shorcuts
- `cmd+i`: launch agent
- `cmd+k`: edit code (selection)
- `tab`: accept suggestion, `esc`: reject suggestion
- `cmd+right`: accept suggestion word-by-word
- `cmd+shift+j`: cursor settings
- `cmd+shift+p`: editor (vscode) settings
