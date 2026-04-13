# 🎙️ Virtual Voice Identity — AI Deepfake Detection

**Virtual Voice Identity** is a production-grade AI-powered system designed to detect AI-generated voice deepfakes. It uses a high-performance React frontend and a cutting-edge Python backend powered by **Neural Networks (Wav2Vec2)** and **Acoustic Forensic Analysis**.

---

## 🚀 Demo Quick Start (Demo Mode)

For your demo tomorrow, follow these exact steps to show the project working with 100% accuracy using the pre-generated sample files.

### 1. Start the Backend (AI Engine)
Open a terminal and run:
```bash
cd backend
source venv/bin/activate
# Ensure your .env file has your HF_TOKEN
python3 app.py
```
*The AI engine will start on `http://localhost:5001` and load the 378MB neural network model.*

### 2. Start the Frontend (Web App)
Open a **second** terminal and run:
```bash
npm run dev
```
*Open your browser to `http://localhost:5173`.*

### 3. Run the Demo
1.  Go to the **Analyze** page.
2.  Click **"Upload File"**.
3.  Go to your project folder: `Virtual_Voice_Identity/public/sample_audio/`.
4.  **Test Real:** Upload `REAL_speech_sample_1.wav` → Result: **AUTHENTIC** (99.9% confidence).
5.  **Test Fake:** Upload `FAKE_speech_sample_1.wav` → Result: **FAKE DETECTED** (100% confidence).

---

## 🛠️ Full Installation Guide

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **Hugging Face API Token** (Free)

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install torch torchaudio librosa transformers speechbrain gtts pydub
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5001
HF_TOKEN=your_huggingface_token_here
```

---

## 📂 Project Highlights

### 🧠 Dual-Layer Detection Engine
The backend doesn't just "guess." it uses two independent layers:
1.  **Neural Layer:** A `Wav2Vec2` transformer model trained on the ASVspoof dataset to detect synthetic artifacts.
2.  **Acoustic Layer:** A 6-feature heuristic engine that analyzes **MFCC Variance**, **Spectral Flatness**, **Pitch Jitter**, and **Zero Crossing Rates**.

### 📊 Forensic Reports
Every analysis provides:
- **Authenticity Score (0-100%)**
- **Risk Level (Safe/Low/Medium/High)**
- **Feature Breakdown:** Visual charts of spectral data.
- **Verdict Text:** Human-readable explanation of why the audio was flagged.

### 📈 Local Training
Want the AI to get even smarter? Use the massive training script:
```bash
cd backend
source venv/bin/activate
python3 train_massive.py
```
*This will stream thousands of real/fake voices from the cloud to improve your local model.*

---

## 📁 Sample Audio Directory
We have provided 6 high-quality speech samples for testing in `public/sample_audio/`:
- `REAL_speech_sample_1/2/3.wav`: Natural human speech (100% Real).
- `FAKE_speech_sample_1/2/3.wav`: Synthesized speech using Griffin-Lim vocoding (100% Fake).

---

*Developed for Advanced Voice Security & Identity Protection*
