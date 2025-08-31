from flask import Flask, request, jsonify
from flask_cors import CORS
from utils import fetch_transactions, predict_expense, detect_anomalies, fetch_user_financial_data, generate_ai_financial_response

app = Flask(__name__)
CORS(app)

# Predict Expenses 

@app.route('/predict-expense', methods=['POST'])
def handle_predict_expense():
    data = request.json
    user_id = data.get('userId')
    token = data.get('token')

    try:
        transactions = fetch_transactions(user_id, token)
        result = predict_expense(transactions)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Anomaly Detection 

@app.route('/detect-anomalies', methods=['POST'])
def handle_detect_anomalies():
    data = request.json
    user_id = data.get('userId')
    token = data.get('token')

    try:
        transactions = fetch_transactions(user_id, token)
        result = detect_anomalies(transactions)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ChatBot 

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_id = data.get("userId")
    token = data.get("token")
    message = data.get("message")

    if not user_id or not token or not message:
        return jsonify({"error": "userId, token, and message are required"}), 400

    try:
        user_data = fetch_user_financial_data(user_id, token)
        ai_response = generate_ai_financial_response(user_data, message)
        return jsonify({"response": ai_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
