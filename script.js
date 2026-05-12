const SYSTEM_PROMPT = "You are Ghassan's AI assistant. Provide professional, concise answers about Ghassan's services, pricing, delivery, payment methods, skills, and contact options. Be friendly and helpful. If unsure, say so and suggest contacting Ghassan.";
const WORKER_ENDPOINT = "https://ghassanai.dev/api/";

let userMessageCount = 0;
let isSending = false;

function hasArabic(text) {
  return /[\u0600-\u06FF]/.test(text || "");
}

function createMessage(text, type) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) {
    return;
  }

  const bubble = document.createElement("div");
  bubble.className = `message ${type}`;
  bubble.textContent = text;
  bubble.dir = hasArabic(text) ? "rtl" : "ltr";
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setTyping(isTyping) {
  const typingIndicator = document.getElementById("typingIndicator");
  if (!typingIndicator) {
    return;
  }
  typingIndicator.classList.toggle("hidden", !isTyping);
}

function maybeShowCta() {
  const ctaCard = document.getElementById("ctaCard");
  if (!ctaCard) {
    return;
  }
  if (userMessageCount >= 3) {
    ctaCard.classList.remove("hidden");
  }
}

function setSuggestionsDisabled(disabled) {
  const suggestions = document.getElementById("suggestions");
  if (!suggestions) {
    return;
  }

  suggestions.querySelectorAll(".suggestion-btn").forEach((button) => {
    button.disabled = disabled;
    button.setAttribute("aria-disabled", String(disabled));
  });
}

function setComposerDisabled(disabled) {
  const input = document.getElementById("chatInput");
  const sendButton = document.getElementById("chatSendBtn");

  if (input) {
    input.disabled = disabled;
  }

  if (sendButton) {
    sendButton.disabled = disabled;
    sendButton.setAttribute("aria-disabled", String(disabled));
  }
}

function extractGroqText(data) {
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text === "string" && text.trim()) {
    return text.trim();
  }
  return "";
}

async function callGroq(userMessage) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(WORKER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt: SYSTEM_PROMPT,
        userMessage: userMessage,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const reason = errorData?.error?.status || "REQUEST_FAILED";
      const message = errorData?.error?.message || `Worker API error: ${response.status}`;
      throw new Error(`${reason}: ${message}`);
    }

    const data = await response.json();
    const aiText = extractGroqText(data);

    if (!aiText) {
      throw new Error("No content returned by the Worker.");
    }

    return aiText;
  } finally {
    clearTimeout(timeoutId);
  }
}


async function sendToAI(userText) {
  if (isSending) {
    return;
  }

  isSending = true;
  setSuggestionsDisabled(true);
  setComposerDisabled(true);
  createMessage(userText, "user");
  userMessageCount += 1;
  maybeShowCta();
  setTyping(true);

  try {
    const aiText = await callGroq(userText);
    createMessage(aiText, "bot");
  } catch (error) {
    const raw = error?.message || "Unknown Groq error";
    const details = raw.toLowerCase();
    const isArabic = hasArabic(userText || "");

    let userFriendly = isArabic
      ? "تعذر الوصول إلى خدمة Groq الآن."
      : "I could not reach the AI service right now.";

    if (details.includes("api key") || details.includes("permission") || details.includes("referer") || details.includes("api_key") || details.includes("forbidden")) {
      userFriendly = isArabic
        ? "مشكلة في مفتاح Groq أو الصلاحيات. تأكد أن المفتاح صحيح ونشط."
        : "Groq key/config issue. Check API key validity and project permissions.";
    } else if (details.includes("quota") || details.includes("resource_exhausted") || details.includes("429")) {
      userFriendly = isArabic
        ? "تم الوصول لحد الاستخدام المجاني (Quota). حاول لاحقاً أو استخدم مفتاحاً آخر."
        : "Free-tier quota reached. Please try again later or use another key.";
    } else if (details.includes("timeout") || details.includes("abort")) {
      userFriendly = isArabic
        ? "انتهت مهلة الاتصال بخدمة Groq. تحقق من الإنترنت ثم أعد المحاولة."
        : "Groq request timed out. Check your connection and try again.";
    }

    createMessage(userFriendly, "bot");
    console.error(error);
  } finally {
    setTyping(false);
    isSending = false;
    setSuggestionsDisabled(false);
    setComposerDisabled(false);
    document.getElementById("chatInput")?.focus();
  }
}

