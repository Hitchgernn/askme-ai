import fs from "fs";
import path from "path";

const VECTOR_DB_PATH = path.join(process.cwd(), "knowledge", "vector_db.json");
const KNOWLEDGE_PATH = path.join(process.cwd(), "knowledge", "adnan.txt");
const EMBED_URL = "https://api.mistral.ai/v1/embeddings";
const EMBED_MODEL = "mistral-embed";

let vectorDB = null;

// Delay helper
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Chunk text
function chunkText(text, maxLen = 800) {
  const chunks = [];
  let current = "";
  const parts = text.split(/(\.|\?|!|\n)/);

  for (let p of parts) {
    if (!p.trim()) continue;
    if ((current + p).length > maxLen) {
      chunks.push(current.trim());
      current = p;
    } else {
      current += p;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// Embedding call with retry
async function embed(text) {
  const API_KEY = process.env.MISTRAL_API_KEY;
  let attempt = 0;

  while (attempt < 3) {
    try {
      const res = await fetch(EMBED_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: EMBED_MODEL,
          input: text,
        }),
      });

      const data = await res.json();
      if (data?.data?.[0]?.embedding) {
        return data.data[0].embedding;
      }

      if (data?.type === "service_tier_capacity_exceeded") {
        await sleep(1000 + Math.random() * 800);
        attempt++;
        continue;
      }

      console.log("Embed error:", data);
      break;

    } catch (err) {
      console.log("Network embed error:", err);
      attempt++;
      await sleep(1000);
    }
  }

  return null;
}

// Load vector DB from JSON if exists
function loadVectorFile() {
  if (!fs.existsSync(VECTOR_DB_PATH)) return null;
  const raw = fs.readFileSync(VECTOR_DB_PATH, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Save vector DB to JSON
function saveVectorFile(db) {
  fs.writeFileSync(VECTOR_DB_PATH, JSON.stringify(db, null, 2));
}

// INITIALIZE RAG
export async function loadRAG() {
  if (vectorDB) return vectorDB;

  // 1. Try load saved vectors
  const saved = loadVectorFile();
  if (saved && saved.length > 0) {
    console.log("Loaded vector DB from file.");
    vectorDB = saved;
    return vectorDB;
  }

  // 2. Otherwise create embedding DB
  console.log("Vector DB missing → generating new embeddings...");

  const text = fs.readFileSync(KNOWLEDGE_PATH, "utf8");
  const chunks = chunkText(text);
  const db = [];

  for (const chunk of chunks) {
    const emb = await embed(chunk);
    if (emb) db.push({ text: chunk, embedding: emb });
  }

  // Save DB
  saveVectorFile(db);
  console.log("Saved new vector DB.");

  vectorDB = db;
  return db;
}

// Cosine similarity
function sim(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

export async function queryRAG(query) {
  const db = await loadRAG();
  if (!db?.length) return null;

  const qEmb = await embed(query);
  if (!qEmb) return null;

  const ranked = db
    .map((x) => ({
      text: x.text,
      score: sim(qEmb, x.embedding),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, 2).map((x) => x.text).join("\n\n");
}
