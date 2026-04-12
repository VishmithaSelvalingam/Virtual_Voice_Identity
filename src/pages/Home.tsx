import { Link } from 'react-router-dom';
import { FaShieldAlt, FaUserSecret, FaWaveSquare, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="home-container">
            {/* HERO SECTION */}
            <section className="position-relative d-flex align-items-center justify-content-center text-center py-5" 
                     style={{ minHeight: '90vh', background: 'radial-gradient(circle at top center, #1b0f0a 0%, #050505 60%)' }}>
                
                <div className="container position-relative z-1">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="display-2 fw-bold mb-4 text-white font-display">
                            AI-Powered Cybersecurity,<br />
                            <span className="text-gradient">Invisible Protection</span>
                        </h1>

                        <p className="lead text-secondary mx-auto mb-5" style={{ maxWidth: '650px', fontSize: '1.2rem', lineHeight: '1.8' }}>
                            VoiceShield is an advanced, AI-driven cybersecurity solution that provides real-time, autonomous protection for your identity. Designed to defend against cloning and deepfakes.
                        </p>

                        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                            <Link to="/analyze" className="btn btn-primary btn-lg rounded-pill px-5 d-flex align-items-center justify-content-center gap-2">
                                Get Started Now
                            </Link>
                            <Link to="/dashboard" className="btn btn-outline-light btn-lg rounded-pill px-4 d-flex align-items-center justify-content-center gap-2">
                                <FaShieldAlt className="text-secondary" /> View Dashboard
                            </Link>
                        </div>
                    </motion.div>

                    {/* HERO ILLUSTRATION MOCKUP */}
                     <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-5 pt-4"
                    >
                        <div className="mx-auto position-relative" style={{ maxWidth: '900px' }}>
                            {/* Abstract 'Isometric' Dashboard Mockup */}
                            <div className="rounded-3 border border-secondary bg-card position-relative overflow-hidden" style={{ height: '400px', transform: 'perspective(1000px) rotateX(10deg)', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)' }}>
                                <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-to-b from-transparent to-black opacity-50"></div>
                                <div className="p-4 d-flex justify-content-between align-items-center border-bottom border-dark">
                                    <div className="d-flex gap-2">
                                        <div className="rounded-circle bg-danger" style={{width: 10, height: 10}}></div>
                                        <div className="rounded-circle bg-warning" style={{width: 10, height: 10}}></div>
                                        <div className="rounded-circle bg-success" style={{width: 10, height: 10}}></div>
                                    </div>
                                    <div className="text-muted small font-monospace">VoiceShield_System_v2.0</div>
                                </div>
                                <div className="p-5 text-center mt-5">
                                    <h3 className="text-white mb-3">System Secure</h3>
                                    <div className="mx-auto rounded-circle border border-dark p-1 d-inline-block position-relative">
                                        <div className="rounded-circle bg-brand-soft p-4">
                                             <FaShieldAlt size={60} className="text-brand" />
                                        </div>
                                    </div>
                                    <div className="mt-4 row justify-content-center gap-3">
                                        <div className="col-3 p-3 bg-dark rounded border border-dark">
                                            <div className="small text-muted">Threats</div>
                                            <div className="h4 text-white">0</div>
                                        </div>
                                        <div className="col-3 p-3 bg-dark rounded border border-dark">
                                            <div className="small text-muted">Uptime</div>
                                            <div className="h4 text-brand">100%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* WHY CHOOSE SECTION */}
            <section className="py-5 position-relative bg-darker">
                <div className="container py-5">
                    <div className="text-center mb-5">
                         <h2 className="text-white font-display mb-3">Why Choose VoiceShield?</h2>
                         <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>VoiceShield is an advanced, AI-driven cybersecurity solution designed to offer unparalleled protection against modern voice threats.</p>
                    </div>

                    <div className="row g-4">
                        {[
                            { 
                                icon: FaUserSecret, 
                                title: "AI-Powered Threat Detection", 
                                desc: "Leverages advanced ML algorithms to identify and neutralize deepfake threats in real-time." 
                            },
                            { 
                                icon: FaShieldAlt, 
                                title: "Seamless, Invisible Protection", 
                                desc: "Protection that runs quietly in the background, securing your identity without disrupting workflows." 
                            },
                            { 
                                icon: FaWaveSquare, 
                                title: "Scalable & Adaptive", 
                                desc: "Enterprise-grade architecture that evolves with your needs, providing flexible protection." 
                            }
                        ].map((item, i) => (
                            <div className="col-md-4" key={i}>
                                <div className="cyber-card h-100 text-center p-5">
                                    <div className="d-inline-flex align-items-center justify-content-center mb-4 bg-dark rounded-circle p-3 shadow-lg border border-dark">
                                        <item.icon size={32} className="text-brand" />
                                    </div>
                                    <h4 className="text-white mb-3">{item.title}</h4>
                                    <p className="text-muted small mb-4">{item.desc}</p>
                                    <Link to="/analyze" className="btn btn-outline-light btn-sm rounded-pill px-4 text-secondary border-secondary">
                                        Learn More <FaArrowRight size={10} className="ms-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
