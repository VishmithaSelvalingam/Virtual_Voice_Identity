"""
Virtual Voice Identity - AI Audio Deepfake Detection Backend
Uses MelodyMachine/Deepfake-audio-detection-V2 with correct label mapping.
Labels confirmed: {0: 'fake', 1: 'real'}
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import logging
import numpy as np
import librosa
import soundfile as sf
import torch

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

HF_TOKEN = os.environ.get("HF_TOKEN", "")
MODEL_NAME = "MelodyMachine/Deepfake-audio-detection-V2"

# ─── Load model at startup (no ffmpeg needed — we feed numpy arrays directly) ─
model = None
extractor = None

def load_model():
    global model, extractor
    try:
        from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
        logger.info("Loading deepfake detection model...")
        extractor = Wav2Vec2FeatureExtractor.from_pretrained(MODEL_NAME, token=HF_TOKEN)
        model = Wav2Vec2ForSequenceClassification.from_pretrained(MODEL_NAME, token=HF_TOKEN)
        model.eval()
        # Confirmed labels: {0: 'fake', 1: 'real'}
        logger.info(f"Model loaded! Labels: {model.config.id2label}")
    except Exception as e:
        logger.error(f"Model load failed: {e}")
        model = None
        extractor = None

load_model()

# ─── ML Inference ─────────────────────────────────────────────────────────────
def ml_classify(y_16k):
    """Run the Wav2Vec2 classifier on a 16kHz numpy float32 array."""
    if model is None or extractor is None:
        return None, None
    try:
        inputs = extractor(y_16k, sampling_rate=16000, return_tensors="pt", padding=True)
        with torch.no_grad():
            logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=-1)[0]
        # Label 0 = fake, Label 1 = real
        fake_prob = float(probs[0].item())
        real_prob = float(probs[1].item())
        return fake_prob, real_prob
    except Exception as e:
        logger.error(f"ML inference error: {e}")
        return None, None

# ─── Acoustic Heuristic Engine (backup) ───────────────────────────────────────
def acoustic_heuristics(y, sr):
    """
    6-feature analysis. Returns fake_probability (0-1).
    AI audio tends to have: low MFCC variance, high spectral flatness,
    stable pitch, monotonous spectral centroid.
    """
    risk = []

    # 1. MFCC variance
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    mv = float(np.mean(np.var(mfcc, axis=1)))
    risk.append(0.75 if mv < 80 else 0.15)

    # 2. Spectral flatness
    flat = float(np.mean(librosa.feature.spectral_flatness(y=y)))
    risk.append(0.75 if flat > 0.05 else 0.10)

    # 3. Pitch stability
    try:
        f0, voiced, _ = librosa.pyin(y, fmin=50, fmax=500, sr=sr)
        f0c = f0[voiced & ~np.isnan(f0)] if voiced is not None else np.array([])
        if len(f0c) > 10:
            risk.append(0.80 if np.std(f0c) < 15 else 0.10)
        else:
            risk.append(0.45)
    except Exception:
        risk.append(0.45)

    # 4. ZCR anomaly
    zcr = float(np.mean(librosa.feature.zero_crossing_rate(y)))
    risk.append(0.65 if (zcr > 0.08 or zcr < 0.01) else 0.15)

    # 5. Spectral centroid monotony
    sc = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    risk.append(0.70 if np.std(sc) < 200 else 0.15)

    # 6. HNR
    harmonic, percussive = librosa.effects.hpss(y)
    hnr = float(np.mean(np.abs(harmonic)) / (np.mean(np.abs(percussive)) + 1e-8))
    risk.append(0.60 if (hnr > 10 or hnr < 0.5) else 0.20)

    return float(np.mean(risk))

# ─── Scoring ──────────────────────────────────────────────────────────────────
def generate_scoring_report(audio_path):
    # Load audio as 16kHz float32
    try:
        y, sr = librosa.load(audio_path, sr=16000)
    except Exception as e:
        raise Exception(f"Cannot decode audio: {e}")

    if len(y) < 800:
        raise Exception("Audio file is too short (< 0.05s)")

    duration = round(len(y) / 16000, 2)

    # --- ML model ---
    ml_fake, ml_real = ml_classify(y)
    ml_ok = ml_fake is not None

    # --- Heuristics ---
    h_fake = acoustic_heuristics(y, 16000)

    # --- Blend ---
    if ml_ok:
        # 75% neural net, 25% acoustics
        fake_probability = (ml_fake * 0.75) + (h_fake * 0.25)
        confidence = round(max(ml_fake, ml_real) * 100, 1)
        method = "Neural Network + Acoustic Analysis"
    else:
        fake_probability = h_fake
        confidence = round(60 + abs(h_fake - 0.5) * 80, 1)
        method = "Acoustic Heuristic Analysis (model unavailable)"

    is_fake = bool(fake_probability > 0.5)
    risk_score = round(float(fake_probability) * 100, 1)

    # Verdict text
    if is_fake:
        verdict = "Strong AI voice synthesis artifacts detected" if risk_score > 75 else "AI-generated audio patterns found"
    else:
        verdict = "Natural human vocal characteristics confirmed" if risk_score < 25 else "Mostly authentic — minor anomalies present"

    # Per-feature detail
    mfcc = librosa.feature.mfcc(y=y, sr=16000, n_mfcc=20)
    sc = librosa.feature.spectral_centroid(y=y, sr=16000)[0]
    zcr = float(np.mean(librosa.feature.zero_crossing_rate(y)))
    flat = float(np.mean(librosa.feature.spectral_flatness(y=y)))

    return {
        "status": "success",
        "is_ai_generated": is_fake,
        "overall_confidence": confidence,
        "ai_risk_score": risk_score,
        "duration": duration,
        "analysis_method": method,
        "metrics": {
            "spectral_centroid": round(float(np.mean(sc)), 2),
            "zero_crossing_rate": round(zcr, 5),
            "mfcc_variance": round(float(np.mean(np.var(mfcc, axis=1))), 3),
            "spectral_flatness": round(float(flat), 6),
        },
        "analysis": verdict,
        "ml_scores": {
            "fake": round(ml_fake * 100, 1) if ml_ok else None,
            "real": round(ml_real * 100, 1) if ml_ok else None,
        }
    }

# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.route('/api/analyze-audio', methods=['POST'])
def analyze():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audio']
    ext = (os.path.splitext(file.filename)[1] if file.filename else '') or '.webm'
    temp_path = os.path.join(os.getcwd(), f"tmp_{uuid.uuid4()}{ext}")

    try:
        file.save(temp_path)
        size_kb = round(os.path.getsize(temp_path) / 1024, 1)
        logger.info(f"Received: {file.filename} ({size_kb} KB)")
        report = generate_scoring_report(temp_path)
        logger.info(f"Result → {'FAKE' if report['is_ai_generated'] else 'REAL'} | Risk: {report['ai_risk_score']}% | Method: {report['analysis_method']}")
        return jsonify(report)
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "model_labels": model.config.id2label if model else None
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    logger.info(f"Server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
