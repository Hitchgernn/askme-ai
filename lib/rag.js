import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const KNOWLEDGE_PATH = path.join(process.cwd(), "knowledge", "adnan.txt");
const VECTOR_DB_PATH = path.join(process.cwd(), "data", "vector_db.json");

let embedModel = null;
let vectorDB = null;

function getEmbedModel() {
  if (!embedModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
  }
  return embedModel;
}

// chunking
function chunkText(text, maxSize = 800) {
  const parts = text.split(/(?<=[\.\!\?])|\n/);
  const chunks = [];
  let current = "";

  for (const p of parts) {
    if ((current + p).length > maxSize) {
      chunks.push(current.trim());
      current = p;
    } else {
      current += p;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}

// embedding text with gemini
async function embed(text) {
  try {
    const model = getEmbedModel();
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error("Embedding ERROR:", err);
    return null;
  }
}

// save vector DB to JSON
function saveVectorDB(db) {
  fs.writeFileSync(VECTOR_DB_PATH, JSON.stringify(db, null, 2));
  console.log("Vector DB saved!");
}

// load vector DB if exists
function loadVectorFile() {
  try {
    if (fs.existsSync(VECTOR_DB_PATH)) {
      const raw = fs.readFileSync(VECTOR_DB_PATH, "utf8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error loading vector DB file:", err);
  }
  return null;
}

// build vector DB (only runs if no JSON)
export async function initVectorDB() {
  const existing = loadVectorFile();
  if (existing && existing.length > 0) {
    vectorDB = existing;
    console.log("Loaded vector DB from JSON.");
    return vectorDB;
  }

  console.log("Generating new vector DB…");

  const raw = fs.readFileSync(KNOWLEDGE_PATH, "utf8");
  const chunks = chunkText(raw);

  const db = [];
  for (const chunk of chunks) {
    const emb = await embed(chunk);
    if (emb) {
      db.push({ text: chunk, embedding: emb });
    }
    await new Promise((resolve) => setTimeout(resolve, 500)); // Delay 500ms
  }

  saveVectorDB(db);
  vectorDB = db;
  return db;
}

// cosine similarity
function cosineSim(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

// Query RAG
export async function queryRAG(query) {
  if (!vectorDB) await initVectorDB();
  if (!vectorDB || vectorDB.length === 0) return null;

  const qEmb = await embed(query);
  if (!qEmb) return null;

  const scored = vectorDB
    .map((item) => ({
      text: item.text,
      score: cosineSim(qEmb, item.embedding),
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 2).map(s => s.text).join("\n\n");
}
