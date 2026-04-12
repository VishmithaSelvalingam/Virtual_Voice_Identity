# Virtual Voice Identity (AI Deepfake Detection) 🎙️🔐

## Overview
**Virtual Voice Identity** is a production-ready AI-powered cybersecurity system designed to detect AI-generated voice deepfakes. It combines a high-performance React frontend with a robust PyTorch-based backend for real-time forensic analysis of audio recordings and calls.

## 🚀 Key Features

### 1. **Voice Forensics Engine** (`/analyze`)
- **Live Capture**: Advanced microphone interface with real-time waveform visualization.
- **Deepscan Technology**: Uses Mel-Frequency Cepstral Coefficients (MFCCs) and Spectral Analysis to identify synthetic anomalies.
- **Forensic Reports**: Detailed breakdown of results including authenticity scores, risk levels, and attack types.

### 2. **Call Audio Timeline** (`/call-detection`)
- **Segmented Analysis**: Breaks down long call recordings into 5-second segments for granular detection.
- **Interactive Timeline**: Visual markers for "Safe", "Warning", and "Threat" zones in the audio stream.
- **Detailed Audit Trail**: Per-segment scoring and anomaly reporting.

### 3. **AI Security Dashboard** (`/dashboard`)
- **Threat Metrics**: Real-time stats on total analyzed files, authentic voices, and deepfake rates.
- **Identity Health**: A visual security meter representing the overall safety of your voice identity.
- **Trend Charts**: Historical analysis of detection events over the last 7 days.

### 4. **Analysis History** (`/history`)
- **Persistent Logs**: Keep track of every analysis performed (managed via Context API).
- **Expandable Details**: Revisit full forensic reports for past recordings and calls.

## 🛠️ Technology Stack

### **Frontend**
- **React 19 & TypeScript**: Core application logic.
- **Framer Motion**: Premium micro-animations and smooth transitions.
- **Web Audio API**: Real-time local DSP heuristics (as fallback).
- **Bootstrap 5**: Responsive layout and foundation.

### **Backend (Deep Learning)**
- **Flask**: Python web server with CORS protection.
- **PyTorch**: Transformer-based model architecture for audio classification.
- **Librosa**: Expert audio feature extraction (MFCC, Spectral Centroid, ZCR).

## 📂 Project Structure
```text
Virtual_Voice/
├── backend/                # AI Analysis Engine (Python/PyTorch)
│   ├── app.py              # Flask API Endpoints
│   ├── audio_model.py      # Transformer Model Architecture
│   ├── audio_processing.py # Feature Extraction Logic
│   └── requirements.txt    # Python Dependencies
├── src/                    # Frontend Application (React/TS)
│   ├── components/         # Reusable UI Elements
│   ├── pages/              # Main Views (Home, Analyze, Dashboard, etc.)
│   ├── services/           # API Connection Layer
│   ├── styles/             # Global Theme (Cybersecurity Aesthetic)
│   └── context/            # Global State Management
└── .env                    # Frontend Environment Variables
```

## ⚙️ Installation & Setup

### **1. Setup the Backend**
Requires Python 3.8+:
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*The backend will run on `http://localhost:5000`.*

### **2. Setup the Frontend**
Requires Node.js 18+:
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
*The app will automatically connect to your backend.*

## 🛡️ Production Readiness
- **CORS Support**: Secure cross-origin resource sharing configured.
- **Robust Error Handling**: Automatic fallback to local heuristics if the backend is unreachable.
- **Thread-safe temp files**: Uses UUID for analysis session management to prevent naming collisions.
- **Optimized Assets**: Unused boilerplate (react.svg, vite.svg) removed for faster load times.

---
*Developed for Voice Security & Identity Protection*
