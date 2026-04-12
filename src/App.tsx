import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AnalyzeVoice from './pages/AnalyzeVoice';
import CallDetection from './pages/CallDetection';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { AnalysisProvider } from './context/AnalysisContext';

function App() {
  return (
    <ErrorBoundary>
      <AnalysisProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analyze" element={<AnalyzeVoice />} />
                <Route path="/call-detection" element={<CallDetection />} />
                <Route path="/history" element={<History />} />
                    <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AnalysisProvider>
    </ErrorBoundary>
  );
}

export default App;
