//----------------------------------
// DOM-Elemente ermitteln
//----------------------------------
const openChatBtn = document.getElementById("openChatBtn");
const closeChatBtn = document.getElementById("closeChatBtn");
const chatOverlay = document.getElementById("chatOverlay");
const chatWindow = document.getElementById("chatWindow");
const chatHeader = document.getElementById("chatHeader");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

// Netlify-Function (anpassen bei Bedarf)
const NETLIFY_FUNCTION_URL = "/.netlify/functions/openai-chat";

//----------------------------------
// Globale Variablen für Drag & Drop
//----------------------------------
let isDraggingWindow = false;
let windowOffsetX = 0;
let windowOffsetY = 0;
let isDraggingButton = false;
let buttonOffsetX = 0;
let buttonOffsetY = 0;

//----------------------------------
// Minimierungs-Logik
//----------------------------------
// Wir speichern in localStorage: "chatMinimized" (true/false)
// und den Chatverlauf.

function setChatVisible(isVisible) {
  // isVisible = false => Minimieren
  if (isVisible) {
    chatOverlay.style.display = "flex";
    localStorage.setItem("chatMinimized", "false");
  } else {
    chatOverlay.style.display = "none";
    localStorage.setItem("chatMinimized", "true");
  }
}

// Laden, ob der Chat minimiert war
function loadChatMinimizedState() {
  const minState = localStorage.getItem("chatMinimized");
  if (minState === "true") {
    chatOverlay.style.display = "none";
  } else {
    // Standard: ChatOverlay anzeigen
    chatOverlay.style.display = "flex";
  }
}

//----------------------------------
// Chatverlauf laden & speichern
//----------------------------------
function loadChatHistory() {
  const savedMessages = localStorage.getItem("chatMessages");
  if (savedMessages) {
    const messages = JSON.parse(savedMessages);
    messages.forEach(({ sender, text }) => {
      addMessage(sender, text, false);
    });
  }
}

function saveChatHistory() {
  if (!chatMessages) return;
  const msgs = [...chatMessages.children].map(msg => {
    const isUser = msg.classList.contains("user-message");
    return {
      sender: isUser ? "user" : "bot",
      text: msg.textContent
    };
  });
  localStorage.setItem("chatMessages", JSON.stringify(msgs));
}

//----------------------------------
// Nachricht hinzufügen
//----------------------------------
function addMessage(sender, text, save = true) {
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-message" : "bot-message");
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (save) {
    saveChatHistory();
  }
}

//----------------------------------
// Fenster- & Button-Position
//----------------------------------
function saveChatWindowPos(left, top) {
  localStorage.setItem("chatWindowPos", JSON.stringify({ left, top }));
}
function loadChatWindowPos() {
  const pos = localStorage.getItem("chatWindowPos");
  if (pos) {
    const { left, top } = JSON.parse(pos);
    chatWindow.style.position = "absolute";
    chatWindow.style.left = left + "px";
    chatWindow.style.top = top + "px";
  }
}

function saveChatButtonPos(left, top) {
  localStorage.setItem("chatButtonPos", JSON.stringify({ left, top }));
}
function loadChatButtonPos() {
  const pos = localStorage.getItem("chatButtonPos");
  if (pos) {
    const { left, top } = JSON.parse(pos);
    openChatBtn.style.position = "absolute";
    openChatBtn.style.left = left + "px";
    openChatBtn.style.top = top + "px";
  }
}

//----------------------------------
// Klick-Events (öffnen / schließen)
//----------------------------------
if (openChatBtn) {
  openChatBtn.addEventListener("click", () => {
    // Chat-Fenster sichtbar machen
    setChatVisible(true);
  });
}

if (closeChatBtn) {
  closeChatBtn.addEventListener("click", () => {
    // Minimieren
    setChatVisible(false);
  });
}

// Klick außerhalb => Minimieren
document.addEventListener("click", (e) => {
  // Check: Klick war NICHT in chatWindow, NICHT im openChatBtn
  if (
    chatOverlay.style.display === "flex" &&
    !chatWindow.contains(e.target) &&
    !openChatBtn.contains(e.target)
  ) {
    // Minimieren
    setChatVisible(false);
  }
});

//----------------------------------
// Senden-Logik
//----------------------------------
if (sendChatBtn && chatInput && chatMessages) {
  sendChatBtn.addEventListener("click", async () => {
    const userText = chatInput.value.trim();
    if (!userText) return;

    addMessage("user", userText);
    chatInput.value = "";

    const botReply = await getBotResponse(userText);
    addMessage("bot", botReply);
  });

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatBtn.click();
    }
  });
}

//----------------------------------
// OpenAI / Netlify-Function
//----------------------------------
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

//----------------------------------
// DRAG & DROP: Chat-Fenster
//----------------------------------
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

  const clampedX = Math.max(0, Math.min(newX, maxX));
  const clampedY = Math.max(0, Math.min(newY, maxY));

  chatWindow.style.left = clampedX + "px";
  chatWindow.style.top = clampedY + "px";

  saveChatWindowPos(clampedX, clampedY);
});

document.addEventListener("mouseup", () => {
  isDraggingWindow = false;
});

//----------------------------------
// DRAG & DROP: Chat-Button
//----------------------------------
openChatBtn?.addEventListener("mousedown", (e) => {
  isDraggingButton = true;
  buttonOffsetX = e.clientX - openChatBtn.offsetLeft;
  buttonOffsetY = e.clientY - openChatBtn.offsetTop;
  openChatBtn.style.position = "absolute";
  openChatBtn.style.zIndex = 9999;
});

document.addEventListener("mousemove", (e) => {
  if (!isDraggingButton) return;
  const newX = e.clientX - buttonOffsetX;
  const newY = e.clientY - buttonOffsetY;

  const maxX = window.innerWidth - openChatBtn.offsetWidth;
  const maxY = window.innerHeight - openChatBtn.offsetHeight;

  const clampedX = Math.max(0, Math.min(newX, maxX));
  const clampedY = Math.max(0, Math.min(newY, maxY));

  openChatBtn.style.left = clampedX + "px";
  openChatBtn.style.top = clampedY + "px";

  saveChatButtonPos(clampedX, clampedY);
});

document.addEventListener("mouseup", () => {
  isDraggingButton = false;
});

//----------------------------------
// OnLoad: ChatHistory + State
//----------------------------------
window.addEventListener("DOMContentLoaded", () => {
  loadChatHistory();
  loadChatMinimizedState();
  loadChatWindowPos();
  loadChatButtonPos();
});
