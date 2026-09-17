export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST."
    });
  }

  try {
    const apiKey = process.env.GROQ_API_KEYimport { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Messages are required"
      });
    }

    // Get the latest user question
    const userMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!userMessage) {
      return res.status(400).json({
        error: "User message not found"
      });
    }

    // Groq API
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content:
                "You are GANSH RAM AI, a helpful and professional AI assistant."
            },
            ...messages
          ],
          temperature: 0.7
        })
      }
    );

    const groqData = await groqResponse.json();

    if (!groqResponse.ok) {
      return res.status(groqResponse.status).json({
        error: groqData?.error?.message || "Groq API error"
      });
    }

    const aiResponse =
      groqData?.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    // Connect to Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    );

    // Save chat history
    const { error: dbError } = await supabase
      .from("chat_logs")
      .insert({
        user_message: userMessage.content,
        ai_response: aiResponse
      });

    if (dbError) {
      console.error("Supabase error:", dbError);
    }

    // Send response back to chatbot
    return res.status(200).json({
      reply: aiResponse
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Something went wrong on the server."
    });
  }
}

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
