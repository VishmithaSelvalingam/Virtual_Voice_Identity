import { useState, useRef } from 'react';
import { FaPhoneAlt, FaFileUpload, FaPlay, FaPause, FaExclamationTriangle, FaCheckCircle, FaRedo } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { analyzeAudioSegments, type CallAnalysisResult, type SegmentAnalysis } from '../services/audioAnalyzer';
import { useAnalysis } from '../context/AnalysisContext';

const CallDetection = () => {
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [result, setResult] = useState<CallAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUrlRef = useRef<string | null>(null);
    const animFrameRef = useRef<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addCallResult } = useAnalysis();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploaded = e.target.files?.[0];
        if (!uploaded) return;

        if (!uploaded.type.startsWith('audio/')) {
            setError('Invalid file type. Please upload an audio file.');
            return;
        }
        if (uploaded.size > 200 * 1024 * 1024) {
            setError('File too large. Maximum size is 200MB for call recordings.');
            return;
        }

        setFile(uploaded);
        setError(null);
        setAnalyzing(true);
        setProgress(0);
        setResult(null);

        // Create audio element for playback
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        const url = URL.createObjectURL(uploaded);
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;

        try {
            const analysisResult = await analyzeAudioSegments(uploaded, 5, (stage, percent) => {
                setProgressLabel(stage);
                setProgress(percent);
            });
            setResult(analysisResult);
            addCallResult(analysisResult);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to analyze call recording.';
            setError(message);
        } finally {
            setAnalyzing(false);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const togglePlayback = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            cancelAnimationFrame(animFrameRef.current);
            setIsPlaying(false);
        } else {
            audio.play();
            setIsPlaying(true);
            const update = () => {
                setPlaybackTime(audio.currentTime);
                if (!audio.paused) {
                    animFrameRef.current = requestAnimationFrame(update);
                } else {
                    setIsPlaying(false);
                }
            };
            update();
        }
    };

    const resetAll = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }
        cancelAnimationFrame(animFrameRef.current);
        setFile(null);
        setResult(null);
        setError(null);
        setAnalyzing(false);
        setProgress(0);
        setIsPlaying(false);
        setPlaybackTime(0);
    };

    const formatDuration = (seconds: number): string => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const getSegmentColor = (seg: SegmentAnalysis) => {
        if (seg.isSuspicious) return seg.score < 35 ? '#ef4444' : '#f59e0b';
        return '#22c55e';
    };

    const getRiskBadgeClass = (level: string) => {
        switch (level) {
            case 'Safe': return 'bg-success';
            case 'Low': return 'bg-info';
            case 'Medium': return 'bg-warning';
            case 'High': case 'Critical': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-9">
                    <div className="text-center mb-5">
                        <h2 className="font-display mb-2">Call Audio Forensics</h2>
                        <div className="mx-auto rounded mb-3" style={{ height: '4px', width: '60px', background: 'var(--primary-gradient)' }}></div>
                        <p className="text-secondary">Upload a call recording to detect AI-manipulated segments with timeline analysis.</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger bg-opacity-10 border-danger d-flex align-items-center gap-3 mb-4">
                            <FaExclamationTriangle className="text-danger flex-shrink-0" />
                            <span className="small text-light">{error}</span>
                            <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => setError(null)}>Dismiss</button>
                        </div>
                    )}

                    {!file ? (
                        <div className="cyber-card p-5 text-center" style={{ borderStyle: 'dashed', borderColor: '#333' }}>
                            <input ref={fileInputRef} type="file" onChange={handleUpload} className="d-none" id="callUpload" accept="audio/*" />
                            <label htmlFor="callUpload" className="d-block cursor-pointer">
                                <div className="mb-4 d-inline-block p-4 rounded-circle bg-dark border border-secondary">
                                    <FaFileUpload size={36} className="text-brand" />
                                </div>
                                <h4 className="text-white mb-2">Upload Call Recording</h4>
                                <p className="text-muted mb-3">Supports WAV, MP3, OGG, WebM — Max 200MB</p>
                                <span className="btn btn-outline-info rounded-pill px-5 py-2">
                                    <FaFileUpload className="me-2" /> Choose File
                                </span>
                            </label>
                        </div>
                    ) : (
                        <div className="cyber-card p-4">
                            {/* File Header */}
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-dark p-3 rounded-circle border border-secondary">
                                        <FaPhoneAlt className="text-info" />
                                    </div>
                                    <div>
                                        <h5 className="mb-0 text-white">{file.name}</h5>
                                        <small className="text-muted">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</small>
                                    </div>
                                </div>
                                <button className="btn btn-sm btn-outline-secondary" onClick={resetAll}>
                                    <FaRedo className="me-1" /> New Scan
                                </button>
                            </div>

                            {/* Analyzing State */}
                            {analyzing && (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-info mb-3" role="status"></div>
                                    <p className="text-neon mb-2">{progressLabel}</p>
                                    <div className="progress mx-auto" style={{ height: '4px', maxWidth: '300px', backgroundColor: '#0f172a' }}>
                                        <div className="progress-bar bg-info" style={{ width: `${progress}%`, transition: 'width 0.3s' }}></div>
                                    </div>
                                    <p className="text-muted small mt-2">{progress}%</p>
                                </div>
                            )}

                            {/* Results */}
                            {!analyzing && result && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {/* Score Cards */}
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-3">
                                            <div className="p-3 bg-dark rounded border border-secondary text-center">
                                                <small className="text-muted d-block mb-1">Authenticity</small>
                                                <span className={`display-5 fw-bold ${result.overallScore >= 55 ? 'text-success' : result.overallScore >= 40 ? 'text-warning' : 'text-danger'}`}>
                                                    {result.overallScore}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-3 bg-dark rounded border border-secondary text-center">
                                                <small className="text-muted d-block mb-1">Duration</small>
                                                <span className="text-white fw-bold font-monospace">{formatDuration(result.duration)}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-3 bg-dark rounded border border-secondary text-center">
                                                <small className="text-muted d-block mb-1">Risk Level</small>
                                                <span className={`badge ${getRiskBadgeClass(result.riskLevel)}`}>{result.riskLevel}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-3 bg-dark rounded border border-secondary text-center">
                                                <small className="text-muted d-block mb-1">Suspicious</small>
                                                <span className={`fw-bold font-monospace ${result.suspiciousCount > 0 ? 'text-danger' : 'text-success'}`}>
                                                    {result.suspiciousCount}/{result.segments.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Visualizer */}
                                    <h6 className="mb-3 font-display small text-uppercase text-muted">Timeline Analysis</h6>
                                    <div className="bg-dark p-4 rounded border border-secondary mb-4">
                                        {/* Playback Controls */}
                                        <div className="d-flex align-items-center gap-3 mb-3">
                                            <button
                                                className="btn btn-sm btn-info rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ width: '32px', height: '32px' }}
                                                onClick={togglePlayback}
                                            >
                                                {isPlaying ? <FaPause size={10} /> : <FaPlay size={10} className="ms-1" />}
                                            </button>
                                            <small className="font-monospace text-muted">
                                                {formatDuration(playbackTime)} / {formatDuration(result.duration)}
                                            </small>
                                            <div className="ms-auto d-flex align-items-center gap-3">
                                                <span className="d-flex align-items-center gap-1 small">
                                                    <span className="d-inline-block rounded" style={{ width: 10, height: 10, background: '#22c55e' }}></span>
                                                    <span className="text-muted">Safe</span>
                                                </span>
                                                <span className="d-flex align-items-center gap-1 small">
                                                    <span className="d-inline-block rounded" style={{ width: 10, height: 10, background: '#f59e0b' }}></span>
                                                    <span className="text-muted">Warning</span>
                                                </span>
                                                <span className="d-flex align-items-center gap-1 small">
                                                    <span className="d-inline-block rounded" style={{ width: 10, height: 10, background: '#ef4444' }}></span>
                                                    <span className="text-muted">Threat</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Waveform */}
                                        <div className="position-relative w-100" style={{ height: '50px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                                            <div className="d-flex h-100">
                                                {result.segments.map((seg, i) => {
                                                    const widthPercent = ((seg.endTime - seg.startTime) / result.duration) * 100;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="h-100 position-relative"
                                                            style={{
                                                                width: `${widthPercent}%`,
                                                                backgroundColor: getSegmentColor(seg),
                                                                opacity: 0.6,
                                                                borderRight: '1px solid #0f172a',
                                                                transition: 'opacity 0.2s',
                                                            }}
                                                            title={`${formatDuration(seg.startTime)} - ${formatDuration(seg.endTime)}: Score ${seg.score}%${seg.isSuspicious ? ` (${seg.reason})` : ''}`}
                                                        >
                                                            {seg.isSuspicious && (
                                                                <div className="position-absolute top-50 start-50 translate-middle">
                                                                    <FaExclamationTriangle size={10} className="text-white" />
                                                                </div>
                                                            )}
                                                            <div className="position-absolute bottom-0 start-0 w-100 text-center" style={{ fontSize: '8px', color: '#fff', opacity: 0.8 }}>
                                                                {seg.score}%
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Playback cursor */}
                                            {result.duration > 0 && (
                                                <div
                                                    className="position-absolute top-0 h-100"
                                                    style={{
                                                        left: `${(playbackTime / result.duration) * 100}%`,
                                                        width: '2px',
                                                        background: '#fff',
                                                        boxShadow: '0 0 6px #fff',
                                                        zIndex: 1,
                                                        transition: 'left 0.1s linear',
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <div className="d-flex justify-content-between mt-1 text-muted small">
                                            <span>00:00</span>
                                            <span>{formatDuration(result.duration)}</span>
                                        </div>
                                    </div>

                                    {/* Segment Details Table */}
                                    <h6 className="mb-3 font-display small text-uppercase text-muted">Segment Details</h6>
                                    <div className="bg-dark rounded border border-secondary overflow-hidden mb-4">
                                        <div className="table-responsive">
                                            <table className="table table-dark table-sm mb-0" style={{ fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr className="text-muted">
                                                        <th className="border-secondary">#</th>
                                                        <th className="border-secondary">Time Range</th>
                                                        <th className="border-secondary">Score</th>
                                                        <th className="border-secondary">Status</th>
                                                        <th className="border-secondary">Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.segments.map((seg, i) => (
                                                        <tr key={i}>
                                                            <td className="border-secondary text-muted">{i + 1}</td>
                                                            <td className="border-secondary font-monospace">{formatDuration(seg.startTime)} — {formatDuration(seg.endTime)}</td>
                                                            <td className="border-secondary">
                                                                <span className={`fw-bold ${seg.score >= 55 ? 'text-success' : seg.score >= 40 ? 'text-warning' : 'text-danger'}`}>
                                                                    {seg.score}%
                                                                </span>
                                                            </td>
                                                            <td className="border-secondary">
                                                                {seg.isSuspicious
                                                                    ? <span className="badge bg-danger bg-opacity-25 text-danger">Suspicious</span>
                                                                    : <span className="badge bg-success bg-opacity-25 text-success">Clean</span>
                                                                }
                                                            </td>
                                                            <td className="border-secondary text-muted">{seg.reason || 'No anomalies detected'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Alert Summary */}
                                    {result.suspiciousCount > 0 ? (
                                        <div className="alert alert-danger bg-opacity-10 border-danger d-flex align-items-start gap-3">
                                            <FaExclamationTriangle className="text-danger flex-shrink-0 mt-1" size={20} />
                                            <div className="small text-light">
                                                <strong>Suspicious Activity Detected:</strong> {result.suspiciousCount} out of {result.segments.length} segments
                                                flagged as potentially manipulated. Attack classification: <strong>{result.attackType}</strong>.
                                                Recommended action: Verify the caller via a secondary channel.
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="alert alert-success bg-opacity-10 border-success d-flex align-items-center gap-3">
                                            <FaCheckCircle className="text-success flex-shrink-0" size={20} />
                                            <div className="small text-light">
                                                <strong>All Clear:</strong> No suspicious segments detected. The call recording appears to be authentic.
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallDetection;
