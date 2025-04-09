const form = document.getElementById("personaForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("💡 Form submitted");

  const url = document.getElementById("url").value;
  const jobTitle = document.getElementById("jobTitle").value;

  // Clear previous content
  clearPersonaCard();
  document.getElementById("personaCard").classList.remove("hidden");

  try {
    const response = await fetch("http://localhost:3000/generate-persona", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        job_title: jobTitle,
        industry: "Technology",
      }),
    });

    const data = await response.json();

    if (data.persona) {
      populatePersonaCard(data.persona);
    } else {
      alert("⚠️ Error: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    alert("❌ Failed to connect to backend.");
    console.error(err);
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

// Parse GPT output and populate the card
function populatePersonaCard(text) {
  const sections = text.split(/\*\*(.*?)\*\*/g).map(s => s.trim()).filter(Boolean);
  const sectionMap = {
    "Persona Name": "personaName",
    "Job Titles": "jobTitles",
    "Background": "background",
    "Responsibilities": "responsibilities",
    "Pain Points": "painPoints",
    "Goals": "goals",
    "Objections to Our Tool": "objections",
    "How Our Tool Helps": "howWeHelp"
  };

  for (let i = 0; i < sections.length; i += 2) {
    const sectionName = sections[i];
    const content = sections[i + 1];

    const elementId = sectionMap[sectionName];
    if (!elementId) continue;

    const element = document.getElementById(elementId);

    if (element.tagName === "UL") {
      const lines = content.split("\n").filter(line => line.startsWith("-") || line.startsWith("•"));
      lines.forEach(line => {
        const li = document.createElement("li");
        li.textContent = line.replace(/^[-•]\s*/, "");
        element.appendChild(li);
      });
    } else {
      element.textContent = content;
    }
  }
}
