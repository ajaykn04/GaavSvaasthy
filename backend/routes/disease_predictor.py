import os
import json
from flask import Flask, request, jsonify
from google import genai
from google.genai.types import GenerateContentConfig, HttpOptions
from dotenv import load_dotenv
import re

load_dotenv()
app = Flask(__name__)

def get_gemini_prediction(symptoms_text):
    api_key = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key, http_options=HttpOptions(api_version="v1beta"))

    prompt = (
        f"Analyze these symptoms: '{symptoms_text}'. "
        "Return ONLY a JSON object with: 'disease', 'criticality' (High, Medium, or Low), "
        "and 'medicines' (list of strings, or null if High risk)."
    )

    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt
    )
    
    raw_text = response.text
    # Use Regex to extract only the content between { and }
    json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    
    if json_match:
        return json.loads(json_match.group(0))
    else:
        # Fallback if Gemini doesn't return valid JSON
        return {
            "disease": "Unknown Condition",
            "criticality": "Medium",
            "medicines": ["Please consult a doctor for specific advice"]
        }

@app.route('/predict_ai', methods=['POST'])
def predict_ai():
    data = request.json
    symptoms = data.get('symptoms', '')
    try:
        prediction = get_gemini_prediction(symptoms)
        return jsonify(prediction)
    except Exception as e:
        print(f"FLASK ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001) # Running on 5001