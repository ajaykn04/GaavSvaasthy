import os
import json
from google import genai
from google.genai.types import (
    GenerateContentConfig,
    GoogleSearch,
    HttpOptions,
    Tool,
)
from dotenv import load_dotenv

load_dotenv()


def analyze_symptoms(symptoms_text, stream=False):
    """
    Analyzes symptoms using the Gemini API to identify the likely disease and criticality.

    Args:
        symptoms_text (str): A string containing symptoms and related information.
        stream (bool): Whether to stream the response in real-time.

    Returns:
        str: A JSON formatted string with keys 'disease' and 'criticality',
             or an error message in JSON format.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return json.dumps({"error": "GEMINI_API_KEY environment variable not set."})

    try:
        client = genai.Client(
            api_key=api_key,
            http_options=HttpOptions(api_version="v1beta")
        )

        prompt = (
    "You are a medical assistant AI. Analyze the given symptoms and identify the most likely disease. "
    "Determine its criticality level (High, Medium, or Low). "
    "Return ONLY a valid JSON object with EXACTLY these four fields:\n"
    "- 'disease' (string)\n"
    "- 'criticality' (string)\n"
    "- 'remedy' (string)\n"
    "- 'rest' (string)\n\n"

    "Formatting Rules:\n"
    "1. 'remedy' must contain prescribed medicines with dosage in '1-0-1' format and liquid medicines in 'ml' format.\n"
    "   Example: \"Paracetamol 500mg 1-0-1, FEDCOF-LS 10ml\"\n"
    "2. Do NOT return arrays, lists, explanations, or extra text.\n"
    "3. Do NOT include markdown, headings, or analysis.\n"
    "4. 'rest' must contain number of rest days (e.g., '2 days', '5 days') or 'Not required'.\n"
    "5. Response must be strictly valid JSON.\n\n"

    f"Symptoms Input: {symptoms_text}"
)


        # if stream:
        #     print("\nAnalyzing", end="", flush=True)
        #     response_text = ""

        #     for chunk in client.models.generate_content_stream(
        #         model='gemini-2.5-flash-lite',
        #         contents=prompt,
        #     ):
        #         if chunk.text:
        #             response_text += chunk.text
        #             print(".", end="", flush=True)

        #     print()  # New line after dots
        # else:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt,
            config=GenerateContentConfig(
                tools=[
                    Tool(
                        google_search=GoogleSearch()
                    )
                ],
            )
        )
        response_text = response.text
        # Log the raw model response for examination
        with open("raw_model_response.log", "w") as f:
            f.write(response_text)

        # Extract JSON from the response
        import re
        json_str = None

        # Try to find JSON in markdown code blocks first
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON object directly (looking for curly braces)
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)

        if json_str:
            try:
                data = json.loads(json_str)
                # Parse remedies if it is a string with numbered instructions
                if 'remedies' in data and isinstance(data['remedies'], str):
                    # Split by "1. ", "2. ", etc. and clean up
                    items = re.split(r'\d+\.\s*', data['remedies'])
                    data['remedies'] = [item.strip() for item in items if item.strip()]
                
                return json.dumps(data)
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails, return raw string (caller handles error)
                pass
        print(f"Raw response text: {response_text}")
        return response_text

    except Exception as e:
        return json.dumps({"error": f"An unexpected error occurred: {str(e)}"})


# if __name__ == "__main__":
#     print("Disease Symptom Analyzer")
#     print("------------------------")

#     user_input = input("Enter symptoms and related info: ")

#     if user_input.strip():
#         result = analyze_symptoms(user_input, stream=True)
#         try:
#             # Validate if it's valid JSON
#             parsed_result = json.loads(result)
#             print("\nAnalysis Result:")
#             print(json.dumps(parsed_result, indent=4))
#         except json.JSONDecodeError:
#             print("\nError: Received invalid JSON from model.")
#             print("Raw output:", result)
#     else:
#         print("Error: Input cannot be empty.")
