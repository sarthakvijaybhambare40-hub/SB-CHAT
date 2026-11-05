
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");
const newChatButton = document.getElementById("newChat");
const sendButton = chatForm.querySelector("button");
const chatHistoryList = document.getElementById("chatHistory");

let chats = JSON.parse(localStorage.getItem("sbChats") || "[]");
let currentChatId = null;

function saveChats() {
  localStorage.setItem("sbChats", JSON.stringify(chats));
}

function createChat() {
  const chat = {
    id: Date.now().toString(),
    title: "New Chat",
    messages: []
  };

  chats.unshift(chat);
  currentChatId = chat.id;
  saveChats();
  showWelcome();
  renderChatList();
}

function getCurrentChat() {
  return chats.find(chat => chat.id === currentChatId);
}

function addMessage(message, sender, save = true) {
  const welcome = chatMessages.querySelector(".welcome");
  if (welcome) welcome.remove();

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = message;

  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (save && message.trim()) {
    const chat = getCurrentChat();
    if (chat) {
      chat.messages.push({ message, sender });

      if (sender === "user" && chat.title === "New Chat") {
        chat.title = message.slice(0, 25);
      }

      saveChats();
      renderChatList();
    }
  }

  return bubble;
}

function showWelcome() {
  chatMessages.innerHTML = `
    <div class="welcome">
      <h1>Hello! 👋</h1>
      <p>How can I help you today?</p>
    </div>
  `;
}

function openChat(id) {
  currentChatId = id;
  const chat = getCurrentChat();

  if (!chat) return;

  chatMessages.innerHTML = "";

  if (chat.messages.length === 0) {
    showWelcome();
  } else {
    chat.messages.forEach(item => {
      addMessage(item.message, item.sender, false);
    });
  }

  renderChatList();
}

function renderChatList() {
  chatHistoryList.innerHTML = "";

  chats.forEach(chat => {
    const button = document.createElement("button");
    button.className = "history-item";
    button.textContent = chat.title;
    button.type = "button";

    if (chat.id === currentChatId) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => openChat(chat.id));
    chatHistoryList.appendChild(button);
  });
}

if (chats.length > 0) {
  currentChatId = chats[0].id;
  openChat(currentChatId);
} else {
  createChat();
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");

  userInput.value = "";
  userInput.disabled = true;
  sendButton.disabled = true;

  const loadingBubble = addMessage("", "bot", false);

  loadingBubble.innerHTML = `
    <div class="typing-dots" aria-label="AI is typing">
      <span></span><span></span><span></span>
    </div>
  `;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    loadingBubble.textContent = data.reply || "No response received.";

    const chat = getCurrentChat();
    if (chat) {
      chat.messages.push({
        message: loadingBubble.textContent,
        sender: "bot"
      });
      saveChats();
    }

  } catch (error) {
    loadingBubble.textContent = "Error: " + error.message;

    const chat = getCurrentChat();
    if (chat) {
      chat.messages.push({
        message: loadingBubble.textContent,
        sender: "bot"
      });
      saveChats();
    }

  } finally {
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
});

newChatButton.addEventListener("click", createChat);
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("sidebar-open");
});