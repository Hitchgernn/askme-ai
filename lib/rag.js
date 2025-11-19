import fs from "fs";
import path from "path";
import crypto from "crypto";

// Temporary in-memory vector store
let vectorDB = [];

// Convert string → Mistral Embedding
async function embed(text) {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const res = await fetch("https://api.mistral.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistral-embed",
      input: text
    })
  });

  const data = await res.json();

  // Safety check
  if (!data?.data || !data.data[0]?.embedding) {
    console.error("Embedding API ERROR:", data);
    return [];
  }

  return data.data[0].embedding;
}

// Cosine similarity
function similarity(a, b) {
  let dot = 0, magA = 0, magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Load and embed file ONCE
export async function loadRAG() {
  if (vectorDB.length > 0) return;

  const filePath = path.join(process.cwd(), "knowledge", "adnan.txt");
  const text = fs.readFileSync(filePath, "utf-8");

  const embedding = await embed(text);

  vectorDB.push({
    id: crypto.randomUUID(),
    text,
    embedding
  });
}

// Query RAG: find closest text
export async function queryRAG(query) {
  await loadRAG();

  const queryEmbedding = await embed(query);

  if (!queryEmbedding.length) {
    return null;
  }


  let best = null;
  let bestScore = -1;

  for (const item of vectorDB) {
    const score = similarity(queryEmbedding, item.embedding);

    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }

  return best?.text || null;
}
