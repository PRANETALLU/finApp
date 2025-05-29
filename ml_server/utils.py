import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
import requests
from dateutil.relativedelta import relativedelta

def fetch_transactions(user_id, token):
    url = f"http://localhost:8080/api/transactions/{user_id}"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

def predict_expense(transactions):
    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df_expense = df[df['type'] == 'EXPENSE']

    if df_expense.empty:
        return {
            "predicted_next_3_months_expense": [],
            "total_expense_previous_months": 0.0,
            "previous_months_expense": []
        }

    df_expense['year_month'] = df_expense['date'].dt.to_period('M')
    monthly_expense = (
        df_expense.groupby('year_month')['amount']
        .sum()
        .reset_index()
        .sort_values('year_month')
    )
    monthly_expense['year_month'] = monthly_expense['year_month'].dt.to_timestamp()

    # Save full month list before lag shift for accurate reporting
    full_months_list = [
        {"month": row['year_month'].strftime('%B %Y'), "amount": float(row['amount'])}
        for _, row in monthly_expense.iterrows()
    ]

    if len(monthly_expense) < 4:
        last_date = monthly_expense['year_month'].max()
        last_amount = monthly_expense['amount'].iloc[-1]
        return {
            "predicted_next_3_months_expense": [
                {"month": (last_date + relativedelta(months=i)).strftime('%B %Y'), "amount": float(last_amount)}
                for i in range(1, 4)
            ],
            "total_expense_previous_months": float(monthly_expense['amount'].sum()),
            "previous_months_expense": full_months_list
        }

    # Create lag features
    WINDOW_SIZE = 3
    for i in range(1, WINDOW_SIZE + 1):
        monthly_expense[f'lag_{i}'] = monthly_expense['amount'].shift(i)

    train_data = monthly_expense.dropna()

    X = train_data[[f'lag_{i}' for i in range(WINDOW_SIZE, 0, -1)]]
    y = train_data['amount']

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    last_known_row = monthly_expense.iloc[-1]
    last_known = [last_known_row['amount']] + [last_known_row[f'lag_{i}'] for i in range(1, WINDOW_SIZE)]

    last_date = last_known_row['year_month']
    predictions = []
    for i in range(1, 4):
        pred = model.predict([last_known[:WINDOW_SIZE]])[0]
        future_month = (last_date + relativedelta(months=i)).strftime('%B %Y')
        predictions.append({"month": future_month, "amount": float(pred)})
        last_known = [pred] + last_known[:-1]

    total_expense_previous_months = sum(item['amount'] for item in full_months_list)

    return {
        "predicted_next_3_months_expense": predictions,
        "total_expense_previous_months": float(total_expense_previous_months),
        "previous_months_expense": full_months_list
    }


def detect_anomalies(transactions):
    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df_expense = df[df['type'] == 'EXPENSE'] if 'type' in df.columns else df  # Optional type check

    if len(df_expense) < 5:
        return {"error": "Not enough data for anomaly detection."}

    typical_amount = df_expense['amount'].median()  # or use mean()

    model = IsolationForest(contamination=0.2, random_state=42)
    df_expense['anomaly'] = model.fit_predict(df_expense[['amount']])

    anomalies = df_expense[df_expense['anomaly'] == -1][['id', 'amount', 'category', 'date']]
    anomalies['overspent'] = anomalies['amount'] - typical_amount
    anomalies['date'] = anomalies['date'].astype(str)

    return anomalies.to_dict(orient='records')
