import { FaGithub, FaTwitter, FaLinkedin, FaShieldAlt } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="py-5 mt-5" style={{ 
            borderTop: '1px solid rgba(0, 240, 255, 0.1)',
            background: 'linear-gradient(to top, #020617, #0f172a)'
        }}>
            <div className="container">
                <div className="row g-4 justify-content-between">
                    <div className="col-md-4 text-center text-md-start">
                        <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-3">
                            <FaShieldAlt className="text-muted" />
                            <span className="fw-bold text-white font-display">VOICE<span className="text-neon">IDENTITY</span></span>
                        </div>
                        <p className="text-muted small">
                            Advanced AI-powered detection system for synthetic voice verification and deepfake analysis. Protecting digital identities in real-time.
                        </p>
                    </div>
                    
                    <div className="col-md-4 text-center">
                        <h6 className="text-white mb-3 text-uppercase font-display small">Connect</h6>
                        <div className="d-flex justify-content-center gap-4">
                             <a href="#" className="text-secondary transition-colors" style={{ textDecoration: 'none' }}><FaGithub size={20} /></a>
                             <a href="#" className="text-secondary transition-colors" style={{ textDecoration: 'none' }}><FaTwitter size={20} /></a>
                             <a href="#" className="text-secondary transition-colors" style={{ textDecoration: 'none' }}><FaLinkedin size={20} /></a>
                        </div>
                    </div>
                    
                    <div className="col-md-4 text-center text-md-end">
                         <h6 className="text-white mb-3 text-uppercase font-display small">Legal</h6>
                         <ul className="list-unstyled small text-muted">
                            <li><a href="#" className="text-decoration-none text-muted">Privacy Policy</a></li>
                            <li><a href="#" className="text-decoration-none text-muted">Terms of Service</a></li>
                         </ul>
                    </div>
                </div>
                
                <div className="text-center mt-5 pt-4 border-top border-secondary opacity-50">
                     <p className="mb-0 small text-muted">&copy; {new Date().getFullYear()} Virtual Voice Identity Vault. AI Security.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
