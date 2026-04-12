import { Link, useLocation } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';

const Navbar = () => {
    const location = useLocation();
    
    // Helper to check active state
    const isActive = (path: string) => {
        return location.pathname === path 
            ? 'text-white border-bottom border-info' 
            : 'text-secondary hover-text-white';
    };

    return (
        <nav className="navbar navbar-expand-lg sticky-top" style={{ zIndex: 1000 }}>
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
                    <div className="d-flex align-items-center justify-content-center bg-brand-soft rounded-circle" style={{width: '40px', height: '40px'}}>
                        <FaShieldAlt className="text-brand" size={20}/>
                    </div>
                    <span className="fw-bold font-display text-white" style={{ fontSize: '1.35rem', letterSpacing: '-0.03em' }}>
                        Voice<span className="text-brand">Shield</span>
                    </span>
                </Link>
                
                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
                </button>
                
                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav gap-lg-4 align-items-center mt-3 mt-lg-0">
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/')}`} to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/analyze')}`} to="/analyze">Analyze</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/call-detection')}`} to="/call-detection">Detect</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/history')}`} to="/history">History</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">Dashboard</Link>
                        </li>
                        <li className="nav-item ms-lg-2">
                             <Link to="/analyze" className="btn btn-sm btn-primary">
                                Get Started
                             </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
