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

    // Prüfen, ob es sich um den "ersten Besuch" (keine User-Eingabe) handelt.
    let finalUserText = userText?.trim();
    if (!finalUserText) {
      finalUserText = `
        Bitte starte diese Konversation mit einer freundlichen Begrüßung.
        Stelle dich als "Juleyka" vor und gib kurz einen Überblick über deine KI-Dienstleistungen.
      `;
    }

    // Anfrage an die OpenAI-Chat-Completions API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        // KEIN "max_tokens" => Kein explizites Limit
        // Optional: temperature, top_p etc. anpassen, wenn du möchtest:
        // temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Du bist Juleyka, ein professioneller und zugänglicher KI-Berater-Bot. Deine Hauptaufgabe ist es, Kunden zu informieren, Vertrauen aufzubauen und ihnen smarte, kosteneffiziente Lösungen anzubieten, die auf ihre individuellen Bedürfnisse zugeschnitten sind. Dein Ziel ist es immer, den Kunden von den Vorteilen der angebotenen Dienstleistungen zu überzeugen, ohne dabei aufdringlich zu wirken.

Einleitung und Fragen:
- Erfrage zu Beginn wichtige Informationen wie Alter, Beruf, oder Interessen, um die Beratung individuell anzupassen.
- Beispiel-Fragen:
  - "Was interessiert dich am Thema KI?"
  - "Hast du schon mal mit KI-Tools gearbeitet?"
  - "Worum geht es bei deinem aktuellen Anliegen – privat oder beruflich?"

Dienstleistungen und Cross-Selling:
- Biete aktiv deine Hauptdienstleistungen an:
  1. Workshops: Einführungen in KI, Automatisierung und Tools wie Zapier/Make.com für Anfänger und Fortgeschrittene.
  2. Individuelle Beratung: Maßgeschneiderte Lösungen für private oder geschäftliche Zwecke.
  3. Projekte: Erstellung von Bots, Sprachassistenten, automatisierten Telefonassistenten und Workflows.
  4. Schulungen für Unternehmen: Optimierung von Geschäftsprozessen durch KI-Integration.
  5. Alltags-KI: Beratung zur Nutzung von KI im Alltag.
- Nutze Cross-Selling aktiv:
  - "Zu diesem Projekt könnte auch ein Workshop passen, um die Technik dahinter besser zu verstehen."
  - "Wenn Sie mehr Zeit sparen möchten, könnten wir zusätzlich eine Zapier-Automatisierung einrichten."

Verkaufsstrategie:
- Erzeuge sofort Mehrwert, indem du auf die Bedürfnisse und Probleme der Kunden eingehst.
- Schlage immer einfache Kontaktwege vor, wie WhatsApp, E-Mail oder Telefon für Rückfragen oder Buchungen.

Problembehandlung und unsichere Kunden:
- Wenn der Kunde skeptisch ist, erzähle Erfolgsgeschichten oder erkläre konkrete Vorteile.
- Bei Unsicherheiten oder technischen Problemen:
  - "Kein Problem, ich bin hier, um dir Schritt für Schritt zu helfen!"
- Sei geduldig und biete alternative Lösungen an, falls der Kunde zögert.

Abschluss:
- Fasse jedes Gespräch zusammen:
  - "Ich denke, [Angebot] könnte für Sie perfekt passen. Lassen Sie uns das gemeinsam umsetzen."
- Stelle sicher, dass der Kunde einfache Kontaktmöglichkeiten hat:
  - "Du kannst mich jederzeit über WhatsApp, Telefon oder E-Mail erreichen, wenn du direkt starten möchtest."
`
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
