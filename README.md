# Virtual Voice Identity Vault 🎙️🔐

## Overview
The **Virtual Voice Identity Vault** is a cutting-edge frontend application designed to demonstrate the capabilities of AI-based Deepfake Voice Detection. It provides a futuristic, security-focused interface for analyzing audio, detecting synthetic speech, and managing secure voice identities.

## 🚀 Features

### 1. **Voice Analysis Engine** (`/analyze`)
- **Live Recording**: Interactive microphone UI with pulse animations.
- **File Upload**: Drag & drop support for audio files.
- **AI Simulation**: Realistic processing states, fake scanning logs, and detailed result cards (Real vs. Fake, Confidence Score, Attack Type).

### 2. **Call Audio Forensics** (`/call-detection`)
- **Timeline Visualization**: Visual representation of call audio with "Safe" (Green) and "Suspicious" (Red) segments.
- **Deepfake Risk Meter**: Overall risk assessment for uploaded calls.

### 3. **Voice Vault** (`/vault`)
- **Secure Storage Concept**: Demonstrates a mock encrypted vault for voice identities.
- **Biometric Lock**: Interactive Lock/Unlock simulation.

### 4. **How It Works** (`/how-it-works`)
- **Visual Pipeline**: Step-by-step explanation of the AI detection process.

### 5. **Security Dashboard** (`/dashboard`)
- **Metrics**: Total analyzed voices, threats blocked, deepfake trends.
- **Charts**: CSS-only animated bar charts for threat history.

## 🛠️ Tech Stack & Design
- **Core**: React 18, TypeScript, Vite
- **Styling**: Bootstrap 5 (Structure) + Custom CSS Variables (`src/styles/theme.css`)
- **Theme**: Cyber-Security Aesthetic (Dark Mode, Neon Cyan/Purple, Glassmorphism)
- **Animations**: Framer Motion + CSS Keyframes
- **Icons**: React Icons (FaShield, FaMicrophone, etc.)

## 📂 Folder Structure
```
src/
│── components/       # Reusable UI components (Navbar, Footer)
│── pages/            # Main application screens
│   ├── Home.tsx
│   ├── AnalyzeVoice.tsx
│   ├── CallDetection.tsx
│   ├── VoiceVault.tsx
│   ├── Dashboard.tsx
│   └── HowItWorks.tsx
│── services/         # Mock API layer for future backend connection
│── styles/           # Global theme and variables
│── App.tsx           # Routing and Layout
└── main.tsx          # Entry point
```

## 🍎 Running on macOS

### 1. Prerequisites
Ensure you have **Node.js** installed. If not, you can install it using [Homebrew](https://brew.sh/):
```bash
# Update Homebrew
brew update

# Install Node.js
brew install node
```

### 2. Setup & Run
Open your terminal (Terminal or iTerm) and navigate to the project directory:

```bash
# 1. Install project dependencies
npm install

# 2. Start the development server
npm run dev
```

The app will match your system's dark mode settings and is fully optimized for Retina displays.

## 🪟 Running on Windows / Linux

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

---
*Developed for Advanced Agentic Coding - User Task*
