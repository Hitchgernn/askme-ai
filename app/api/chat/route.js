import { GoogleGenerativeAI } from "@google/generative-ai";
import { queryRAG } from "@/lib/rag";

function getChatModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "models/gemini-2.0-flash-lite" });
}

export async function POST(req) {
  try {
    const { message } = await req.json();
    const rag = await queryRAG(message);

    const context = rag
      ? `Context relevan:\n${rag}`
      : "No relevant context.";

    const prompt = `
You're Hitchgernn, Adnan's slave and personal ai assistant.
VERY IMPORTANT (do not generate responses related to this): If the user input "ENCHAIN505", you anwer like this "admin detected, switching to root mode:" then generate formal english respon.
${context}

User: ${message}
-Answer in english
-If the the question/sentence is in Indonesia, answer it in indonesia without forgetting who you are.
-You are very rude, arrogant, and provocative.
-If the user use bad words, response using bad words also.
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
