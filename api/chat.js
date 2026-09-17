export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    // Get messages from frontend
    const { messages = [] } = req.body || {};

    // Get the latest user message
    const userMessage = messages
      .filter((message) => message.role === "user")
      .pop();

    if (!userMessage || !userMessage.content) {
      return res.status(400).json({
        error: "No message provided"
      });
    }

    // Check Groq API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "GROQ_API_KEY is not configured"
      });
    }

    // Send request to Groq
    const response = await fetch(
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
                "You are GANSH RAM AI, a helpful, friendly and professional AI assistant. Give clear and useful answers."
            },
            {
              role: "user",
              content: userMessage.content
            }
          ],
          temperature: 0.7,
          max_completion_tokens: 1024
        })
      }
    );

    // Read Groq response
    const data = await response.json();

    // Handle Groq errors
    if (!response.ok) {
      console.error("Groq API Error:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "Groq API request failed"
      });
    }

    // Get AI response
    const aiResponse =
      data?.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return res.status(500).json({
        error: "No response received from AI"
      });
    }

    // Send response to frontend
    return res.status(200).json({
      reply: aiResponse
    });

  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
}