function setupSuggestions() {
  const suggestions = document.getElementById("suggestions");
  if (!suggestions) {
    return;
  }

  suggestions.querySelectorAll(".suggestion-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const message = button.dataset.message;
      if (message) {
        sendToAI(message);
      }
    });
  });
}

function setupChatComposer() {
  const input = document.getElementById("chatInput");
  const sendButton = document.getElementById("chatSendBtn");

  if (!input || !sendButton) {
    return;
  }

  const submitFromInput = () => {
    if (isSending) {
      return;
    }

    const text = (input.value || "").trim();
    if (!text) {
      return;
    }

    input.value = "";
    sendToAI(text);
  };

  sendButton.addEventListener("click", submitFromInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitFromInput();
    }
  });
}

function setupRoadmapModal() {
  const nodeModal = document.getElementById("nodeModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalStatus = document.getElementById("modalStatus");
  const modalDetail = document.getElementById("modalDetail");
  const modalClose = document.getElementById("modalClose");

  if (!nodeModal || !modalTitle || !modalStatus || !modalDetail || !modalClose) {
    return;
  }

  document.querySelectorAll(".roadmap-node").forEach((node) => {
    node.addEventListener("click", () => {
      modalTitle.textContent = node.dataset.title || "Journey Node";
      modalStatus.textContent = node.dataset.status || "";
      modalDetail.textContent = node.dataset.detail || "";
      nodeModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    });
  });

  function closeModal() {
    nodeModal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  modalClose.addEventListener("click", closeModal);

  nodeModal.addEventListener("click", (event) => {
    if (event.target === nodeModal) {
      closeModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !nodeModal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

function setupFadeIn() {
  const nodes = document.querySelectorAll(".fade-in");
  if (!nodes.length) {
    return;
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    nodes.forEach((node) => observer.observe(node));
  } else {
    nodes.forEach((node) => node.classList.add("visible"));
  }
}

function setupMobileNav() {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileDropdown = document.getElementById("mobileDropdown");

  if (!header || !menuToggle || !mobileDropdown) {
    return;
  }

  const closeMenu = () => {
    header.classList.remove("mobile-menu-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    header.classList.add("mobile-menu-open");
    menuToggle.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
  };

  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = header.classList.contains("mobile-menu-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileDropdown.querySelectorAll("a, .theme-toggle").forEach((menuItem) => {
    menuItem.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        closeMenu();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 768) {
      return;
    }

    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}

function setupThemeToggle() {
  const toggles = Array.from(document.querySelectorAll(".theme-toggle"));
  if (!toggles.length) {
    return;
  }

  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);

    toggles.forEach((toggle) => {
      const icon = toggle.querySelector(".theme-toggle-icon");
      const label = toggle.querySelector(".theme-toggle-text");

      toggle.setAttribute("aria-pressed", String(theme === "light"));
      toggle.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");

      if (icon) {
        icon.textContent = theme === "light" ? "☀" : "☾";
      }

      if (label) {
        label.textContent = theme === "light" ? "Light" : "Dark";
      }
    });
  };

  const savedTheme = localStorage.getItem("theme");
  applyTheme(savedTheme === "light" ? "light" : "dark");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
      applyTheme(nextTheme);
    });
  });
}

function initChat() {
  if (!document.getElementById("chatMessages")) {
    return;
  }

  createMessage("Hello, I am Ghassan's AI assistant. I can answer professional questions about Ghassan's services, pricing, delivery, payment methods, skills, and contact details.", "bot");
}

setupSuggestions();
setupChatComposer();
setupRoadmapModal();
setupMobileNav();
setupThemeToggle();
setupFadeIn();
initChat();
