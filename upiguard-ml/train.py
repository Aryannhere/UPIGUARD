import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
import joblib
import os

DATA_PATH = 'data/transactions.csv'
MODEL_DIR = 'models'
os.makedirs(MODEL_DIR, exist_ok=True)

print("="*50)
print("UPIGUARD — ML Training Pipeline v2")
print("="*50)

# ── Load ──────────────────────────────────────────────────────
df = pd.read_csv(DATA_PATH)
df['Timestamp'] = pd.to_datetime(df['Timestamp'])

# ── Feature Engineering ───────────────────────────────────────
df['hour']             = df['Timestamp'].dt.hour
df['day_of_week']      = df['Timestamp'].dt.dayofweek
df['is_weekend']       = (df['day_of_week'] >= 5).astype(int)
df['is_night']         = (df['hour'].between(0, 5)).astype(int)
df['is_late_night']    = (df['hour'].between(22, 23)).astype(int)
df['amount']           = df['Amount (INR)']
df['amount_log']       = np.log1p(df['amount'])
df['is_large']         = (df['amount'] > 7000).astype(int)
df['is_very_large']    = (df['amount'] > 9000).astype(int)
df['is_round']         = (df['amount'] % 500 == 0).astype(int)

def extract_bank(upi):
    return str(upi).split('@')[1] if '@' in str(upi) else 'unknown'

df['sender_bank']   = df['Sender UPI ID'].apply(extract_bank)
df['receiver_bank'] = df['Receiver UPI ID'].apply(extract_bank)
df['same_bank']     = (df['sender_bank'] == df['receiver_bank']).astype(int)

# ── Create smarter fraud label ────────────────────────────────
# Combine multiple risk signals to create fraud score
# High risk = multiple suspicious signals at once
df['risk_score'] = (
    df['is_night'] * 3 +
    df['is_late_night'] * 2 +
    df['is_very_large'] * 3 +
    df['is_large'] * 2 +
    df['is_weekend'] * 1 +
    (~df['same_bank'].astype(bool)).astype(int) * 2 +
    df['is_round'] * 1
)

# Fraud if FAILED AND high risk score
df['is_fraud'] = (
    (df['Status'] == 'FAILED') & (df['risk_score'] >= 4)
).astype(int)

# Also mark very high risk as fraud regardless of status
df.loc[df['risk_score'] >= 8, 'is_fraud'] = 1

print(f"[INFO] Fraud distribution: {dict(df['is_fraud'].value_counts())}")

# ── Encode ────────────────────────────────────────────────────
le_s = LabelEncoder()
le_r = LabelEncoder()
df['sender_bank_enc']   = le_s.fit_transform(df['sender_bank'])
df['receiver_bank_enc'] = le_r.fit_transform(df['receiver_bank'])
joblib.dump(le_s, f'{MODEL_DIR}/le_sender_bank.pkl')
joblib.dump(le_r, f'{MODEL_DIR}/le_receiver_bank.pkl')

FEATURES = [
    'amount', 'amount_log', 'hour', 'day_of_week',
    'is_weekend', 'is_night', 'is_late_night',
    'same_bank', 'is_large', 'is_very_large',
    'is_round', 'risk_score',
    'sender_bank_enc', 'receiver_bank_enc',
]

X = df[FEATURES]
y = df['is_fraud']

# ── Split ─────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── Scale ─────────────────────────────────────────────────────
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)
joblib.dump(scaler, f'{MODEL_DIR}/scaler.pkl')

# ── Train ─────────────────────────────────────────────────────
print("[INFO] Training Random Forest...")
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=20,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)
model.fit(X_train_s, y_train)

# ── Evaluate ──────────────────────────────────────────────────
y_pred = model.predict(X_test_s)
y_prob = model.predict_proba(X_test_s)[:, 1]

print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"ROC-AUC:  {roc_auc_score(y_test, y_prob):.4f}")
print(classification_report(y_test, y_pred, target_names=['Legit', 'Fraud']))

# ── Save ──────────────────────────────────────────────────────
joblib.dump(model,    f'{MODEL_DIR}/rf_model.pkl')
joblib.dump(FEATURES, f'{MODEL_DIR}/features.pkl')
print("[COMPLETE] Model saved!")