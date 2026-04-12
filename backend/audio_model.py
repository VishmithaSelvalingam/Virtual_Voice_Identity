# audio_model.py
import torch
import torch.nn as nn

class AudioTransformer(nn.Module):
    def __init__(self, audio_dim=13, hidden_dim=128, num_heads=4, num_layers=2, dropout=0.1):
        super(AudioTransformer, self).__init__()
        
        # Audio feature embedding
        self.audio_fc = nn.Sequential(
            nn.Linear(audio_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout)
        )
        
        # Simple attention layer for self-modeling
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim, 
            nhead=num_heads, 
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # Classification head -> outputs 2 logits (Real vs AI-Generated)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 2)
        )
        
    def forward(self, audio):
        # audio shape: (batch_size, audio_dim)
        emb = self.audio_fc(audio)
        emb = emb.unsqueeze(1) # Add sequence dimension -> (batch_size, 1, hidden_dim)
        
        transformer_out = self.transformer(emb) # (batch_size, 1, hidden_dim)
        output = transformer_out.squeeze(1) # Remove seq dim
        
        logits = self.classifier(output)
        return logits
