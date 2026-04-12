import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { DetectionResult, CallAnalysisResult } from '../services/audioAnalyzer';

interface AnalysisState {
  voiceResults: DetectionResult[];
  callResults: CallAnalysisResult[];
  addVoiceResult: (result: DetectionResult) => void;
  addCallResult: (result: CallAnalysisResult) => void;
  totalAnalyzed: number;
  authenticCount: number;
  threatCount: number;
  deepfakeRate: number;
}

const AnalysisContext = createContext<AnalysisState | null>(null);

const STORAGE_KEY = 'voiceshield_data';

function loadFromStorage(): { voiceResults: DetectionResult[]; callResults: CallAnalysisResult[] } {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return { voiceResults: [], callResults: [] };
}

function saveToStorage(voiceResults: DetectionResult[], callResults: CallAnalysisResult[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      voiceResults: voiceResults.slice(-100),
      callResults: callResults.slice(-50),
    }));
  } catch { /* ignore */ }
}

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage();
  const [voiceResults, setVoiceResults] = useState<DetectionResult[]>(stored.voiceResults);
  const [callResults, setCallResults] = useState<CallAnalysisResult[]>(stored.callResults);

  const addVoiceResult = useCallback((result: DetectionResult) => {
    setVoiceResults(prev => {
      const next = [...prev, result];
      saveToStorage(next, callResults);
      return next;
    });
  }, [callResults]);

  const addCallResult = useCallback((result: CallAnalysisResult) => {
    setCallResults(prev => {
      const next = [...prev, result];
      saveToStorage(voiceResults, next);
      return next;
    });
  }, [voiceResults]);

  const totalAnalyzed = voiceResults.length + callResults.length;
  const authenticCount = voiceResults.filter(r => r.isAuthentic).length + callResults.filter(r => r.isAuthentic).length;
  const threatCount = totalAnalyzed - authenticCount;
  const deepfakeRate = totalAnalyzed > 0 ? Math.round((threatCount / totalAnalyzed) * 100) : 0;

  return (
    <AnalysisContext.Provider value={{
      voiceResults, callResults,
      addVoiceResult, addCallResult,
      totalAnalyzed, authenticCount, threatCount, deepfakeRate,
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider');
  return ctx;
}
