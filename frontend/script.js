const form = document.getElementById("personaForm");
const loadingState = document.getElementById("loadingState");
const personaCard = document.getElementById("personaCard");

// API Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/generate-persona'
  : 'https://persona-generator-api.onrender.com/generate-persona';

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
  document.getElementById("exportButtons").classList.remove("hidden");
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
      populatePersonaCard(data);
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
function populatePersonaCard(data) {
  clearPersonaCard();
  
  personaCard.classList.add("transform", "hover:scale-105", "transition-transform", "duration-300");
  personaCard.style.background = "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)";
  personaCard.style.border = "1px solid rgba(255,255,255,0.5)";
  personaCard.style.backdropFilter = "blur(10px)";
  personaCard.style.boxShadow = "0 8px 32px rgba(31, 38, 135, 0.15)";

  console.log("Starting to populate card with text:", data.persona);
  
  // Populate persona details
  const sections = data.persona.split(/\*\*([^*]+)\*\*/);
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

  let startIndex = sections[0].trim() === "" ? 1 : 0;
  for (let i = startIndex; i < sections.length - 1; i += 2) {
    const sectionName = sections[i].trim();
    const content = sections[i + 1].trim();
    const elementId = sectionMap[sectionName];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        if (element.tagName === "UL") {
          const lines = content.split('\n')
            .map(line => line.trim())
            .filter(line => line && (line.startsWith('-') || line.startsWith('•')));
          element.innerHTML = lines.map(line => `<li>${line.replace(/^[-•]\s*/, '')}</li>`).join('');
        } else {
          element.textContent = content;
        }
      }
    }
  }

  // Populate trait analysis
  if (data.traits) {
    console.log("Populating traits:", data.traits);
    const traits = data.traits;
    
    // Update trait bars and values
    Object.entries(traits).forEach(([trait, value]) => {
      if (trait !== 'trait_descriptions') {
        const container = document.querySelector(`[data-tooltip="${trait}"]`);
        if (container) {
          const bar = container.querySelector('.trait-bar');
          const valueSpan = container.querySelector('.trait-value');
          if (bar && valueSpan) {
            const percentage = (value / 10) * 100;
            bar.style.width = `${percentage}%`;
            valueSpan.textContent = `${value}/10`;
            
            // Set tooltip content
            const description = traits.trait_descriptions?.[trait] || '';
            container.setAttribute('title', description);
            
            // Add hover effect for tooltip
            container.addEventListener('mouseenter', (e) => {
              const tooltip = document.createElement('div');
              tooltip.className = 'absolute z-50 p-2 bg-gray-900 text-white text-sm rounded shadow-lg max-w-xs';
              tooltip.style.left = '0';
              tooltip.style.bottom = '-2.5rem';
              tooltip.textContent = description;
              container.appendChild(tooltip);
            });
            
            container.addEventListener('mouseleave', () => {
              const tooltip = container.querySelector('.absolute');
              if (tooltip) tooltip.remove();
            });
          }
        }
      }
    });
  } else {
    console.warn("No traits data found in response");
  }
}

// Export functions
async function exportToPDF() {
  // Create a clone of the persona card for export
  const exportCard = personaCard.cloneNode(true);
  
  // Apply print-friendly styles
  exportCard.style.background = 'white';
  exportCard.style.maxWidth = '1000px';
  exportCard.style.margin = '0 auto';
  exportCard.style.padding = '20px';
  exportCard.classList.remove('hidden');
  
  // Configure PDF options
  const opt = {
    margin: [10, 10],
    filename: 'customer-persona.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    // Generate PDF
    await html2pdf().set(opt).from(exportCard).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
}

async function exportToWord() {
  try {
    // Check if persona exists
    const personaCard = document.getElementById('personaCard');
    
    if (!personaCard || personaCard.classList.contains('hidden')) {
      console.error('No persona generated yet');
      alert('Please generate a persona first before exporting.');
      return;
    }

    // Get all the content sections
    const sections = {
      name: document.getElementById('personaName')?.textContent?.trim() || 'Customer Persona',
      jobTitles: document.getElementById('jobTitles')?.textContent?.trim() || '',
      background: document.getElementById('background')?.textContent?.trim() || '',
      responsibilities: Array.from(document.getElementById('responsibilities')?.getElementsByTagName('li') || [])
        .map(li => li.textContent?.trim())
        .filter(text => text),
      painPoints: Array.from(document.getElementById('painPoints')?.getElementsByTagName('li') || [])
        .map(li => li.textContent?.trim())
        .filter(text => text),
      goals: Array.from(document.getElementById('goals')?.getElementsByTagName('li') || [])
        .map(li => li.textContent?.trim())
        .filter(text => text),
      objections: Array.from(document.getElementById('objections')?.getElementsByTagName('li') || [])
        .map(li => li.textContent?.trim())
        .filter(text => text),
      howWeHelp: Array.from(document.getElementById('howWeHelp')?.getElementsByTagName('li') || [])
        .map(li => li.textContent?.trim())
        .filter(text => text)
    };

    console.log('Sending persona data to backend:', sections);

    const response = await fetch('https://persona-generator-api.onrender.com/download-docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      },
      body: JSON.stringify({
        persona: sections
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate DOCX');
    }

    const blob = await response.blob();
    if (!blob) {
      throw new Error('No data received from server');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-persona.docx';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error generating Word document:', error);
    alert('Error generating Word document: ' + error.message);
  }
}

// Add event listeners for export buttons
document.getElementById('export-docx')?.addEventListener('click', exportToWord);
document.getElementById('export-pdf')?.addEventListener('click', exportToPDF);
