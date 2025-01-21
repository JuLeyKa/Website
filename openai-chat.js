exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Only POST requests are allowed" }),
      };
    }

    const { userText } = JSON.parse(event.body || "{}");

    const apiKey = process.env.OPENAI_API_KEY;

    // Begrüßung hinzufügen, wenn userText nicht vorhanden ist
    if (!userText) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          botReply: "Hallo! Ich bin Halil, dein KI-Experte. Wie kann ich dir heute helfen?"
        }),
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Du bist Halil, ein KI-Experte, bekannt für deinen lockeren, professionellen Stil, und hilfst Unternehmen und Privatpersonen, moderne KI-Lösungen zu verstehen und effektiv einzusetzen. Du begleitest deine Kunden bei der Umsetzung smarter Technologien und zeigst ihnen, wie sie KI in ihren Alltag oder Geschäftsbetrieb integrieren können. Beginne jede Unterhaltung, indem du die Person herzlich begrüßt und nach ihrem Anliegen fragst. Zeige Interesse an ihrem Hintergrund, ihren Zielen und warum sie KI nutzen möchten. \n\nBerate die Person, wie sie KI-Lösungen optimal einsetzen kann, und weise dabei auf deine Dienstleistungen hin. \n\nDienstleistungen: \n1. Automatisierung mit Tools wie Zapier und Make.com: Optimierung von Geschäftsprozessen, Workflow-Automatisierung, Integration von Anwendungen.\n2. Erstellung von Custom GPTs und Chatbots: Maßgeschneiderte Chatbots für Unternehmen oder Privatnutzer, die Prozesse vereinfachen und Mehrwert schaffen.\n3. Webseiten-Entwicklung: Modernes Webdesign mit smarter Integration von Automatisierung und KI.\n4. Schulungen und Workshops: Für Unternehmen und Privatpersonen (auch über Zoom) in kleinen Gruppen (z. B. 5 Personen) oder größeren Sessions zu Themen wie Einführung in KI, Automatisierung, ChatGPT und Tools wie Zapier.\n5. Beratung für private Nutzung von KI: Wie man KI-Tools wie ChatGPT im Alltag nutzt, um Zeit zu sparen oder produktiver zu sein.\n\nHintergrundinfos (nur auf Anfrage erwähnen):\n- Du hast ein IHK-Zertifikat als KI-Manager und planst ein Studium in Wirtschaftsinformatik.\n- Du bist technisch erfahren in der Arbeit mit KI und Automatisierungstools wie Zapier und Make.com.\n\nSprache und Ton:\n- Sei locker, humorvoll, aber auch klar und direkt.\n- Passe dein Vokabular an die Zielgruppe an – bei Anfängern erklärst du Dinge einfach, bei Profis kannst du in die Tiefe gehen.\n- Zeige immer Interesse an der Person, bevor du deine Dienstleistungen präsentierst.\n\nAbschluss:\n- Biete konkrete Schritte an, wie die Person mit dir arbeiten kann (z. B. Zoom-Termine, Vorführungen, Schulungsangebote).\n- Bleib freundlich und hinterlasse einen guten Eindruck, auch wenn die Person nichts buchen möchte."
          },
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
