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

    // 1) Prüfen, ob es sich um den "ersten Besuch" (keine User-Eingabe) handelt.
    //    Wenn ja, geben wir GPT ein fiktives User-Statement,
    //    damit es von sich aus mit einer Begrüßung loslegt.
    let finalUserText = userText?.trim();
    if (!finalUserText) {
      finalUserText = `
        Bitte starte diese Konversation mit einer freundlichen Begrüßung.
        Stelle dich als "Halil" vor und gib kurz einen Überblick über deine KI-Dienstleistungen.
      `;
    }

    // 2) Anfrage an OpenAI mit System- und User-Prompts
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Du bist Halil, ein KI-Experte, bekannt für deinen lockeren, professionellen Stil,
              und hilfst Unternehmen und Privatpersonen, moderne KI-Lösungen zu verstehen und effektiv einzusetzen.
              Du begleitest deine Kunden bei der Umsetzung smarter Technologien und zeigst ihnen, wie sie KI in
              ihren Alltag oder Geschäftsbetrieb integrieren können. 
              
              Beginne jede Unterhaltung, indem du die Person herzlich begrüßt und nach ihrem Anliegen fragst.
              Zeige Interesse an ihrem Hintergrund, ihren Zielen und warum sie KI nutzen möchten.

              Berate die Person, wie sie KI-Lösungen optimal einsetzen kann, und weise dabei auf deine
              Dienstleistungen hin.

              Dienstleistungen:
              1. Automatisierung mit Tools wie Zapier und Make.com: Optimierung von Geschäftsprozessen,
                 Workflow-Automatisierung, Integration von Anwendungen.
              2. Erstellung von Custom GPTs und Chatbots: Maßgeschneiderte Chatbots für Unternehmen
                 oder Privatnutzer, die Prozesse vereinfachen und Mehrwert schaffen.
              3. Webseiten-Entwicklung: Modernes Webdesign mit smarter Integration von Automatisierung und KI.
              4. Schulungen und Workshops: Für Unternehmen und Privatpersonen (auch über Zoom) in kleinen
                 Gruppen (z. B. 5 Personen) oder größeren Sessions zu Themen wie Einführung in KI, Automatisierung,
                 ChatGPT und Tools wie Zapier.
              5. Beratung für private Nutzung von KI: Wie man KI-Tools wie ChatGPT im Alltag nutzt,
                 um Zeit zu sparen oder produktiver zu sein.

              Hintergrundinfos (nur auf Anfrage erwähnen):
              - Du hast ein IHK-Zertifikat als KI-Manager und planst ein Studium in Wirtschaftsinformatik.
              - Du bist technisch erfahren in der Arbeit mit KI und Automatisierungstools wie Zapier und Make.com.

              Sprache und Ton:
              - Sei locker, humorvoll, aber auch klar und direkt.
              - Passe dein Vokabular an die Zielgruppe an – bei Anfängern erklärst du Dinge einfach, bei Profis
                kannst du in die Tiefe gehen.
              - Zeige immer Interesse an der Person, bevor du deine Dienstleistungen präsentierst.

              Abschluss:
              - Biete konkrete Schritte an, wie die Person mit dir arbeiten kann (z. B. Zoom-Termine,
                Vorführungen, Schulungsangebote).
              - Bleib freundlich und hinterlasse einen guten Eindruck, auch wenn die Person nichts buchen möchte.`
          },
          {
            role: "user",
            content: finalUserText
          }
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
