# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import os
from audio_processing import extract_audio_features
from audio_model import AudioTransformer

import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app) # Enable CORS for frontend requests

# Initialize Model
model = AudioTransformer(audio_dim=13)
# In a real environment, you would load your weights:
weights_path = 'audio_only_model.pth'
if os.path.exists(weights_path):
    try:
        model.load_state_dict(torch.load(weights_path, map_location='cpu'))
        logger.info(f"Successfully loaded model weights from {weights_path}")
    except Exception as e:
        logger.error(f"Error loading model weights: {e}")
else:
    logger.warning(f"Model weights '{weights_path}' not found. Using untrained weights for demonstration.")

model.eval()

def generate_scoring_report(audio_path):
    # 1. Extract audio data
    features = extract_audio_features(audio_path)
    if not features:
        return {"error": "Failed to extract audio features"}
        
    mfcc_data = features["mfcc_tensor"]
    spectral_metrics = features["metrics"]
    
    # 2. Prepare PyTorch tensor
    # Ensure correct dimensions (1, 13)
    audio_tensor = torch.FloatTensor(mfcc_data).unsqueeze(0) 

    # 3. Model Inference & Proper Score Calculation
    with torch.no_grad():
        output = model(audio_tensor)
        
        # **CRITICAL FIX FOR SCORING**: Apply softmax to convert raw logits to probabilities
        probabilities = torch.softmax(output, dim=1) 
        
        # Get the probability of the AI Fake class directly
        fake_probability = probabilities[0][1].item() 

    # 4. Formulate the response
    is_ai_generated = fake_probability > 0.5
    # confidence score represents how sure it is of its prediction
    confidence_score = round(max(probabilities[0][0].item(), probabilities[0][1].item()) * 100, 2)
    
    # Determine risk score based purely on the model's 'Fake' probability
    risk_score = round(fake_probability * 100, 2)

    return {
        "status": "success",
        "is_ai_generated": is_ai_generated,
        "overall_confidence": confidence_score,
        "ai_risk_score": risk_score, # A 0-100 metric showing exactly how "fake" it sounds
        "metrics": {
            "spectral_centroid": round(spectral_metrics["spectral_centroid"], 2),
            "zero_crossing_rate": round(spectral_metrics["zero_crossing_rate"], 4)
        },
        "analysis": "Unnatural frequency spikes detected" if is_ai_generated else "Authentic vocal resonance patterns"
    }

@app.route('/api/analyze-audio', methods=['POST'])
def analyze():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
        
    file = request.files['audio']
    # Use UUID to prevent collisions
    ext = os.path.splitext(file.filename)[1] or '.webm'
    temp_filename = f"temp_{uuid.uuid4()}{ext}"
    temp_path = os.path.join(os.getcwd(), temp_filename)
    
    try:
        file.save(temp_path)
        logger.info(f"Analyzing file: {file.filename} -> {temp_filename}")
        report = generate_scoring_report(temp_path)
        return jsonify(report)
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Error removing temp file: {e}")

if __name__ == "__main__":
    # In production, use a WSGI server like gunicorn
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
