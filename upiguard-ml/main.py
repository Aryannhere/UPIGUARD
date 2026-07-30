# FILE: upiguard-ml/main.py
# PURPOSE: FastAPI service for fraud prediction
# RUN: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import os

# ── Load Models ───────────────────────────────────────────────
MODEL_DIR = 'models'

print("[INFO] Loading ML models...")
model    = joblib.load(f'{MODEL_DIR}/rf_model.pkl')
scaler   = joblib.load(f'{MODEL_DIR}/scaler.pkl')
features = joblib.load(f'{MODEL_DIR}/features.pkl')
le_s     = joblib.load(f'{MODEL_DIR}/le_sender_bank.pkl')
le_r     = joblib.load(f'{MODEL_DIR}/le_receiver_bank.pkl')
print("[INFO] Models loaded successfully!")

# ── FastAPI App ───────────────────────────────────────────────
app = FastAPI(
    title="UPIGUARD ML Service",
    description="Real-time UPI fraud detection API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Model ─────────────────────────────────────────────
class TransactionRequest(BaseModel):
    senderUpiId:   str
    receiverUpiId: str
    amount:        float
    hour:          int = 12
    dayOfWeek:     int = 1

# ── Helper Functions ──────────────────────────────────────────
def extract_bank(upi_id: str) -> str:
    return upi_id.split('@')[1] if '@' in upi_id else 'unknown'

def encode_bank(le, bank: str) -> int:
    """Safely encode bank — return 0 if unseen."""
    try:
        return int(le.transform([bank])[0])
    except ValueError:
        return 0

def get_risk_level(score: float) -> str:
    if score >= 75:
        return "HIGH"
    elif score >= 40:
        return "MEDIUM"
    return "LOW"

# ── Prediction Endpoint ───────────────────────────────────────
@app.post("/predict")
def predict_fraud(request: TransactionRequest):
    """
    Predict fraud score for a UPI transaction.
    Returns fraud_score (0-100), risk_level, and is_fraud flag.
    """
    amount      = request.amount
    hour        = request.hour
    day_of_week = request.dayOfWeek

    # Extract banks
    sender_bank   = extract_bank(request.senderUpiId)
    receiver_bank = extract_bank(request.receiverUpiId)
    same_bank     = 1 if sender_bank == receiver_bank else 0

    # Engineer features
    amount_log     = float(np.log1p(amount))
    is_weekend     = 1 if day_of_week >= 5 else 0
    is_night       = 1 if hour <= 5 else 0
    is_late_night  = 1 if hour >= 22 else 0
    is_large       = 1 if amount > 7000 else 0
    is_very_large  = 1 if amount > 9000 else 0
    is_round       = 1 if amount % 500 == 0 else 0

    # Risk score
    risk_score = (
        is_night      * 3 +
        is_late_night * 2 +
        is_very_large * 3 +
        is_large      * 2 +
        is_weekend    * 1 +
        (1 - same_bank) * 2 +
        is_round      * 1
    )

    # Encode banks
    sender_bank_enc   = encode_bank(le_s, sender_bank)
    receiver_bank_enc = encode_bank(le_r, receiver_bank)

    # Build feature vector in exact same order as training
    feature_vector = [
        amount, amount_log, hour, day_of_week,
        is_weekend, is_night, is_late_night,
        same_bank, is_large, is_very_large,
        is_round, risk_score,
        sender_bank_enc, receiver_bank_enc,
    ]

    # Scale features
    X = scaler.transform([feature_vector])

    # Predict
    fraud_probability = model.predict_proba(X)[0][1]
    fraud_score       = round(float(fraud_probability) * 100, 2)
    risk_level        = get_risk_level(fraud_score)

    return {
        "fraud_score": fraud_score,
        "risk_level":  risk_level,
        "is_fraud":    fraud_score >= 75,
        "details": {
            "amount":        amount,
            "sender_bank":   sender_bank,
            "receiver_bank": receiver_bank,
            "same_bank":     bool(same_bank),
            "is_night":      bool(is_night),
            "is_large":      bool(is_large),
            "risk_score":    risk_score,
        }
    }

# ── Health Check ──────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "running", "model": "RandomForest", "version": "1.0.0"}

# ── Root ──────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "UPIGUARD ML Service is running!"}