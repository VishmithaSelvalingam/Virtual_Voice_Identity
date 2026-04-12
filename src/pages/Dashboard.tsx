import { FaShieldAlt, FaUserCheck, FaBug, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAnalysis } from '../context/AnalysisContext';

const Dashboard = () => {
    const { voiceResults, callResults, totalAnalyzed, authenticCount, threatCount, deepfakeRate } = useAnalysis();

    const allResults = [
        ...voiceResults.map(r => ({ type: 'voice' as const, isAuthentic: r.isAuthentic, score: r.overallScore, time: r.timestamp, name: r.fileName || 'Recording', attack: r.attackType })),
        ...callResults.map(r => ({ type: 'call' as const, isAuthentic: r.isAuthentic, score: r.overallScore, time: r.timestamp, name: r.fileName, attack: r.attackType })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const recentResults = allResults.slice(0, 10);

    // Chart data: last 7 days
    const now = Date.now();
    const dayMs = 86400000;
    const chartData = Array.from({ length: 7 }, (_, i) => {
        const dayStart = now - (6 - i) * dayMs;
        const dayEnd = dayStart + dayMs;
        const dayResults = allResults.filter(r => {
            const t = new Date(r.time).getTime();
            return t >= dayStart && t < dayEnd;
        });
        return {
            label: new Date(dayStart).toLocaleDateString('en', { weekday: 'short' }),
            total: dayResults.length,
            threats: dayResults.filter(r => !r.isAuthentic).length,
        };
    });
    const maxChart = Math.max(...chartData.map(d => d.total), 1);

    const stats = [
        { title: "Total Analyzed", value: totalAnalyzed.toLocaleString(), icon: FaChartLine, color: "text-info" },
        { title: "Authentic", value: authenticCount.toLocaleString(), icon: FaUserCheck, color: "text-success" },
        { title: "Threats Blocked", value: threatCount.toLocaleString(), icon: FaShieldAlt, color: "text-danger" },
        { title: "Deepfake Rate", value: `${deepfakeRate}%`, icon: FaBug, color: "text-warning" },
    ];

    const healthScore = totalAnalyzed === 0 ? 100 : Math.round((authenticCount / totalAnalyzed) * 100);

    const formatTimeAgo = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4 font-display">Security Dashboard</h2>

            {/* STAT CARDS */}
            <div className="row g-4 mb-5">
                {stats.map((stat, index) => (
                    <div className="col-md-3 col-6" key={index}>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="cyber-card p-4 d-flex align-items-center justify-content-between"
                        >
                            <div>
                                <h6 className="text-muted text-uppercase small mb-2">{stat.title}</h6>
                                <h3 className="mb-0 text-white font-monospace">{stat.value}</h3>
                            </div>
                            <stat.icon className={`${stat.color} opacity-75`} size={30} />
                        </motion.div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                {/* ACTIVITY CHART */}
                <div className="col-md-8">
                    <div className="cyber-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0">Threat Analysis History</h5>
                            <span className="badge bg-dark border border-secondary text-muted">Last 7 Days</span>
                        </div>

                        {totalAnalyzed === 0 ? (
                            <div className="d-flex align-items-center justify-content-center text-muted" style={{ minHeight: '200px' }}>
                                <div className="text-center">
                                    <FaChartLine size={40} className="mb-3 opacity-25" />
                                    <p>No analysis data yet. Upload audio files to see trends.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="d-flex align-items-end justify-content-between px-2 gap-2" style={{ minHeight: '200px' }}>
                                {chartData.map((d, i) => (
                                    <div key={i} className="w-100 d-flex flex-column align-items-center">
                                        <div className="w-100 position-relative" style={{ height: '180px' }}>
                                            {/* Total bar */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(d.total / maxChart) * 100}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className="w-100 rounded-top position-absolute bottom-0"
                                                style={{ background: 'linear-gradient(to top, rgba(6, 182, 212, 0.2), #06b6d4)', opacity: 0.8 }}
                                            />
                                            {/* Threat overlay */}
                                            {d.threats > 0 && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${(d.threats / maxChart) * 100}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                                                    className="w-100 rounded-top position-absolute bottom-0"
                                                    style={{ background: 'linear-gradient(to top, rgba(239, 68, 68, 0.3), #ef4444)', opacity: 0.7 }}
                                                />
                                            )}
                                        </div>
                                        <small className="text-muted mt-2 small">{d.label}</small>
                                        <small className="text-white fw-bold" style={{ fontSize: '0.7rem' }}>{d.total}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="d-flex gap-4 mt-3 justify-content-center">
                            <span className="d-flex align-items-center gap-2 small text-muted">
                                <span className="d-inline-block rounded" style={{ width: 10, height: 10, background: '#06b6d4' }}></span> Total
                            </span>
                            <span className="d-flex align-items-center gap-2 small text-muted">
                                <span className="d-inline-block rounded" style={{ width: 10, height: 10, background: '#ef4444' }}></span> Threats
                            </span>
                        </div>
                    </div>
                </div>

                {/* SECURITY METER */}
                <div className="col-md-4">
                    <div className="cyber-card p-4 h-100 text-center">
                        <h5 className="mb-4">Identity Health</h5>
                        <div className="position-relative d-inline-block mb-4">
                            <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="75" cy="75" r="60" stroke="#334155" strokeWidth="10" fill="transparent" />
                                <motion.circle
                                    cx="75" cy="75" r="60"
                                    stroke={healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#f59e0b' : '#ef4444'}
                                    strokeWidth="10"
                                    fill="transparent"
                                    strokeDasharray="377"
                                    strokeDashoffset="377"
                                    animate={{ strokeDashoffset: 377 - (377 * healthScore / 100) }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="position-absolute top-50 start-50 translate-middle">
                                <h2 className={`mb-0 ${healthScore >= 70 ? 'text-success' : healthScore >= 40 ? 'text-warning' : 'text-danger'}`}>{healthScore}%</h2>
                                <small className="text-muted">{healthScore >= 70 ? 'Secure' : healthScore >= 40 ? 'Caution' : 'At Risk'}</small>
                            </div>
                        </div>
                        <ul className="list-unstyled text-start small text-muted">
                            <li className="mb-2"><FaCheckCircle className="text-success me-2" /> Real-time Analysis Active</li>
                            <li className="mb-2"><FaCheckCircle className="text-success me-2" /> Spectral Engine Online</li>
                            <li className="mb-2">
                                {threatCount === 0
                                    ? <><FaCheckCircle className="text-success me-2" /> No Threats Detected</>
                                    : <><FaExclamationTriangle className="text-warning me-2" /> {threatCount} Threat(s) Found</>
                                }
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="cyber-card p-4 mt-4">
                <h5 className="mb-4">Recent Analysis Activity</h5>
                {recentResults.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <FaClock size={30} className="mb-3 opacity-25" />
                        <p>No analysis history yet. Go to <strong>Analyze</strong> or <strong>Detect</strong> to get started.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-sm mb-0" style={{ fontSize: '0.85rem' }}>
                            <thead>
                                <tr className="text-muted">
                                    <th className="border-secondary">File</th>
                                    <th className="border-secondary">Type</th>
                                    <th className="border-secondary">Score</th>
                                    <th className="border-secondary">Result</th>
                                    <th className="border-secondary">Classification</th>
                                    <th className="border-secondary">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentResults.map((r, i) => (
                                    <tr key={i}>
                                        <td className="border-secondary text-white text-truncate" style={{ maxWidth: '150px' }}>{r.name}</td>
                                        <td className="border-secondary"><span className={`badge ${r.type === 'voice' ? 'bg-info' : 'bg-purple'} bg-opacity-25`}>{r.type === 'voice' ? 'Voice' : 'Call'}</span></td>
                                        <td className="border-secondary font-monospace fw-bold">
                                            <span className={r.score >= 55 ? 'text-success' : r.score >= 40 ? 'text-warning' : 'text-danger'}>{r.score}%</span>
                                        </td>
                                        <td className="border-secondary">
                                            {r.isAuthentic
                                                ? <span className="text-success"><FaCheckCircle className="me-1" />Authentic</span>
                                                : <span className="text-danger"><FaExclamationTriangle className="me-1" />Fake</span>
                                            }
                                        </td>
                                        <td className="border-secondary text-muted">{r.attack}</td>
                                        <td className="border-secondary text-muted">{formatTimeAgo(r.time)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
