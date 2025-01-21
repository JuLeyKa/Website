// Chat-Overlay öffnen/schließen
const openChatBtn = document.getElementById("openChatBtn");
const closeChatBtn = document.getElementById("closeChatBtn");
const chatOverlay = document.getElementById("chatOverlay");

if (openChatBtn && closeChatBtn && chatOverlay) {
  openChatBtn.addEventListener("click", () => {
    chatOverlay.style.display = "flex";
  });

  closeChatBtn.addEventListener("click", () => {
    chatOverlay.style.display = "none";
  });
}

// Chatbot-Funktionalität mit OpenAI API
const sendChatBtn = document.getElementById("sendChatBtn");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

const API_URL = "https://api.openai.com/v1/chat/completions";

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-message" : "bot-message");
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getBotResponse(userText) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` // Umgebungsvariable nutzen
      },
      body: JSON.stringify({
        model: "asst_FDFfN12YU6VMAYT3V8nm1J4", // Custom GPT-Modell
        messages: [
          { role: "system", content: "Du bist ein hilfreicher Assistent." },
          { role: "user", content: userText }
        ]
      })
    });

    if (!response.ok) {
      throw new Error("Fehler beim Abrufen der Antwort von OpenAI.");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return "Entschuldigung, es gab ein Problem beim Abrufen der Antwort.";
  }
}

if (sendChatBtn && chatInput && chatMessages) {
  sendChatBtn.addEventListener("click", async () => {
    const userText = chatInput.value.trim();
    if (!userText) return;

    // Zeige User-Nachricht
    addMessage("user", userText);
    chatInput.value = "";

    // Hole Bot-Antwort
    const botText = await getBotResponse(userText);
    addMessage("bot", botText);
  });
}

// Optionale Funktion: Absenden mit Enter-Taste
if (chatInput) {
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatBtn.click();
    }
  });
}
