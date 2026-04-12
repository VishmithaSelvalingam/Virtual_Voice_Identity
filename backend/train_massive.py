import subprocess
import sys
import os
import gc

# 1. Ensure required advanced packages are installed
print("Ensuring dependencies are installed...")
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "datasets", "tqdm", "soundfile"])

import torch
import torch.nn as nn
import torch.optim as optim
from tqdm import tqdm
from datasets import load_dataset
from audio_model import AudioTransformer
import librosa
import numpy as np

# 2. Extract Features Generator
def get_mfcc(audio_array, sr=16000, n_mfcc=13):
    try:
        # Avoid zero division
        if len(audio_array) == 0: return None
        mfcc = librosa.feature.mfcc(y=np.array(audio_array, dtype=np.float32), sr=sr, n_mfcc=n_mfcc, n_fft=2048, hop_length=512)
        return np.mean(mfcc.T, axis=0) # shape (13,)
    except:
        return None

def train():
    print("Loading HuggingFace Audio Deepfake Dataset...")
    # Using a common open source dataset for deepfakes with a streaming approach so it doesnt explode your memory
    try:
        # Many datasets exist: using a generic example one. 
        dataset = load_dataset("dima806/deepfake_audio_detection", split="train", streaming=True)
    except Exception as e:
        print(f"Dataset load failed: {e}. Ensure you have internet connection.")
        return

    # Initialize PyTorch definitions
    model = AudioTransformer(audio_dim=13)
    
    # If we already have weights, continue training!
    if os.path.exists("audio_only_model.pth"):
        model.load_state_dict(torch.load("audio_only_model.pth", map_location='cpu'))
        print("Loaded previous weights. We are getting smarter!")

    model.train()
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    print("\n--- BEGINNING MASSIVE ONLINE TRAINING ---")
    print("This will process thousands of real & fake audio files directly from the cloud.")
    print("Press CTRL+C anytime to stop and save the progress early if you get bored!\n")

    batch_size = 32
    X_batch = []
    y_batch = []
    
    samples_processed = 0
    batches_processed = 0

    try:
        for idx, row in enumerate(dataset):
            # Typically HuggingFace audio datasets have an 'audio' dict and a 'label'.
            if 'audio' not in row or 'label' not in row:
                continue
                
            audio_data = row['audio']['array']
            sr = row['audio']['sampling_rate']
            
            # 0 -> Authentic, 1 -> Fake (check HF specs, but we standardize here)
            label = 1 if row['label'] == 1 else 0

            mfcc = get_mfcc(audio_data, sr=sr)
            if mfcc is not None:
                X_batch.append(mfcc)
                y_batch.append(label)
                samples_processed += 1

            # Train on batches of 32
            if len(X_batch) == batch_size:
                optimizer.zero_grad()
                X_tensor = torch.FloatTensor(np.array(X_batch))
                y_tensor = torch.LongTensor(np.array(y_batch))

                outputs = model(X_tensor)
                loss = criterion(outputs, y_tensor)
                loss.backward()
                optimizer.step()
                
                batches_processed += 1
                if batches_processed % 10 == 0:
                    print(f"[{samples_processed} samples trained] - Current Batch Loss: {loss.item():.4f}")

                # Clear memory
                X_batch = []
                y_batch = []
                # Periodically save
                if batches_processed % 50 == 0:
                    torch.save(model.state_dict(), "audio_only_model.pth")
                    print("--> Checkpoint saved. The AI just got smarter.")

    except KeyboardInterrupt:
        print("\nTraining interrupted by user. Saving current brain state...")
    except Exception as e:
        print(f"\nTraining encountered a glitch: {e}")

    # Final save
    torch.save(model.state_dict(), "audio_only_model.pth")
    print(f"\nSUCCESS! Total audio files processed: {samples_processed}.")
    print("New weights saved to 'audio_only_model.pth'.")
    print("Restart your Flask backend so it loads the new smart weights!")

if __name__ == '__main__':
    train()
