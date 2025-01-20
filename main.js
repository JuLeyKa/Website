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

// Fake-Chatbot-Funktionalität
const sendChatBtn = document.getElementById("sendChatBtn");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

// Ein paar zufällige Antworten als Platzhalter
const botResponses = [
  "Hallo! Wie kann ich dir helfen?",
  "Ich bin hier, um Fragen zu unseren KI-Services zu beantworten!",
  "Bei Juleyka stehen Automatisierungen und Chatbots im Fokus. Erzähl mir mehr über dein Anliegen?",
  "Spannend! Hast du schon unsere Webseite durchstöbert?",
  "Das klingt super. Magst du mehr Details teilen?"
];

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-message" : "bot-message");
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (sendChatBtn && chatInput && chatMessages) {
  sendChatBtn.addEventListener("click", () => {
    const userText = chatInput.value.trim();
    if (!userText) return;
    
    // Zeige User-Nachricht
    addMessage("user", userText);
    chatInput.value = "";

    // Bot antwortet zufällig
    const randomIndex = Math.floor(Math.random() * botResponses.length);
    const botText = botResponses[randomIndex];
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