import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaUpload, FaStop, FaRedo, FaCheckCircle, FaExclamationTriangle, FaWaveSquare, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { analyzeAudioFile, VoiceRecorder, type DetectionResult, type FeatureScore } from '../services/audioAnalyzer';
import { useAnalysis } from '../context/AnalysisContext';

const AnalyzeVoice = () => {
    const [activeTab, setActiveTab] = useState<'record' | 'upload'>('upload');
    const [status, setStatus] = useState<'idle' | 'recording' | 'analyzing' | 'result' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [result, setResult] = useState<DetectionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recordTime, setRecordTime] = useState(0);
    const [uploadedFileName, setUploadedFileName] = useState<string>('');
    const recorderRef = useRef<VoiceRecorder | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addVoiceResult } = useAnalysis();

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (status === 'recording') {
            interval = setInterval(() => setRecordTime(t => t + 1), 1000);
        } else {
            setRecordTime(0);
        }
        return () => clearInterval(interval);
    }, [status]);

    const startRecording = async () => {
        try {
            setError(null);
            const recorder = new VoiceRecorder();
            await recorder.start();
            recorderRef.current = recorder;
            setStatus('recording');
        } catch (err) {
            setError('Microphone access denied. Please allow microphone permissions and try again.');
            setStatus('error');
        }
    };

    const stopRecording = async () => {
        if (!recorderRef.current) return;
        try {
            const audioBlob = await recorderRef.current.stop();
            recorderRef.current = null;
            await runAnalysis(audioBlob, 'Live Recording');
        } catch (err) {
            setError('Failed to process recording. Please try again.');
            setStatus('error');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('audio/')) {
            setError('Invalid file type. Please upload an audio file (MP3, WAV, FLAC, OGG, WebM).');
            setStatus('error');
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            setError('File too large. Maximum size is 100MB.');
            setStatus('error');
            return;
        }

        setUploadedFileName(file.name);
        await runAnalysis(file, file.name);

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (!file.type.startsWith('audio/')) {
            setError('Invalid file type. Please drop an audio file.');
            setStatus('error');
            return;
        }
        setUploadedFileName(file.name);
        await runAnalysis(file, file.name);
    };

    const runAnalysis = async (audio: Blob | File, name: string) => {
        setStatus('analyzing');
        setProgress(0);
        setError(null);

        try {
            const detection = await analyzeAudioFile(audio, (stage, percent) => {
                setProgressLabel(stage);
                setProgress(percent);
            });
            detection.fileName = name;
            setResult(detection);
            addVoiceResult(detection);
            setStatus('result');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Analysis failed. The audio file may be corrupted or unsupported.';
            setError(message);
            setStatus('error');
        }
    };

    const reset = () => {
        setStatus('idle');
        setProgress(0);
        setProgressLabel('');
        setResult(null);
        setError(null);
        setUploadedFileName('');
    };

    const formatTime = (s: number) => {
        const min = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    };

    const getVerdictColor = (verdict: FeatureScore['verdict']) => {
        switch (verdict) {
            case 'normal': return 'text-success';
            case 'suspicious': return 'text-warning';
            case 'anomalous': return 'text-danger';
        }
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h2 className="font-display mb-2">Voice Forensics Engine</h2>
                <div className="mx-auto rounded mb-3" style={{ height: '4px', width: '60px', background: 'var(--primary-gradient)' }}></div>
                <p className="text-secondary">Upload or record audio to detect AI-generated synthetic speech with real spectral analysis.</p>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-8">

                    {/* TABS */}
                    {(status === 'idle' || status === 'error') && (
                        <div className="cyber-card p-1 d-inline-flex mb-4 rounded-3 p-2 bg-black border border-dark">
                            <button
                                className={`btn btn-sm px-4 rounded-2 fw-semibold ${activeTab === 'upload' ? 'bg-dark text-brand shadow-sm border border-secondary' : 'text-muted'}`}
                                onClick={() => { setActiveTab('upload'); setError(null); }}
                            >
                                <FaUpload className="me-2" />Upload File
                            </button>
                            <button
                                className={`btn btn-sm px-4 rounded-2 fw-semibold ${activeTab === 'record' ? 'bg-dark text-brand shadow-sm border border-secondary' : 'text-muted'}`}
                                onClick={() => { setActiveTab('record'); setError(null); }}
                            >
                                <FaMicrophone className="me-2" />Live Capture
                            </button>
                        </div>
                    )}

                    {/* ERROR DISPLAY */}
                    {error && (
                        <div className="alert alert-danger bg-opacity-10 border-danger d-flex align-items-center gap-3 mb-4">
                            <FaExclamationTriangle className="text-danger flex-shrink-0" />
                            <div className="small text-light">{error}</div>
                            <button className="btn btn-sm btn-outline-danger ms-auto" onClick={reset}>Retry</button>
                        </div>
                    )}

                    {/* MAIN CARD */}
                    <div className="cyber-card p-5 text-center d-flex flex-column align-items-center justify-content-center border-dark shadow-lg" style={{ minHeight: '420px', background: 'linear-gradient(180deg, #111 0%, #050505 100%)' }}>

                        {/* STATE: IDLE - RECORD */}
                        {status === 'idle' && activeTab === 'record' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="mb-5 position-relative">
                                    <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-brand opacity-10" style={{ width: '140px', height: '140px', filter: 'blur(20px)' }}></div>
                                    <button
                                        type="button"
                                        onClick={startRecording}
                                        aria-label="Start recording"
                                        className="btn rounded-circle p-0 d-flex align-items-center justify-content-center position-relative"
                                        style={{ width: '90px', height: '90px', background: 'var(--primary-gradient)', boxShadow: '0 10px 30px rgba(255, 107, 0, 0.3)' }}
                                    >
                                        <FaMicrophone size={32} className="text-white" />
                                    </button>
                                </div>
                                <h4 className="text-white mb-2 fw-bold font-display">Start Recording</h4>
                                <p className="text-muted small">Click the microphone to record your voice for analysis.</p>
                                <p className="text-muted small mt-2"><FaInfoCircle className="me-1" />Record at least 3 seconds for accurate results.</p>
                            </motion.div>
                        )}

                        {/* STATE: IDLE - UPLOAD */}
                        {status === 'idle' && activeTab === 'upload' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-100">
                                <div
                                    className="border border-secondary rounded-3 p-5 w-100 position-relative"
                                    style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleFileUpload}
                                        className="d-none"
                                        aria-label="Upload audio file"
                                    />
                                    <div className="mb-4 d-inline-block p-3 rounded-circle bg-dark border border-secondary">
                                        <FaUpload size={28} className="text-brand" />
                                    </div>
                                    <h5 className="text-white fw-semibold">Drag & Drop Audio File</h5>
                                    <p className="text-muted small mb-3">or click to browse</p>
                                    <span className="badge bg-secondary bg-opacity-10 text-muted border border-secondary fw-normal px-3 py-2">MP3, WAV, FLAC, OGG, WebM — Max 100MB</span>
                                </div>
                            </motion.div>
                        )}

                        {/* STATE: RECORDING */}
                        {status === 'recording' && (
                            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                                <div className="mb-5 position-relative">
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="position-absolute top-50 start-50 translate-middle rounded-circle bg-brand"
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                    <button type="button" onClick={stopRecording} aria-label="Stop recording" className="btn rounded-circle p-4 d-flex align-items-center justify-content-center shadow-lg position-relative" style={{ background: '#222', border: '2px solid #333', zIndex: 1 }}>
                                        <FaStop size={24} className="text-white" />
                                    </button>
                                </div>
                                <div className="d-flex gap-1 justify-content-center align-items-center mb-4" style={{ height: '50px' }}>
                                    {[...Array(16)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [15, 45, 15], backgroundColor: ['#333', '#ff6b00', '#333'] }}
                                            transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.04 }}
                                            className="rounded-pill"
                                            style={{ width: '5px' }}
                                        />
                                    ))}
                                </div>
                                <h2 className="font-monospace text-white fw-bold mb-1">{formatTime(recordTime)}</h2>
                                <div className="d-flex align-items-center justify-content-center gap-2 text-brand small fw-bold">
                                    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}>●</motion.span> REC
                                </div>
                                {recordTime < 3 && (
                                    <p className="text-warning small mt-3">Record at least 3 seconds...</p>
                                )}
                            </motion.div>
                        )}

                        {/* STATE: ANALYZING */}
                        {status === 'analyzing' && (
                            <div className="w-100">
                                <FaWaveSquare className="text-neon mb-3" size={40} />
                                <h4 className="mb-3">AI Deepscan in Progress</h4>
                                {uploadedFileName && <p className="text-muted small mb-3">Analyzing: {uploadedFileName}</p>}
                                <div className="progress mb-2" style={{ height: '6px', backgroundColor: '#0f172a' }}>
                                    <motion.div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{ width: `${progress}%`, background: 'var(--primary-gradient)', boxShadow: '0 0 10px rgba(255, 107, 0, 0.5)' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="d-flex justify-content-between text-muted small font-monospace">
                                    <span>{progressLabel}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="text-start mt-4 p-3 bg-dark rounded border border-secondary font-monospace small text-success" style={{ height: '120px', overflow: 'hidden' }}>
                                    <div>{'>'} VoiceShield_Engine_v3.0 initialized</div>
                                    {progress > 5 && <div>{'>'} Decoding audio stream...</div>}
                                    {progress > 20 && <div>{'>'} Extracting spectral features (FFT 2048)...</div>}
                                    {progress > 35 && <div>{'>'} Computing spectral flatness & centroid...</div>}
                                    {progress > 55 && <div>{'>'} Running deepfake pattern detection...</div>}
                                    {progress > 70 && <div>{'>'} Analyzing temporal energy dynamics...</div>}
                                    {progress > 85 && <div>{'>'} Computing biometric confidence score...</div>}
                                    {progress >= 95 && <div>{'>'} Finalizing forensic report...</div>}
                                </div>
                            </div>
                        )}

                        {/* STATE: RESULT */}
                        {status === 'result' && result && (
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-100">
                                <div className={`display-1 mb-3 ${result.isAuthentic ? 'text-success' : 'text-danger'}`}>
                                    {result.isAuthentic ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                </div>
                                <h2 className="mb-1">{result.isAuthentic ? 'AUTHENTIC VOICE' : 'FAKE VOICE DETECTED'}</h2>
                                <p className={`lead fw-bold mb-2 ${result.isAuthentic ? 'text-success' : 'text-danger'}`}>
                                    Confidence: {result.confidenceScore}%
                                </p>
                                <p className="text-muted small mb-4">
                                    Overall Authenticity Score: {result.overallScore}/100
                                </p>

                                {/* Summary Cards */}
                                <div className="row g-3 mb-4 text-start">
                                    <div className="col-6">
                                        <div className="p-3 rounded bg-dark border border-secondary">
                                            <span className="text-muted small d-block">Classification</span>
                                            <span className={`fw-bold ${result.isAuthentic ? 'text-success' : 'text-danger'}`}>{result.attackType}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded bg-dark border border-secondary">
                                            <span className="text-muted small d-block">Risk Level</span>
                                            <span className={`badge ${result.riskLevel === 'Safe' ? 'bg-success' : result.riskLevel === 'Low' ? 'bg-info' : result.riskLevel === 'Medium' ? 'bg-warning' : 'bg-danger'}`}>
                                                {result.riskLevel.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Feature Breakdown */}
                                <div className="text-start mb-4">
                                    <h6 className="text-uppercase small text-muted mb-3">Detailed Feature Analysis</h6>
                                    {result.breakdown.map((feature, i) => (
                                        <div key={i} className="mb-2">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span className="small text-white">{feature.name}</span>
                                                <span className={`small fw-bold ${getVerdictColor(feature.verdict)}`}>
                                                    {feature.score}/100 — {feature.verdict.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="progress" style={{ height: '4px', backgroundColor: '#1e293b' }}>
                                                <div
                                                    className={`progress-bar ${feature.verdict === 'normal' ? 'bg-success' : feature.verdict === 'suspicious' ? 'bg-warning' : 'bg-danger'}`}
                                                    style={{ width: `${feature.score}%` }}
                                                />
                                            </div>
                                            <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{feature.description}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Authenticity Meter */}
                                <div className="p-4 rounded bg-dark border border-secondary mb-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="small text-danger fw-bold">FAKE</span>
                                        <span className="small text-white fw-bold">Authenticity Score</span>
                                        <span className="small text-success fw-bold">REAL</span>
                                    </div>
                                    <div className="position-relative" style={{ height: '12px', background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)', borderRadius: '6px' }}>
                                        <motion.div
                                            initial={{ left: '0%' }}
                                            animate={{ left: `${result.overallScore}%` }}
                                            transition={{ duration: 1, type: 'spring' }}
                                            className="position-absolute"
                                            style={{ top: '-4px', transform: 'translateX(-50%)', width: '20px', height: '20px', background: 'white', borderRadius: '50%', border: '3px solid #111', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
                                        />
                                    </div>
                                    <div className="text-center mt-2">
                                        <span className="font-monospace fw-bold text-white">{result.overallScore}%</span>
                                    </div>
                                </div>

                                <button onClick={reset} className="btn btn-outline-light px-4 rounded-pill">
                                    <FaRedo className="me-2" /> Analyze Another
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyzeVoice;
