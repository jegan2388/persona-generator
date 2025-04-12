const form = document.getElementById("personaForm");
const loadingState = document.getElementById("loadingState");
const personaCard = document.getElementById("personaCard");

// API Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/generate-persona'
  : 'https://persona-generator-api.onrender.com/generate-persona';  // Replace with your actual Render URL

// Headline Animation
const headlines = [
  "Think like your buyer",
  "Prioritize what they care about",
  "Turn insight into action",
  "Help your team sell smarter"
];

let currentHeadline = 0;
const animatedText = document.getElementById("animated-text");

function animateHeadline() {
  animatedText.textContent = headlines[currentHeadline];
  animatedText.classList.remove("animate-text");
  void animatedText.offsetWidth; // Trigger reflow
  animatedText.classList.add("animate-text");
  currentHeadline = (currentHeadline + 1) % headlines.length;
}

// Start the animation
animateHeadline();
setInterval(animateHeadline, 4000);

// Fun loading messages
const loadingMessages = [
  "🔍 Scanning the digital universe...",
  "🎭 Creating your perfect persona...",
  "🧠 Teaching AI to think like your customers...",
  "✨ Sprinkling some marketing magic...",
  "📊 Crunching the numbers...",
  "🎯 Finding your ideal customer...",
  "🎨 Painting the perfect picture...",
  "🚀 Almost ready for takeoff..."
];

let currentLoadingMessage = 0;
let loadingMessageInterval;

function showLoading() {
  loadingState.classList.remove("hidden");
  personaCard.classList.add("hidden");
  
  const loadingText = loadingState.querySelector("p");
  
  // Start cycling through messages
  loadingMessageInterval = setInterval(() => {
    loadingText.innerHTML = loadingMessages[currentLoadingMessage] + '<span class="loading-dots"></span>';
    currentLoadingMessage = (currentLoadingMessage + 1) % loadingMessages.length;
  }, 2000);
  
  window.scrollTo({ top: loadingState.offsetTop - 100, behavior: 'smooth' });
}

function hideLoading() {
  loadingState.classList.add("hidden");
  clearInterval(loadingMessageInterval);
  currentLoadingMessage = 0;
}

function showPersona() {
  personaCard.classList.remove("hidden");
  window.scrollTo({ top: personaCard.offsetTop - 50, behavior: 'smooth' });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("💡 Form submitted");

  const url = document.getElementById("url").value;
  const jobTitle = document.getElementById("jobTitle").value;

  console.log("Submitting with URL:", url, "and job title:", jobTitle);

  // Show loading state
  showLoading();

  try {
    console.log("Making fetch request to backend...");
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        url: url.startsWith("http") ? url : `https://${url}`,
        job_title: jobTitle,
        industry: "Technology"
      })
    });

    console.log("Got response:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Parsed response data:", data);

    if (data.persona) {
      console.log("Successfully received persona data");
      hideLoading();
      populatePersonaCard(data.persona);
      showPersona();
    } else {
      console.error("No persona data in response:", data);
      hideLoading();
      alert("⚠️ Error: " + (data.error || "No persona data received"));
    }
  } catch (err) {
    console.error("Error in form submission:", err);
    hideLoading();
    alert("❌ Error: " + err.message);
  }
});

// Clear all card sections before new content
function clearPersonaCard() {
  const ids = [
    "personaName", "jobTitles", "background", "responsibilities",
    "painPoints", "goals", "objections", "howWeHelp"
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el.tagName === "UL") {
      el.innerHTML = "";
    } else {
      el.textContent = "";
    }
  });
}

// Update the persona card styling to look like a trading card
function populatePersonaCard(text) {
  personaCard.classList.add("transform", "hover:scale-105", "transition-transform", "duration-300");
  personaCard.style.background = "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)";
  personaCard.style.border = "1px solid rgba(255,255,255,0.5)";
  personaCard.style.backdropFilter = "blur(10px)";
  personaCard.style.boxShadow = "0 8px 32px rgba(31, 38, 135, 0.15)";

  console.log("Starting to populate card with text:", text);
  
  // Split by section headers
  const sections = text.split(/\*\*([^*]+)\*\*/);
  console.log("Parsed sections:", sections);
  
  const sectionMap = {
    "Persona Name:": "personaName",
    "Job Titles:": "jobTitles",
    "Background:": "background",
    "Responsibilities:": "responsibilities",
    "Pain Points:": "painPoints",
    "Goals:": "goals",
    "Objections to Our Tool:": "objections",
    "How Our Tool Helps:": "howWeHelp"
  };

  // Skip the first empty element if it exists
  let startIndex = sections[0].trim() === "" ? 1 : 0;

  for (let i = startIndex; i < sections.length - 1; i += 2) {
    const sectionName = sections[i].trim();
    const content = sections[i + 1].trim();
    
    console.log("Processing section:", sectionName, "with content:", content);

    const elementId = sectionMap[sectionName];
    if (!elementId) {
      console.log("No mapping found for section:", sectionName);
      continue;
    }

    const element = document.getElementById(elementId);
    if (!element) {
      console.log("Element not found for id:", elementId);
      continue;
    }

    if (element.tagName === "UL") {
      // Split content into lines and filter out empty lines
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && (line.startsWith('-') || line.startsWith('•')));
      
      // Clear existing content
      element.innerHTML = '';
      
      // Add each line as a list item with a slight delay
      lines.forEach((line, index) => {
        setTimeout(() => {
          const li = document.createElement("li");
          li.textContent = line.replace(/^[-•]\s*/, '').trim();
          li.style.opacity = "0";
          element.appendChild(li);
          requestAnimationFrame(() => {
            li.style.transition = "opacity 0.5s ease-in-out";
            li.style.opacity = "1";
          });
        }, index * 100);
      });
    } else {
      // For single text elements, show immediately
      element.textContent = content;
    }
  }
}
