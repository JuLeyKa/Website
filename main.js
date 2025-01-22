// Chat-Overlay öffnen/schließen
const openChatBtn = document.getElementById("openChatBtn");
const closeChatBtn = document.getElementById("closeChatBtn");
const chatOverlay = document.getElementById("chatOverlay");
const chatWindow = document.getElementById("chatWindow");
const chatHeader = document.getElementById("chatHeader");

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

// Nachrichten in den Chatverlauf einfügen
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-message" : "bot-message");
  msg.textContent = text;
  chatMessages.appendChild(msg);

  // Automatisch scrollen
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// OpenAI-Fetch
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

// Senden-Knopf
if (sendChatBtn && chatInput && chatMessages) {
  sendChatBtn.addEventListener("click", async () => {
    const userText = chatInput.value.trim();
    if (!userText) return;

    addMessage("user", userText);
    chatInput.value = "";

    const botText = await getBotResponse(userText);
    addMessage("bot", botText);
  });

  // Enter-Taste
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatBtn.click();
    }
  });
}

/* ---------------------------------------------
   DRAG & DROP
   - Chat-Fenster per Header verschieben
   - Chat-Button verschieben (komplett)
--------------------------------------------- */

// DRAG-Chat-Fenster
let offsetX = 0, offsetY = 0, isDragging = false;

chatHeader?.addEventListener("mousedown", (e) => {
  isDragging = true;
  // Aktuelle Mausposition - Position des Fensters
  offsetX = e.clientX - chatWindow.offsetLeft;
  offsetY = e.clientY - chatWindow.offsetTop;

  // position:absolute, damit wir die Position ändern können
  chatWindow.style.position = "absolute";
  chatWindow.style.zIndex = 9999; // ganz oben
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const newX = e.clientX - offsetX;
  const newY = e.clientY - offsetY;

  // Begrenzung: Fenster soll nicht komplett aus dem Screen verschwinden
  const maxX = window.innerWidth - chatWindow.offsetWidth;
  const maxY = window.innerHeight - chatWindow.offsetHeight;

  chatWindow.style.left = Math.max(0, Math.min(newX, maxX)) + "px";
  chatWindow.style.top = Math.max(0, Math.min(newY, maxY)) + "px";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// DRAG-Chat-Button
let btnOffsetX = 0, btnOffsetY = 0, isBtnDragging = false;

openChatBtn?.addEventListener("dragstart", (e) => {
  // HTML5 Drag&Drop: wir nutzen DataTransfer, 
  // blockieren aber das standard-Bild
  e.dataTransfer.setDragImage(new Image(), 0, 0);
  // Speichern wir uns nur, dass wir "drag" wollen
});

openChatBtn?.addEventListener("mousedown", (e) => {
  isBtnDragging = true;
  btnOffsetX = e.clientX - openChatBtn.offsetLeft;
  btnOffsetY = e.clientY - openChatBtn.offsetTop;
  openChatBtn.style.position = "absolute";
  openChatBtn.style.zIndex = 9999;
});

document.addEventListener("mousemove", (e) => {
  if (!isBtnDragging) return;
  const newX = e.clientX - btnOffsetX;
  const newY = e.clientY - btnOffsetY;

  // Begrenzen, damit der Button nicht komplett verschwindet
  const maxX = window.innerWidth - openChatBtn.offsetWidth;
  const maxY = window.innerHeight - openChatBtn.offsetHeight;

  openChatBtn.style.left = Math.max(0, Math.min(newX, maxX)) + "px";
  openChatBtn.style.top = Math.max(0, Math.min(newY, maxY)) + "px";
});

document.addEventListener("mouseup", () => {
  isBtnDragging = false;
});
