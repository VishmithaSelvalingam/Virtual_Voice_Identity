import { useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaMicrophone, FaPhoneAlt, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalysis } from '../context/AnalysisContext';
import type { DetectionResult, CallAnalysisResult } from '../services/audioAnalyzer';

type HistoryItem =
    | { type: 'voice'; data: DetectionResult }
    | { type: 'call'; data: CallAnalysisResult };

const History = () => {
    const { voiceResults, callResults } = useAnalysis();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'voice' | 'call'>('all');

    // Merge and sort by timestamp (newest first)
    const allItems: HistoryItem[] = [
        ...voiceResults.map(r => ({ type: 'voice' as const, data: r })),
        ...callResults.map(r => ({ type: 'call' as const, data: r })),
    ].sort((a, b) => new Date(b.data.timestamp).getTime() - new Date(a.data.timestamp).getTime());

    const filtered = filter === 'all' ? allItems : allItems.filter(i => i.type === filter);

    const getItemId = (item: HistoryItem, index: number) => `${item.type}-${item.data.timestamp}-${index}`;

    const formatDate = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            + ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getRiskBadge = (level: string) => {
        switch (level) {
            case 'Safe': return 'bg-success';
            case 'Low': return 'bg-info';
            case 'Medium': return 'bg-warning';
            case 'High': case 'Critical': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 55) return 'text-success';
        if (score >= 40) return 'text-warning';
        return 'text-danger';
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h2 className="font-display mb-2">Analysis History</h2>
                <div className="mx-auto rounded mb-3" style={{ height: '4px', width: '60px', background: 'var(--primary-gradient)' }}></div>
                <p className="text-secondary">All your voice and call analyses in one place. Click any item to view full details.</p>
            </div>

            {/* Filter Tabs */}
            <div className="d-flex justify-content-center mb-4">
                <div className="cyber-card p-1 d-inline-flex rounded-3 p-2 bg-black border border-dark">
                    {(['all', 'voice', 'call'] as const).map(f => (
                        <button
                            key={f}
                            type="button"
                            className={`btn btn-sm px-4 rounded-2 fw-semibold ${filter === f ? 'bg-dark text-brand shadow-sm border border-secondary' : 'text-muted'}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? 'All' : f === 'voice' ? 'Voice Analysis' : 'Call Detection'}
                            <span className="ms-2 badge bg-secondary bg-opacity-25 text-muted">
                                {f === 'all' ? allItems.length : allItems.filter(i => i.type === f).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="cyber-card p-5 text-center">
                    <FaClock size={50} className="text-muted opacity-25 mb-4" />
                    <h4 className="text-white mb-2">No Analysis History Yet</h4>
                    <p className="text-muted mb-4">
                        {filter === 'all'
                            ? 'Upload or record audio on the Analyze or Detect page to see results here.'
                            : filter === 'voice'
                                ? 'No voice analyses yet. Go to the Analyze page to get started.'
                                : 'No call analyses yet. Go to the Detect page to upload a call recording.'}
                    </p>
                    <a href={filter === 'call' ? '/call-detection' : '/analyze'} className="btn btn-primary rounded-pill px-4">
                        Start Analyzing
                    </a>
                </div>
            )}

            {/* History List */}
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    {filtered.map((item, index) => {
                        const id = getItemId(item, index);
                        const isExpanded = expandedId === id;
                        const isVoice = item.type === 'voice';
                        const data = item.data;
                        const score = data.overallScore;
                        const isAuthentic = isVoice
                            ? (data as DetectionResult).isAuthentic
                            : (data as CallAnalysisResult).isAuthentic;
                        const fileName = isVoice
                            ? (data as DetectionResult).fileName || 'Live Recording'
                            : (data as CallAnalysisResult).fileName;
                        const riskLevel = isVoice
                            ? (data as DetectionResult).riskLevel
                            : (data as CallAnalysisResult).riskLevel;

                        return (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="mb-3"
                            >
                                {/* Summary Row */}
                                <div
                                    className={`cyber-card p-0 overflow-hidden ${isExpanded ? 'border-info border-opacity-50' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setExpandedId(isExpanded ? null : id)}
                                >
                                    <div className="p-4 d-flex align-items-center gap-3">
                                        {/* Icon */}
                                        <div className={`p-3 rounded-circle ${isAuthentic ? 'bg-success' : 'bg-danger'} bg-opacity-10 flex-shrink-0`}>
                                            {isAuthentic
                                                ? <FaCheckCircle size={20} className="text-success" />
                                                : <FaExclamationTriangle size={20} className="text-danger" />
                                            }
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-grow-1 overflow-hidden">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <span className={`badge ${isVoice ? 'bg-info' : 'bg-purple'} bg-opacity-25 ${isVoice ? 'text-info' : 'text-warning'}`}>
                                                    {isVoice ? <><FaMicrophone size={10} className="me-1" />Voice</> : <><FaPhoneAlt size={10} className="me-1" />Call</>}
                                                </span>
                                                <h6 className="mb-0 text-white text-truncate">{fileName}</h6>
                                            </div>
                                            <small className="text-muted">{formatDate(data.timestamp)}</small>
                                        </div>

                                        {/* Score */}
                                        <div className="text-end flex-shrink-0 me-2">
                                            <div className={`h4 mb-0 font-monospace fw-bold ${getScoreColor(score)}`}>{score}%</div>
                                            <small className={isAuthentic ? 'text-success' : 'text-danger'}>
                                                {isAuthentic ? 'Authentic' : 'Fake'}
                                            </small>
                                        </div>

                                        {/* Risk Badge */}
                                        <span className={`badge ${getRiskBadge(riskLevel)} flex-shrink-0`}>{riskLevel}</span>

                                        {/* Expand Arrow */}
                                        <div className="text-muted flex-shrink-0">
                                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="border-top border-secondary border-opacity-25 p-4" onClick={e => e.stopPropagation()}>
                                                    {isVoice ? (
                                                        <VoiceDetail result={data as DetectionResult} />
                                                    ) : (
                                                        <CallDetail result={data as CallAnalysisResult} />
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ─── Voice Analysis Detail ─────────────────────────────────

function VoiceDetail({ result }: { result: DetectionResult }) {
    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'normal': return 'text-success';
            case 'suspicious': return 'text-warning';
            case 'anomalous': return 'text-danger';
            default: return 'text-muted';
        }
    };

    return (
        <div>
            {/* Summary Grid */}
            <div className="row g-3 mb-4">
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-dark border border-secondary text-center">
                        <small className="text-muted d-block">Confidence</small>
                        <span className="text-white fw-bold font-monospace">{result.confidenceScore}%</span>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-dark border border-secondary text-center">
                        <small className="text-muted d-block">Classification</small>
                        <span className={`fw-bold small ${result.isAuthentic ? 'text-success' : 'text-danger'}`}>{result.attackType}</span>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-dark border border-secondary text-center">
                        <small className="text-muted d-block">Duration</small>
                        <span className="text-white font-monospace">{result.features.duration.toFixed(1)}s</span>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-dark border border-secondary text-center">
                        <small className="text-muted d-block">Sample Rate</small>
                        <span className="text-white font-monospace">{(result.features.sampleRate / 1000).toFixed(1)} kHz</span>
                    </div>
                </div>
            </div>

            {/* Authenticity Meter */}
            <div className="p-3 rounded bg-dark border border-secondary mb-4">
                <div className="d-flex justify-content-between mb-2">
                    <span className="small text-danger fw-bold">FAKE</span>
                    <span className="small text-white fw-bold">Authenticity Score</span>
                    <span className="small text-success fw-bold">REAL</span>
                </div>
                <div className="position-relative" style={{ height: '10px', background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)', borderRadius: '5px' }}>
                    <div
                        className="position-absolute"
                        style={{
                            top: '-3px',
                            left: `${result.overallScore}%`,
                            transform: 'translateX(-50%)',
                            width: '16px', height: '16px',
                            background: 'white', borderRadius: '50%',
                            border: '3px solid #111',
                            boxShadow: '0 0 8px rgba(255,255,255,0.5)',
                        }}
                    />
                </div>
            </div>

            {/* Feature Breakdown */}
            <h6 className="text-uppercase small text-muted mb-3">Feature Analysis Breakdown</h6>
            {result.breakdown.map((feature, i) => (
                <div key={i} className="mb-3">
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
                    <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.72rem' }}>{feature.description}</p>
                </div>
            ))}
        </div>
    );
}

// ─── Call Analysis Detail ──────────────────────────────────

function CallDetail({ result }: { result: CallAnalysisResult }) {
    const formatDuration = (seconds: number): string => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const getSegmentColor = (score: number, isSuspicious: boolean) => {
        if (isSuspicious) return score < 35 ? '#ef4444' : '#f59e0b';
        return '#22c55e';
    };

    return (
        <div>
            {/* Summary Grid */}
            <div className="row g-3 mb-4">
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-dark border border-secondary text-center">
                        <small className="text-muted d-block">Duration</small>
                        <span className="text-white fw-bold font-monospace">{formatDuration(result.duration)}</span>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-dark border border-secondary text-center">
                        <small className="text-muted d-block">Segments</small>
                        <span className="text-white fw-bold font-monospace">{result.segments.length}</span>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-dark border border-secondary text-center">
                        <small className="text-muted d-block">Suspicious</small>
                        <span className={`fw-bold font-monospace ${result.suspiciousCount > 0 ? 'text-danger' : 'text-success'}`}>
                            {result.suspiciousCount}
                        </span>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="p-3 rounded bg-dark border border-secondary text-center">
                        <small className="text-muted d-block">Attack Type</small>
                        <span className="text-white small fw-bold">{result.attackType}</span>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <h6 className="text-uppercase small text-muted mb-2">Timeline</h6>
            <div className="bg-dark p-3 rounded border border-secondary mb-4">
                <div className="position-relative w-100" style={{ height: '40px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="d-flex h-100">
                        {result.segments.map((seg, i) => {
                            const widthPercent = ((seg.endTime - seg.startTime) / result.duration) * 100;
                            return (
                                <div
                                    key={i}
                                    className="h-100 position-relative"
                                    style={{
                                        width: `${widthPercent}%`,
                                        backgroundColor: getSegmentColor(seg.score, seg.isSuspicious),
                                        opacity: 0.6,
                                        borderRight: '1px solid #0f172a',
                                    }}
                                    title={`${formatDuration(seg.startTime)} - ${formatDuration(seg.endTime)}: ${seg.score}%`}
                                >
                                    {seg.isSuspicious && (
                                        <div className="position-absolute top-50 start-50 translate-middle">
                                            <FaExclamationTriangle size={9} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="d-flex justify-content-between mt-1 text-muted small">
                    <span>00:00</span>
                    <span>{formatDuration(result.duration)}</span>
                </div>
            </div>

            {/* Segment Table */}
            <h6 className="text-uppercase small text-muted mb-2">Segment Details</h6>
            <div className="table-responsive">
                <table className="table table-dark table-sm mb-0" style={{ fontSize: '0.8rem' }}>
                    <thead>
                        <tr className="text-muted">
                            <th className="border-secondary">#</th>
                            <th className="border-secondary">Time</th>
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
                                <td className="border-secondary text-muted">{seg.reason || 'No anomalies'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default History;
