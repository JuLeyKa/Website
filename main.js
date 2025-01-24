//--------------------------------------
// DOM-Elemente
//--------------------------------------
const openChatBtn = document.getElementById("openChatBtn");
const closeChatBtn = document.getElementById("closeChatBtn");
const chatOverlay = document.getElementById("chatOverlay");
const chatWindow = document.getElementById("chatWindow");
const chatHeader = document.getElementById("chatHeader");

const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

// Netlify Function
const NETLIFY_FUNCTION_URL = "/.netlify/functions/openai-chat";

// State
let isDraggingWindow = false;
let windowOffsetX = 0;
let windowOffsetY = 0;

let hasGreeted = false; // ob der Bot schon Begrüßung geschickt hat

//--------------------------------------
// Chatfenster öffnen / schließen
//--------------------------------------
if (openChatBtn) {
  openChatBtn.addEventListener("click", () => {
    // Chatfenster anzeigen
    chatOverlay.style.display = "flex";

    // Einmalige Willkommensnachricht
    if (!hasGreeted) {
      addMessage("bot", "Hallo! Ich bin Juleyka. Wie kann ich dir heute helfen?");
      hasGreeted = true;
    }
  });
}

if (closeChatBtn) {
  closeChatBtn.addEventListener("click", () => {
    // Chatfenster ausblenden
    chatOverlay.style.display = "none";
  });
}

// Klick außerhalb => Chat schließen
document.addEventListener("click", (e) => {
  if (
    chatOverlay.style.display === "flex" &&
    !chatWindow.contains(e.target) &&
    !openChatBtn.contains(e.target)
  ) {
    // Minimieren / schließen
    chatOverlay.style.display = "none";
  }
});

//--------------------------------------
// Nachricht hinzufügen
//--------------------------------------
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-message" : "bot-message");
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

//--------------------------------------
// Senden-Logik
//--------------------------------------
sendChatBtn?.addEventListener("click", async () => {
  const userText = chatInput.value.trim();
  if (!userText) return;

  addMessage("user", userText);
  chatInput.value = "";

  // Bot-Antwort holen
  const botReply = await getBotResponse(userText);
  addMessage("bot", botReply);
});

chatInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendChatBtn.click();
  }
});

//--------------------------------------
// Netlify-Function
//--------------------------------------
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
  } catch (error) {
    console.error(error);
    return "Entschuldigung, es gab ein Problem beim Abrufen der Antwort.";
  }
}

//--------------------------------------
// DRAG-FENSTER
//--------------------------------------
chatHeader?.addEventListener("mousedown", (e) => {
  isDraggingWindow = true;
  windowOffsetX = e.clientX - chatWindow.offsetLeft;
  windowOffsetY = e.clientY - chatWindow.offsetTop;

  chatWindow.style.position = "absolute";
  chatWindow.style.zIndex = 9999;
});

document.addEventListener("mousemove", (e) => {
  if (!isDraggingWindow) return;
  const newX = e.clientX - windowOffsetX;
  const newY = e.clientY - windowOffsetY;

  const maxX = window.innerWidth - chatWindow.offsetWidth;
  const maxY = window.innerHeight - chatWindow.offsetHeight;

  // clamp
  const clampedX = Math.max(0, Math.min(newX, maxX));
  const clampedY = Math.max(0, Math.min(newY, maxY));

  chatWindow.style.left = clampedX + "px";
  chatWindow.style.top = clampedY + "px";
});

document.addEventListener("mouseup", () => {
  isDraggingWindow = false;
});
