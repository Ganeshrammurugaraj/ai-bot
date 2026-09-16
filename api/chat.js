export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST."
    });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GROQ_API_KEY is missing from Vercel Environment Variables."
      });
    }

    const body = req.body || {};

    const messages = Array.isArray(body.messages)
      ? body.messages
      : [];

    const temperature = Number(body.temperature ?? 0.7);

    const groqMessages = [
      {
        role: "system",
        content:
          "You are GANSH RAM AI, a professional and helpful Generative AI assistant. " +
          "Give accurate answers. Explain difficult topics in simple language. " +
          "Use examples when useful. Organize answers using headings and bullet points. " +
          "For programming questions, provide clean code. " +
          "Never invent information when uncertain. " +
          "Maintain a professional and friendly tone."
      },

      ...messages
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        )
        .slice(-20)
    ];

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: groqMessages,
          temperature: Math.min(Math.max(temperature, 0), 1),
          max_completion_tokens: 2048
        })
      }
    );

    const text = await groqResponse.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Groq returned a non-JSON response.",
        details: text.substring(0, 300)
      });
    }

    if (!groqResponse.ok) {
      return res.status(groqResponse.status).json({
        error:
          data?.error?.message ||
          "Groq API request failed."
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        error: "Groq returned no assistant response."
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("Chat API error:", error);

    return res.status(500).json({
      error: "Server error",
      details: error?.message || "Unknown error"
    });
  }
}
