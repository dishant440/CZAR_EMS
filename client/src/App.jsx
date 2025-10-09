import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import config from './config';
import Navbar from './components/Navbar.jsx';
import LandingPage from './components/LandingPage.jsx';
import AuthPage from './components/AuthPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdminPanel from './components/AdminPanel.jsx';

// Set axios base URL
axios.defaults.baseURL = config.API_URL;
function App() {
  return (
    <Router>
      <div className="App" style={{backgroundColor: '#f3f4f6', minHeight: '100vh'}}>
        <Routes>
          {/* <Route path="/" element={<><Navbar /><LandingPage /></>} /> */}
          <Route path="/auth" element={<><Navbar /><AuthPage /></>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;