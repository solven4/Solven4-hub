// pgvector memory helpers — used by all AI handlers
// Requires: OPENAI_API_KEY for embeddings (text-embedding-3-small, 1536-dim)
// Gracefully degrades to no memory when key not set

const EMBED_MODEL = 'text-embedding-3-small';
const MEMORY_LIMIT = 5;
const MEMORY_TTL_DAYS = 90;

export async function generateEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, input: text.slice(0, 8000) }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.data?.[0]?.embedding || null;
}

export async function saveMemory(supabase, userId, door, feature, userMsg, aiResponse) {
  if (!userId) return;
  try {
    const content = `User: ${userMsg}\nAssistant: ${aiResponse}`.slice(0, 4000);
    const embedding = await generateEmbedding(content);

    const record = {
      user_id: userId,
      door,
      feature,
      content_text: content,
      expires_at: new Date(Date.now() + MEMORY_TTL_DAYS * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };

    if (embedding) {
      record.content_vector = JSON.stringify(embedding);
    }

    await supabase.from('memories').insert(record);
  } catch (err) {
    // Memory save is fire-and-forget — never block AI response
    console.error('Memory save error:', err.message);
  }
}

export async function getRelevantMemories(supabase, userId, queryText, limit = MEMORY_LIMIT) {
  if (!userId) return '';
  try {
    const embedding = await generateEmbedding(queryText);

    let data;
    if (embedding) {
      // Vector similarity search (HNSW index on memories table)
      const { data: rows } = await supabase.rpc('match_memories', {
        query_embedding: embedding,
        match_user_id: userId,
        match_count: limit,
      });
      data = rows;
    } else {
      // Fallback: recent memories by date (no vector search without OpenAI key)
      const { data: rows } = await supabase
        .from('memories')
        .select('content_text, created_at')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);
      data = rows;
    }

    if (!data?.length) return '';

    const memorySummary = data
      .map((m, i) => `[Memory ${i + 1}] ${m.content_text}`)
      .join('\n\n');

    return `\n\nRELEVANT CONVERSATION HISTORY:\n${memorySummary}\n`;
  } catch (err) {
    console.error('Memory retrieval error:', err.message);
    return '';
  }
}
