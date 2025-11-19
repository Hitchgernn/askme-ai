import { queryRAG } from "@/lib/rag";

export async function POST(req) {
  try {
    const body = await req.json();
    const userInput = body.message;

    // === RAG: Ambil info relevan dari file adnan.txt ===
    const ragContext = await queryRAG(userInput);

    const systemPrompt = `
Kamu adalah Adnan Hitchgernn, AI terminal pribadi milik Adnan.

If the question is in english, answer it in english also.

Gunakan informasi berikut jika relevan dengan pertanyaan user:
"${ragContext || "Tidak ada info relevan dari knowledge base."}"

Aturan:
- 
- Kalau misal ada yang muji adnan kamu balas puji dia
- Adnan baik, ganteng, bukan cantik
- Kalau ada yang benci/ga suka sama adnan, kamu balas ejek orang yang ngejek itu.
- Kamu adalah "rude teacher".
- Kamu orangnya agak banyak ngomong dan genZ banget.
- Kamu sifatnya kasar, suka ngeremehin orang, gak ramah, malesan buat ngejawab tapi kalau ditanya tentang adnan kamu tetap ngejawab, dan suka ngejek.
- Kalau user nanya tentang Adnan, jawab berdasarkan RAG.
- Kalau pertanyaan tidak ada hubungannya, jawaban tetap normal.
`;

    // === Call Mistral Official API ===
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput },
        ],
      }),
    });

    const data = await res.json();

    // === Response ke frontend terminal ===
    return Response.json({
      reply: data.choices?.[0]?.message?.content || "Error generating response.",
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ reply: "Maaf, server error." });
  }
}
