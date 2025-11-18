export async function POST(req) {
  const { message } = await req.json();

  // Dummy AI (ganti nanti dengan Groq/RAG)
  const reply = `You said: ${message} (Your AI assistant will answer here after integrationadsfasdfasdffsfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff)`;

  return Response.json({ reply });
}
