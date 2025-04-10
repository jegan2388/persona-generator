// Initialize tsParticles
window.addEventListener('load', async () => {
  try {
    await tsParticles.load({
      id: "tsparticles",
      options: {
        fpsLimit: 60,
        particles: {
          number: {
            value: 50,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: "#4F46E5"
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: 0.15,
            random: true
          },
          size: {
            value: 3,
            random: true
          },
          move: {
            enable: true,
            speed: 0.8,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "bounce"
            }
          }
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            onHover: {
              enable: false
            },
            onClick: {
              enable: false
            },
            resize: true
          }
        },
        detectRetina: true,
        background: {
          color: "transparent"
        }
      }
    });
  } catch (error) {
    console.error("Error initializing particles:", error);
  }
});

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

// Loading state configuration
const loadingMessages = [
  "🧠 Analyzing customer behavior patterns...",
  "📊 Mapping key motivations and goals...",
  "🎯 Identifying pain points and needs...",
  "💡 Generating actionable insights...",
  "🤖 Finalizing your persona profile..."
];

let currentLoadingMessage = 0;
let loadingMessageInterval;
let progressInterval;
let currentProgress = 0;

function updateLoadingStep(step) {
  // Reset previous steps
  document.querySelectorAll('[id^="step"]').forEach(el => {
    el.classList.remove('loading-step-active', 'loading-step-done');
  });
  
  // Mark completed steps
  for (let i = 1; i < step; i++) {
    const stepEl = document.getElementById(`step${i}`);
    if (stepEl) stepEl.classList.add('loading-step-done');
  }
  
  // Mark current step as active
  const currentStepEl = document.getElementById(`step${step}`);
  if (currentStepEl) currentStepEl.classList.add('loading-step-active');
}

function updateProgress(progress) {
  const progressBar = document.getElementById('progressBar');
  const progressDot = document.getElementById('progressDot');
  
  if (progressBar && progressDot) {
    progressBar.style.width = `${progress}%`;
    progressDot.style.left = `${progress}%`;
  }
}

function showLoading() {
  const loadingState = document.getElementById('loadingState');
  const personaCard = document.getElementById('personaCard');
  const submitButton = document.querySelector('button[type="submit"]');
  
  // Disable form submission
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.classList.add('opacity-50', 'cursor-not-allowed');
  }
  
  // Show loading state
  loadingState.classList.remove('hidden');
  personaCard.classList.add('hidden');
  
  // Reset progress
  currentProgress = 0;
  updateProgress(currentProgress);
  
  // Start progress animation
  progressInterval = setInterval(() => {
    if (currentProgress < 90) {
      currentProgress += Math.random() * 15;
      if (currentProgress > 90) currentProgress = 90;
      updateProgress(currentProgress);
      
      // Update steps based on progress
      if (currentProgress < 25) updateLoadingStep(1);
      else if (currentProgress < 50) updateLoadingStep(2);
      else if (currentProgress < 75) updateLoadingStep(3);
      else updateLoadingStep(4);
    }
  }, 1000);
  
  // Start message rotation
  const loadingMessage = document.getElementById('loadingMessage');
  loadingMessage.textContent = loadingMessages[0];
  
  loadingMessageInterval = setInterval(() => {
    currentLoadingMessage = (currentLoadingMessage + 1) % loadingMessages.length;
    loadingMessage.textContent = loadingMessages[currentLoadingMessage];
  }, 2000);
  
  window.scrollTo({ top: loadingState.offsetTop - 100, behavior: 'smooth' });
}

function hideLoading() {
  const loadingState = document.getElementById('loadingState');
  const submitButton = document.querySelector('button[type="submit"]');
  
  // Complete the progress bar
  currentProgress = 100;
  updateProgress(currentProgress);
  updateLoadingStep(4);
  
  // Clear intervals
  clearInterval(progressInterval);
  clearInterval(loadingMessageInterval);
  
  // Reset state
  setTimeout(() => {
    loadingState.classList.add('hidden');
    currentProgress = 0;
    currentLoadingMessage = 0;
    
    // Re-enable form submission
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }, 1000);
}

function showPersona() {
  const personaCard = document.getElementById('personaCard');
  personaCard.classList.remove('hidden');
  window.scrollTo({ top: personaCard.offsetTop - 100, behavior: 'smooth' });
}

async function generatePersona(url, jobTitle) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        website: url,
        jobTitle: jobTitle
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

function clearPersonaCard() {
  const personaContent = document.getElementById('personaContent');
  const traitsContainer = document.getElementById('traitsContainer');
  
  if (personaContent) {
    personaContent.innerHTML = '';
  }
  
  if (traitsContainer) {
    traitsContainer.innerHTML = '';
  }
}

function populatePersonaCard(data) {
  clearPersonaCard();
  
  const personaContent = document.getElementById('personaContent');
  const traitsContainer = document.getElementById('traitsContainer');
  
  // Convert markdown to HTML
  const htmlContent = marked.parse(data.persona);
  personaContent.innerHTML = htmlContent;
  
  // Add traits visualization
  console.log("Populating traits:", data.traits);
  const traits = data.traits;
  
  Object.entries(traits).forEach(([trait, value]) => {
    const traitName = trait.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    const traitEl = document.createElement('div');
    traitEl.className = 'mb-4';
    
    const labelContainer = document.createElement('div');
    labelContainer.className = 'flex justify-between mb-2';
    
    const label = document.createElement('span');
    label.className = 'text-sm font-medium text-gray-600';
    label.textContent = traitName;
    
    const score = document.createElement('span');
    score.className = 'text-sm font-medium text-gray-600';
    score.textContent = `${value}/10`;
    
    labelContainer.appendChild(label);
    labelContainer.appendChild(score);
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'h-2 bg-gray-200 rounded-full overflow-hidden';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'h-full bg-blue-600 rounded-full transition-all duration-500 ease-out';
    progressBar.style.width = '0%';
    
    progressContainer.appendChild(progressBar);
    
    traitEl.appendChild(labelContainer);
    traitEl.appendChild(progressContainer);
    
    traitsContainer.appendChild(traitEl);
    
    // Animate progress bar
    setTimeout(() => {
      progressBar.style.width = `${value * 10}%`;
    }, 100);
  });
}

async function exportToPDF() {
  const personaContent = document.getElementById('personaContent');
  const traitsContainer = document.getElementById('traitsContainer');
  
  // Create a new jsPDF instance
  const doc = new jsPDF();
  
  // Add content to PDF
  doc.setFontSize(24);
  doc.text('Persona Profile', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  const splitText = doc.splitTextToSize(personaContent.textContent, 180);
  doc.text(splitText, 15, 40);
  
  // Save the PDF
  doc.save('persona-profile.pdf');
}

async function exportToWord() {
  try {
    const personaContent = document.getElementById('personaContent');
    const traitsContainer = document.getElementById('traitsContainer');
    
    const response = await fetch('/download-docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        persona: personaContent.textContent,
        traits: currentTraits
      })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'persona-profile.docx';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error('Error exporting to Word:', error);
    alert('Error exporting to Word document. Please try again.');
  }
}

// Form submission handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const url = document.getElementById("websiteUrl").value;
  const jobTitle = document.getElementById("jobTitle").value;
  
  if (!url || !jobTitle) {
    alert("Please fill in all required fields");
    return;
  }
  
  try {
    showLoading();
    const data = await generatePersona(url, jobTitle);
    hideLoading();
    populatePersonaCard(data);
    showPersona();
  } catch (error) {
    console.error("Error:", error);
    hideLoading();
    alert("An error occurred while generating the persona. Please try again.");
  }
});
