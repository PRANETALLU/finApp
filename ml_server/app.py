from flask import Flask, request, jsonify
import openai
import os

app = Flask(__name__)

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message")
    if not user_input:
        return jsonify({"error": "Message is required"}), 400

    try:
        # Use the correct Chat API method
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Or "gpt-3.5-turbo"
            messages=[
                {"role": "system", "content": "You are a financial advisor chatbot. Provide helpful financial advice."},
                {"role": "user", "content": user_input}
            ]
        )
        reply = response['choices'][0]['message']['content'].strip()
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
