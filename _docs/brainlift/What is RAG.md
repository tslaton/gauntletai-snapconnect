https://gemini.google.com/app/85922bd57214f3c1

### RAG: Enhancing AI with Real-Time Knowledge

RAG is a process that seamlessly blends the vast internal knowledge of an LLM with real-time, external information. When a user poses a query, a RAG-enabled system doesn't immediately rely on the LLM's static training data. Instead, it first employs a "retriever" component to search a vast, up-to-date knowledge base – such as a collection of documents, a database, or the internet – for information relevant to the user's prompt. This retrieved context is then provided to the LLM, which acts as the "generator," to craft a comprehensive and factually grounded response.

The implementation of a RAG system typically involves two key phases:

* **Indexing:** An initial, offline process where the external knowledge source is processed and organized into a searchable index. This often involves breaking down large documents into smaller, manageable chunks and creating vector embeddings – numerical representations of the text – that capture the semantic meaning. This allows for more effective searching based on the intent of a query, rather than just keywords.

* **Retrieval and Generation:** This is the real-time process that occurs when a user interacts with the system.
    1.  The user's query is also converted into a vector embedding.
    2.  The retriever then compares the query embedding to the indexed document embeddings to find the most relevant pieces of information.
    3.  This retrieved context is then combined with the original user prompt and fed to the LLM.
    4.  The LLM, now armed with both the user's question and relevant, timely information, generates a more accurate and contextually appropriate response.

## Benefits:
- allow LLMs to access new information without retraining
- ground responses in verifiable knowledge with citations
- reduce hallucinations

## Limitations
- RAG quality is heavily dependent on knowledge base quality and retrieval quality
- it cannot _elminate_ hallucinations
