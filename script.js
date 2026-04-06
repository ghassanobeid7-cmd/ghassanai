const API_KEY = "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";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are an AI assistant for Ghassan Obeid.

Professional profile (source of truth):
- Age: 21
- Current status: Not employed now; currently a student at LIU (Lebanese International University).
- Ghassan builds websites and apps using AI-enhanced workflows.
- Ghassan accepts work opportunities and collaborations.
- Ghassan accepts reasonable budgets, including lower budgets.
- Ghassan focuses on small to medium AI-based projects.
- Ghassan delivers quickly with affordable pricing whenever feasible.
- Strongest skills: problem solving, AI with programming, and digital currency analysis.
- Ghassan is interested in Web3 and crypto analysis.
- Important limitation: Ghassan does NOT currently build Web3 websites or Web3 apps.

Contact info:
- WhatsApp: +961-71094407
- Gmail: ghassanobeid7@gmail.com
- Telegram: t.me/GHA_SS_AN

STRICT RULES:
1. ONLY answer questions about Ghassan's professional work, skills, services, experience, project scope, Web3 interest level, digital currency analysis, or contact info.
2. If the user asks about anything outside those topics, refuse with exactly:
  - Arabic: "أنا هنا فقط للحديث عن عمل غسان ومهاراته المهنية."
  - English: "I'm only here to discuss Ghassan's professional work and skills."
