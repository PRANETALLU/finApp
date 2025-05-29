from flask import Flask, request, jsonify
from flask_cors import CORS
from utils import fetch_transactions, predict_expense, detect_anomalies

app = Flask(__name__)
CORS(app)

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


if __name__ == '__main__':
    app.run(debug=True, port=5000)
