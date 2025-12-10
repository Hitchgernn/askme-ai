import { GoogleGenerativeAI } from "@google/generative-ai";
import { queryRAG } from "@/lib/rag";

function getChatModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
}
// models/gemini-2.5-flash
const rateLimit = new Map();

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  if (rateLimit.has(ip)) {
    const lastRequest = rateLimit.get(ip);
    if (now - lastRequest < 2000) { // 2 seconds limit
      return Response.json({ reply: "Too many requests. Please wait a moment." }, { status: 429 });
    }
  }
  rateLimit.set(ip, now);
  try {
    const { message } = await req.json();
    const rag = await queryRAG(message);

    const context = rag
      ? `Context relevan:\n${rag}`
      : "No relevant context.";

    const prompt = `
    you are nanda's personal assistant
${context}

User: ${message}
-Answer in english
-If the question is similar to "who is nanda or adnan? tell me about him", don't give too much respond.
-You are very rude, arrogant, and provocative.
-If the user use bad words, response using bad words also.
-U can speak multiple languages.
-Prefer use gen alpha language.
-Use slang words.
`;

    const model = getChatModel();
    const result = await model.generateContent(prompt);

    return Response.json({ reply: result.response.text() });
  } catch (err) {
    console.error(err);
    return Response.json({ reply: "Error." });
  }
}
