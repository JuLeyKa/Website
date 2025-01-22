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

// Chatbot-Funktionalität über Netlify Function
const sendChatBtn = document.getElementById("sendChatBtn");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

// URL der Netlify Function
const NETLIFY_FUNCTION_URL = "/.netlify/functions/openai-chat";

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-message" : "bot-message");
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getBotResponse(userText) {
  try {
    const response = await fetch(NETLIFY_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userText }) 
    });
    if (!response.ok) {
      throw new Error("Fehler beim Abrufen der Antwort von der Netlify Function.");
    }
    const data = await response.json();
    if (data.botReply) {
      return data.botReply;
    } else {
      throw new Error(data.error || "Keine Antwort erhalten");
    }
  } catch (err) {
    console.error(err);
    return "Entschuldigung, es gab ein Problem beim Abrufen der Antwort.";
  }
}

sendChatBtn.addEventListener("click", async () => {
  const userText = chatInput.value.trim();
  if (!userText) return;

  // User-Message
  addMessage("user", userText);
  chatInput.value = "";

  // Bot-Message
  const botText = await getBotResponse(userText);
  addMessage("bot", botText);
});

// Optionale Enter-Taste
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendChatBtn.click();
  }
});