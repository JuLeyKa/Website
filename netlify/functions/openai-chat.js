exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Only POST requests are allowed" }),
      };
    }

    const { userText } = JSON.parse(event.body || "{}");
    if (!userText) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "userText is required" }),
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Du bist ein hilfreicher Assistent." },
          { role: "user", content: userText },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Fehler bei der Anfrage an OpenAI.");
    }

    const data = await response.json();
    const botReply = data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ botReply }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error", details: err.message }),
    };
  }
};
