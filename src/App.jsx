import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './interface/Navbar';
import Home from './tabs/Home';
import Simulations from './tabs/Simulations';
import ActiveSimulation from './tabs/ActiveSimulation';
import Contacts from './tabs/Contacts';
import Auth from './tabs/Auth';
import { AuthProvider } from './auth/AuthContext';
import ScientificBackground from './interface/ScientificBackground';
import { ThemeProvider } from './interface/ThemeContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          {/* Animated Scientific Background */}
          <ScientificBackground />

          {/* Side-rail layout */}
          <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            <Navbar />
            <div className="forge-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/simulations" element={<Simulations />} />
                <Route path="/simulation/:id" element={<ActiveSimulation />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/auth" element={<Auth />} />
              </Routes>
            </div>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
