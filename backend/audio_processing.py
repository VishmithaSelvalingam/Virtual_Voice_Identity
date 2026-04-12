# audio_processing.py
import librosa
import numpy as np

def extract_audio_features(audio_path, sr=16000, n_mfcc=13):
    """
    Combines MFCC and Spectral Features into a single audio profile.
    """
    try:
        # Load audio file directly
        audio, sr = librosa.load(audio_path, sr=sr, mono=True)
        
        # 1. Extract MFCC features
        mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc, n_fft=2048, hop_length=512)
        mfcc_mean = np.mean(mfcc.T, axis=0) # Shape: (13,)
        
        # 2. Extract Spectral features
        spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr))
        spectral_rolloff = np.mean(librosa.feature.spectral_rolloff(y=audio, sr=sr))
        zcr = np.mean(librosa.feature.zero_crossing_rate(audio))
        
        # Return as a dictionary for backend routing
        return {
            "mfcc_tensor": mfcc_mean,
            "metrics": {
                "spectral_centroid": float(spectral_centroid),
                "spectral_rolloff": float(spectral_rolloff),
                "zero_crossing_rate": float(zcr)
            }
        }
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return None