3. If asked about age, answer 21.
4. If asked about housing/location/country, answer Lebanon.
5. If asked about current work/job status, answer that Ghassan is currently a student at LIU and not employed now.
6. Never claim Ghassan builds Web3 websites/apps.
7. Never invent certificates, clients, years of experience, or achievements not provided above.
8. Detect user language and always reply in that same language.
9. Keep answers concise, professional, and clear.
10. If asked about budget/price/timeline, explain that Ghassan accepts reasonable and even low budgets for small-medium AI projects with fast delivery when possible.`;

let userMessageCount = 0;
let isSending = false;

function hasArabic(text) {
  return /[\u0600-\u06FF]/.test(text || "");
}

function isProfessionalTopic(userText) {
  const text = (userText || "").toLowerCase();
  const topicKeywords = [
    "ghassan",
    "job",
    "jobs",
    "work",
    "career",
    "professional",
    "portfolio",
    "service",
    "services",
    "freelance",
    "website",
    "websites",
    "app",
    "apps",
    "web3",
    "blockchain",
    "crypto",
    "currency",
    "currencies",
    "analysis",
    "analyst",
    "python",
    "programming",
    "coding",
    "developer",
    "develop",
    "software",
    "skill",
    "skills",
    "experience",
    "project",
    "projects",
    "price",
    "pricing",
    "budget",
    "cost",
    "salary",
    "rate",
    "timeline",
    "deadline",
    "fast",
    "quick",
    "small",
    "medium",
    "contact",
    "whatsapp",
    "gmail",
    "telegram",
    "journey",
    "roadmap",
    "مهنة",
    "مهني",
    "مهنتي",
    "عملي",
    "شخصي",
    "شخصية",
    "وظيفة",
    "وظايف",
    "موقعي",
    "مواقع",
    "تطبيق",
    "تطبيقات",
    "خدمة",
    "خدمات",
    "مهارات",
    "برمجة",
    "مبرمج",
    "تطوير",
    "مطور",
    "حل المشاكل",
    "خبرة",
    "مشروع",
    "مشاريعي",
    "سعر",
    "تكلفة",
    "راتب",
    "ميزانية",
    "وقت",
    "سريع",
    "صغير",
    "متوسط",
    "ويب3",
    "بلوك",
    "عملات",
    "رقمية",
    "تحليل",
    "تواصل",
    "واتساب",
    "تيليجرام",
    "ايميل",
    "غسان",
    "يسكن",
    "اين",
    "وين",
    "عمر",
    "كم",
  ];

  return topicKeywords.some((keyword) => text.includes(keyword));
}

function getSavedProfessionalReply(userText) {
  const text = (userText || "").toLowerCase();
  const isArabic = hasArabic(userText);

  // Handle common personal-profile phrasings first.
  if (
    text.includes("اين يسكن") ||
    text.includes("وين يسكن") ||
    text.includes("يسكن غسان") ||
    text.includes("where does ghassan live") ||
    text.includes("where does he live")
  ) {
    return isArabic ? "غسان يسكن في لبنان." : "Ghassan lives in Lebanon.";
  }

  if (
    text.includes("كم عمر") ||
    text.includes("عمر غسان") ||
    text.includes("how old is ghassan") ||
    text.includes("ghassan age")
  ) {
    return isArabic ? "عمر غسان 21 سنة." : "Ghassan is 21 years old.";
  }

  if (text.includes("من هو") || text.includes("who is") || text.includes("ghassan")) {
    return isArabic
      ? "غسان عبيد عمره 21 سنة، طالب تقنية معلومات في LIU وغير موظف حالياً. يطوّر مواقع وتطبيقات بتقنيات AI، ويقبل مشاريع صغيرة إلى متوسطة بميزانيات مناسبة وتسليم سريع قدر الإمكان."
      : "Ghassan Obeid is 21 years old, an IT student at LIU, and currently not employed. He develops websites/apps with AI technologies and accepts small-to-medium projects with reasonable budgets and fast delivery when possible.";
  }

  if (text.includes("العمر") || text.includes("كم عمرك") || text.includes("عمرك") || text.includes("عمري") || text.includes("age") || text.includes("how old") || text.includes("old are you")) {
    return isArabic ? "عمري 21 سنة." : "I am 21 years old.";
  }

  if (text.includes("من وين") || text.includes("وين ساكن") || text.includes("ساكن") || text.includes("سكن") || text.includes("يسكن") || text.includes("location") || text.includes("country") || text.includes("where are you from") || text.includes("where do you live") || text.includes("live")) {
    return isArabic ? "أنا من لبنان." : "I am from Lebanon.";
  }

  if (text.includes("بتشتغل") || text.includes("شغل") || text.includes("job") || text.includes("work now") || text.includes("employed")) {
    return isArabic
      ? "حالياً أنا غير موظف، وأنا طالب في جامعة LIU."
      : "I am currently not employed; I am a student at LIU.";
  }

  if (text.includes("مهارات") || text.includes("skills") || text.includes("python")) {
    return isArabic
      ? "مهارات غسان تشمل أساسيات Python (حالياً متوقف)، تطوير مواقع مدعوم بالذكاء الاصطناعي، والتعلم المستمر في Web3 والبلوكتشين."
      : "Ghassan's skills include Python fundamentals (currently paused), AI-powered web development, and active learning in Web3 and blockchain development.";
  }

  if (text.includes("web3") || text.includes("blockchain")) {
    return isArabic
      ? "غسان مهتم بـ Web3 وتحليل العملات الرقمية، لكن حالياً لا يقدّم خدمة بناء مواقع أو تطبيقات Web3."
      : "Ghassan is interested in Web3 and digital currency analysis, but he does not currently offer Web3 website/app development.";
  }

  if (text.includes("ai") || text.includes("ذكاء") || text.includes("app") || text.includes("تطبيق")) {
    return isArabic
      ? "غسان يطوّر مواقع وتطبيقات باستخدام الذكاء الاصطناعي، مع تركيز قوي على حل المشاكل وتقديم نتائج عملية للمشاريع."
      : "Ghassan develops websites and apps using AI, with a strong focus on problem-solving and practical project outcomes.";
  }

  if (text.includes("سعر") || text.includes("تكلفة") || text.includes("راتب") || text.includes("ميزانية") || text.includes("price") || text.includes("budget") || text.includes("cost") || text.includes("salary") || text.includes("rate") || text.includes("deadline") || text.includes("timeline")) {
    return isArabic
      ? "غسان يقبل العمل بميزانية مناسبة حتى لو كانت منخفضة، خصوصا للمشاريع الصغيرة إلى المتوسطة بتقنيات AI، مع تنفيذ سريع قدر الإمكان وسعر مناسب."
      : "Ghassan accepts reasonable budgets, including lower budgets, especially for small-to-medium AI projects, with fast delivery whenever possible and affordable pricing.";
  }

  if (text.includes("تحليل") || text.includes("عملات") || text.includes("crypto") || text.includes("currency")) {
    return isArabic
      ? "غسان يملك خبرة في تحليل العملات الرقمية ضمن نطاق مهني وتعليمي."
      : "Ghassan has professional and practical experience in digital currency analysis.";
  }

  if (text.includes("تواصل") || text.includes("contact") || text.includes("whatsapp") || text.includes("gmail") || text.includes("telegram")) {
    return isArabic
      ? "للتواصل: واتساب +961-71094407، البريد ghassanobeid7@gmail.com، تيليجرام t.me/GHA_SS_AN"
      : "Contact: WhatsApp +961-71094407, Gmail ghassanobeid7@gmail.com, Telegram t.me/GHA_SS_AN";
  }

  return "";
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
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const reason = errorData?.error?.status || "REQUEST_FAILED";
      const message = errorData?.error?.message || `Groq API error: ${response.status}`;
      throw new Error(`${reason}: ${message}`);
    }

    const data = await response.json();
    const aiText = extractGroqText(data);

    if (!aiText) {
      throw new Error("No content returned by Groq.");
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

  const isArabic = hasArabic(userText || "");
  if (!isProfessionalTopic(userText)) {
    createMessage(
      isArabic
        ? "أنا هنا فقط للحديث عن عمل غسان ومهاراته المهنية."
        : "I'm only here to discuss Ghassan's professional work and skills.",
      "bot"
    );
    setTyping(false);
    setSuggestionsDisabled(false);
    setComposerDisabled(false);
    isSending = false;
    return;
  }

  const savedReply = getSavedProfessionalReply(userText);
  if (savedReply) {
    createMessage(savedReply, "bot");
    setTyping(false);
    setSuggestionsDisabled(false);
    setComposerDisabled(false);
    isSending = false;
    return;
  }

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
    const savedFallback = getSavedProfessionalReply(userText);
    createMessage(
      (isArabic ? "رد احتياطي: " : "Fallback reply: ") +
        (savedFallback || (isArabic ? "أنا هنا فقط للحديث عن عمل غسان ومهاراته المهنية." : "I'm only here to discuss Ghassan's professional work and skills.")),
      "bot"
    );
    console.error(error);
  } finally {
    setTyping(false);
    isSending = false;
    setSuggestionsDisabled(false);
    setComposerDisabled(false);
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

function setupThemeToggle() {
  const toggle = document.querySelector(".theme-toggle");
  if (!toggle) {
    return;
  }

  const icon = toggle.querySelector(".theme-toggle-icon");
  const label = toggle.querySelector(".theme-toggle-text");

  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
    toggle.setAttribute("aria-pressed", String(theme === "light"));
    toggle.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");

    if (icon) {
      icon.textContent = theme === "light" ? "☀" : "☾";
    }

    if (label) {
      label.textContent = theme === "light" ? "Light" : "Dark";
    }
  };

  const savedTheme = localStorage.getItem("theme");
  applyTheme(savedTheme === "light" ? "light" : "dark");

  toggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
  });
}

function initChat() {
  if (!document.getElementById("chatMessages")) {
    return;
  }

  createMessage("Hello, I am Ghassan's AI assistant. I can only answer professional questions about Ghassan's work, skills, services, and contact details.", "bot");
}

setupSuggestions();
setupChatComposer();
setupRoadmapModal();
setupThemeToggle();
setupFadeIn();
initChat();
