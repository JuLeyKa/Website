/*********************************************/
/* CHAT-FUNKTIONEN (unverändert)             */
/*********************************************/
//--------------------------------------
// DOM-Elemente für den Chat
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

// Chat-Drag-State
let isDraggingWindow = false;
let windowOffsetX = 0;
let windowOffsetY = 0;

let hasGreeted = false; // Ob der Bot schon Begrüßung geschickt hat

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
    chatOverlay &&
    chatOverlay.style.display === "flex" &&
    chatWindow &&
    openChatBtn &&
    !chatWindow.contains(e.target) &&
    !openChatBtn.contains(e.target)
  ) {
    chatOverlay.style.display = "none";
  }
});

//--------------------------------------
// Nachricht hinzufügen
//--------------------------------------
function addMessage(sender, text) {
  if (!chatMessages) return;
  const msg = document.createElement("div");
  msg.classList.add(sender === "user" ? "user-message" : "bot-message");
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

//--------------------------------------
// Senden-Logik (Netlify Chatbot)
//--------------------------------------
if (sendChatBtn && chatInput) {
  sendChatBtn.addEventListener("click", async () => {
    const userText = chatInput.value.trim();
    if (!userText) return;

    addMessage("user", userText);
    chatInput.value = "";

    // Bot-Antwort holen
    const botReply = await getBotResponse(userText);
    addMessage("bot", botReply);
  });

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatBtn.click();
    }
  });
}

//--------------------------------------
// Netlify-Function für Chat
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
if (chatHeader && chatWindow) {
  chatHeader.addEventListener("mousedown", (e) => {
    isDraggingWindow = true;
    windowOffsetX = e.clientX - chatWindow.offsetLeft;
    windowOffsetY = e.clientY - chatWindow.offsetTop;

    chatWindow.style.position = "absolute";
    chatWindow.style.zIndex = 9999;
  });
}

document.addEventListener("mousemove", (e) => {
  if (!isDraggingWindow || !chatWindow) return;
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

/*********************************************/
/* FIREBASE CONFIG & AUTH-LOGIK             */
/*********************************************/
// 1) Firebase-Konfiguration (bitte anpassen!)
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "juleykaauth.firebaseapp.com",
  projectId: "juleykaauth",
  storageBucket: "juleykaauth.appspot.com",
  messagingSenderId: "153071148995",
  appId: "1:153071148995:web:3420c0a68d9d8ee2f9a776",
  measurementId: "G-NZFEETFNFJ"
};

// 2) Firebase initialisieren
firebase.initializeApp(firebaseConfig);

// Shortcut zu Auth
const auth = firebase.auth();

/*********************************************/
/* LOGIN.HTML - E-Mail/Pass + Google         */
/*********************************************/
if (document.getElementById("login-form")) {
  // E-Mail/Passwort-Login
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailVal = document.getElementById("email").value;
    const passVal = document.getElementById("password").value;
    try {
      const result = await auth.signInWithEmailAndPassword(emailVal, passVal);
      console.log("Angemeldet als:", result.user.email);
      window.location = "member.html";
    } catch (error) {
      alert("Login fehlgeschlagen: " + error.message);
    }
  });

  // Google-Login
  const googleBtn = document.getElementById("googleLoginBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        const result = await auth.signInWithPopup(provider);
        console.log("Angemeldet via Google:", result.user.displayName);
        window.location = "member.html";
      } catch (error) {
        alert("Fehler beim Google-Login: " + error.message);
      }
    });
  }

  // Registrierung
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const regEmail = document.getElementById("reg-email").value;
      const regPass = document.getElementById("reg-password").value;
      try {
        const result = await auth.createUserWithEmailAndPassword(regEmail, regPass);
        console.log("Registrierung erfolgreich:", result.user.email);
        window.location = "member.html";
      } catch (error) {
        alert("Registrierung fehlgeschlagen: " + error.message);
      }
    });
  }
}

/*********************************************/
/* MEMBER.HTML - Check Login + Logout        */
/*********************************************/
if (document.getElementById("logoutBtn")) {
  // Check, ob user eingeloggt. Falls nicht -> login.html
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location = "login.html";
    } else {
      console.log("Eingeloggt als:", user.email);
    }
  });

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
    window.location = "login.html";
  });
}
