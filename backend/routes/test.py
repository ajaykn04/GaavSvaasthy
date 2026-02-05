import json
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from disease_api import analyze_symptoms

load_dotenv()
app = Flask(__name__)

@app.route('/predict_ai', methods=['POST'])
def predict_ai():
    data = request.json
    symptoms = data.get('symptoms', '')
    try:
        # analyze_symptoms returns a JSON string
        prediction_str = analyze_symptoms(symptoms)
        
        # Parse the JSON string to a dictionary so jsonify can handle it correctly
        try:
            prediction = json.loads(prediction_str)
        except json.JSONDecodeError:
            # If the output isn't valid JSON, return it as a raw result
            prediction = {"raw_response": prediction_str}
            
        return jsonify(prediction)
    except Exception as e:
        print(f"FLASK ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001)
