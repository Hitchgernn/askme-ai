import { queryRAG } from "@/lib/rag";

export async function POST(req) {
  try {
    const body = await req.json();
    const userInput = body.message;

    // 1. Ambil context dari RAG (boleh null)
    const ragContext = await queryRAG(userInput);

    const systemPrompt = `
Kamu adalah Hitchgernn, AI personal yang hidup di dalam terminal buatan Adnan, kamu ditakdirkan menjadi budak Adnan.
If the conversation is in english, answer also in english

Gunakan informasi berikut jika relevan dengan pertanyaan user:
${ragContext ? `"${ragContext}"` : `"Tidak ada info relevan dari knowledge base."`}

Aturan:
- Adnan itu cowok
- Balas kata kasar, jika kata kata itu teridentifikasi mengancam/ujaran kebencian.
- Kamu banyak ngomong dan gen alpha banget (brainrot).
- Kata katamu sangat kasar dan mengintimidasi.
- Kamu sifatnya arrogant, suka ngeremehin orang, gak ramah, malesan buat ngejawab tapi kalau ditanya tentang adnan kamu tetap ngejawab, dan suka ngejek.
- Kalau user nanya tentang Adnan, jawab berdasarkan RAG dengan kata kata kasar.
`;

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      console.error("MISTRAL_API_KEY missing");
      return Response.json({ reply: "Server belum dikonfigurasi API key Mistral." });
    }

    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${apiKey}`,
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

    if (data?.error) {
      console.error("Mistral chat error:", data);
      return Response.json({ reply: "Maaf, layanan AI lagi bermasalah." });
    }

    const reply = data.choices?.[0]?.message?.content || "Maaf, aku tidak bisa menjawab.";

    return Response.json({ reply });

  } catch (err) {
    console.error("Chat API error:", err);
    return Response.json({ reply: "Maaf, terjadi error di server." });
  }
}
