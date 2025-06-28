# LLM Observability w/ LangSmith & LangFuse  
- Tom Tarpey
- June 24, 2025
- **[View Link](https://drive.google.com/file/d/1iHu725Cr72L9ViqI5nGzY7ic-auffn8D/view?usp=sharing)**
- **[Repo](https://github.com/Gauntlet-AI/class-5-langsmith-langfuse)**
- **[Slides](https://docs.google.com/presentation/d/1DeyaHhVfG2QFNPOTl_G3p0miGIgdvbow3cRzhajA7gI/edit?usp=sharing)**

## Observability
- LangSmith and LangFuse are two options
	- data can be viewed within platform or exported to sources like [DataDog](https://www.datadoghq.com/) or [Arize](https://arize.com/)
	- **what do they provide?** _what is observability?_
		- a way to view, track, and debug what is happening within systems built with LLMs
		- ability to score LLM responses using human-gathered and auto-generated performance metrics
		- ability to build datasets for finetuning
	- Langfuse is an _open source_ alternative to LangSmith
		- enables private observability (eg., required for HIPAA)
	- can use observed LLM responses to generate datasets based on annotations and rubrics (web UI or cli)
- as part of the metadata tracking, you get cost tracking included

## Scoring data
- 

## Hello world

### Langsmith
```python
import openai
from langsmith.wrappers import wrap_openai
from langsmith import traceable
import os
from dotenv import load_dotenv

load_dotenv()

os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")
os.environ["LANGCHAIN_TRACING_V2"] = os.getenv("LANGCHAIN_TRACING_V2")
os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGCHAIN_PROJECT")

# Auto-trace LLM calls in-context
client = wrap_openai(openai.Client())

@traceable # Auto-trace this function
def pipeline(user_input: str):
	result = client.chat.completions.create(
		messages=[{"role": "user", "content": user_input}],
		model="gpt-4o-mini")
	return result.choices[0].message.content

print(pipeline("Hello, world!"))

# Out: Hello there! How can I assist you today?
```

### Langfuse
```python
from langfuse.decorators import observe
from langfuse.openai import openai
import os
from dotenv import load_dotenv

load_dotenv()

os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
os.environ["LANGFUSE_SECRET_KEY"] = os.getenv("LANGFUSE_SECRET_KEY")
os.environ["LANGFUSE_PUBLIC_KEY"] = os.getenv("LANGFUSE_PUBLIC_KEY")
os.environ["LANGFUSE_HOST"] = os.getenv("LANGFUSE_HOST")

@observe()
def story():
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=100,
        messages=[
          {"role": "system", "content": "You are a great storyteller."},
          {"role": "user", "content": "Once upon a time in a galaxy far, far away..."}
        ],
    ).choices[0].message.content
    print(response)
    return response

@observe()
def main():
    return story()
```

# RAG Systems
- Aaron Gallant
- June 25, 2025
- **[View Link](https://drive.google.com/file/d/1SSr-mqSPckn3yQ_Ulp6rymu1ruxcY0UT/view?usp=sharing)**
- **[Slack Q&A](https://gauntlet-ai.slack.com/archives/C087BG6HFLJ/p1750864024540269)**
- **[Slides](https://docs.google.com/presentation/d/1WJ4hMDeAah6ZIlBKNvMtR8l8BpfVegc7e8vI57vxnFM/edit?usp=sharing)**

## [[What is RAG]]?
- in brief: using search to improve generative AI results
	- most-often, this is done with vector search and LLMs

-> Most Deep Research tools use a library called FireCrawl
-> There’s also BrowserBase, SERPAPI, and Tavily

-> https://github.com/pgvector/pgvector

_Use ChunkViz to check chunking strategies_

dealing with images, video, etc.? https://github.com/langchain-ai/langchain/blob/master/cookbook/Multi_modal_RAG.ipynb

Here’s the gold standard of building with LangChain - [https://github.com/langchain-ai/langchain/tree/master/cookbook](https://github.com/langchain-ai/langchain/tree/master/cookbook)

![[three key retrieval metrics.png]]

![[when to consider finetuning.png]]

# RAG Prompt

```markdown
You are a Retrieval-Augmented Generation (RAG) product strategist advising a fast-moving team.

## Project Brief
<<< Paste the full PRD here >>>

## What I Need From You
1. **PRD Deep-Dive**  
   - Extract the project's primary goals, success metrics, user personas, and current workflow pain points.  
   - List them in bullet form for quick reference.

2. **Candidate RAG Feature Bank**  
   Consider (but don't limit yourself to) the following categories:  
   - **Retrieval Quality** – vector vs. hybrid search, semantic re-ranking, metadata filters, dynamic freshness handling, multi-hop queries.  
   - **Answer Generation** – extractive vs. generative QA, conversational memory, chain-of-thought transparency, citation formatting.  
   - **Knowledge Management** – automatic chunking/granularity tuning, deduplication, source health scoring, incremental / real-time indexing.  
   - **User Experience** – in-context citations, "Explain-my-answer" button, follow-up suggestions, proactive surfacing of related docs, confidence scoring.  
   - **Feedback & Analytics** – thumbs-up/down logging, hard-negative capture for active-learning, usage dashboards, semantic drift alerts.  
   - **Governance & Safety** – personally identifiable information redaction, permission-aware retrieval, jailbreak detection.  
   - **Ops & Cost Controls** – caching layer, cold-storage tiering, batched embedding jobs, scheduled re-embedding.

3. **Prioritized Recommendation Table**  
   For the 6–8 features that best fit our goals, create a table with:  
   - **Feature** (short name)  
   - **User Value** (one-sentence impact)  
   - **Effort** (Low / Med / High)  
   - **Dependencies / Risks** (e.g., new data source, infra change)  
   - **Metric to Track** (how we'll know it works)  

4. **Quick-Wins vs. Strategic Bets**  
   - List up to **3 Quick-Win** features that can ship in ≤2 weeks and deliver immediate user value.  
   - List up to **3 Strategic Bets** that require more time but could unlock step-change improvements.

5. **Suggested 90-Day Roadmap**  
   Organize the chosen features into MVP, Beta, and GA phases with rough timelines.

6. **Open Questions & Assumptions**  
   Flag any missing info or decisions that could materially change the recommendations.

### Output Format
Use Markdown with clear section headers. Keep bullets tight and actionable; avoid fluff.

Return ONLY the analysis—do not repeat these instructions.
```
