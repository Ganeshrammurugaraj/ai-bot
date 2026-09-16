export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY is not configured in Vercel Environment Variables." });
  }

  try {
    const body = req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const temperature = Number(body.temperature ?? 0.7);

    const system = {
      role: "system",
      content: `You are GANSH RAM AI, a professional and helpful Generative AI assistant.
Give accurate answers. Explain difficult topics in simple language. Use examples when useful.
Organize answers using headings and bullet points. For programming questions, provide clean code.
Never invent information when uncertain. Maintain a professional and friendly tone.`
    };

    const cleanMessages = messages
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [system, ...cleanMessages],
        temperature: Math.min(Math.max(temperature, 0), 1),
        max_completion_tokens: 2048
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Groq API request failed."
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response was returned."
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error." });
  }
}
