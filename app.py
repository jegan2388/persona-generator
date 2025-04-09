from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
from pathlib import Path
from openai import OpenAI
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load .env file
load_dotenv(dotenv_path=Path(".env"))

# Get the OpenAI API key from the environment
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("No OpenAI API key found in environment variables")

# Initialize the OpenAI client
client = OpenAI(api_key=api_key)

app = Flask(__name__)
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:8000", "http://127.0.0.1:8000", "http://[::]:8000", "http://[::1]:8000"],
         "methods": ["GET", "POST", "OPTIONS"],
         "allow_headers": ["Content-Type"],
         "supports_credentials": True
     }}
)

def scrape_website(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.get_text(separator=" ", strip=True)
    except Exception as e:
        return f"Error scraping site: {e}"

def generate_persona(content, job_title, industry="Technology"):
    prompt = f"""
You are a B2B persona strategist with 15+ years of experience working with GTM, sales, and marketing teams to develop deep, actionable customer personas. You specialize in turning limited inputs into focused, insightful outputs that help teams align messaging, campaigns, and product strategy.

Your job is to take a website/product description and a target job title, and generate a clear, well-structured customer persona tailored to that role.

---

🧭 Guidelines:

- Do not write in paragraph format. 
- Use **bullet points only**, with clear headers for each section.
- Ensure each section is **distinct** — do not repeat ideas across sections (e.g., don't let "Goals" and "Pain Points" overlap).
- Focus on **practical, job-specific details**, not generic fluff.
- Use the scraped content as product context to make the persona relevant.
- Avoid marketing buzzwords (e.g., "synergy", "supercharge", "delightful").
- Write in a **confident, professional tone** that would feel natural in a strategy or planning document.
- Tailor everything to the job title and industry — assume this is for a real B2B team.

---

🎯 Format your output as follows (exact headers, in this order):

**Persona Name:**  
(A short fictional name for this persona)

**Job Titles:**  
- (Other job titles this persona might also hold)

**Background:**  
- (Their experience, company type, industry exposure, education if relevant)

**Responsibilities:**  
- (Key day-to-day activities they manage)

**Pain Points:**  
- (Frustrations, blockers, risks they face regularly)

**Goals:**  
- (What success looks like in their role)

**Objections to Our Tool:**  
- (Reasons they might hesitate to adopt our product)

**How Our Tool Helps:**  
- (How the product specifically solves for their pain points and supports their goals)

---

Here is the product context:

{content[:3000]}

The target persona is a {job_title} in the {industry} industry.
"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    return response.choices[0].message.content

@app.route('/generate-persona', methods=['POST'])
def generate():
    try:
        logger.info("Received generate-persona request")
        data = request.json
        logger.info(f"Request data: {data}")
        
        url = data.get("url")
        job_title = data.get("job_title")
        industry = data.get("industry", "Technology")

        if not url or not job_title:
            logger.error("Missing required fields")
            return jsonify({"error": "Missing required fields"}), 400

        website_content = scrape_website(url)
        if website_content.startswith("Error"):
            logger.error(f"Scraping error: {website_content}")
            return jsonify({"error": website_content}), 500

        logger.info("Generating persona...")
        persona = generate_persona(website_content, job_title, industry)
        logger.info("Persona generated successfully")
        
        response = {"persona": persona}
        logger.info("Sending response")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Error in generate endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)
