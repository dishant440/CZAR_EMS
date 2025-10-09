import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AuthPage.css';

function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      setMessage('Google login successful!');
      window.history.replaceState({}, document.title, '/auth');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isSignUp ? 'http://localhost:5000/api/auth/register' : 'http://localhost:5000/api/auth/login';
      const data = isSignUp ? formData : { email: formData.email, password: formData.password };
      
      const response = await axios.post(endpoint, data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setMessage(`${isSignUp ? 'Registration' : 'Login'} successful!`);
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/forgot-password', { email: forgotEmail });
      setMessage(response.data.message);
      setShowForgotPassword(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send reset email');
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ name: '', email: '', password: '', role: 'admin' });
    setMessage('');
    setShowForgotPassword(false);
  };

  if (showForgotPassword) {
    return (
      <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-white pt-5">
        <div className="card shadow-lg" style={{maxWidth: '400px', width: '100%'}}>
          <div className="card-body p-4">
            <form onSubmit={handleForgotPassword}>
              <h2 className="text-center mb-3">Forgot Password</h2>
              <p className="text-center text-muted mb-4">Enter your email to receive a password reset link</p>
              
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control rounded-pill"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-100 rounded-pill mb-3">
                Send Reset Link
              </button>
              
              <button type="button" onClick={() => setShowForgotPassword(false)} className="btn btn-outline-secondary w-100 rounded-pill">
                Back to Login
              </button>
            </form>
            {message && <div className="alert alert-success mt-3 text-center">{message}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className={`auth-container ${isSignUp ? 'sign-up-mode' : ''}`}>
      <div className="forms-container">
        <div className="signin-signup">
          <form className={`sign-in-form ${!isSignUp ? 'active' : ''}`} onSubmit={handleSubmit}>
            <h2 className="title">Sign In</h2>
            
            <div className="input-field">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-field">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" className="btn solid">Sign In</button>
            
            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              <div className="google-icon">G</div>
              Continue with Google
            </button>
            
            <a href="#" className="forgot-password" onClick={() => setShowForgotPassword(true)}>
              Forgot Password?
            </a>
          </form>

          <form className={`sign-up-form ${isSignUp ? 'active' : ''}`} onSubmit={handleSubmit}>
            <h2 className="title">Create Account</h2>
            
            <div className="input-field">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-field">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-field">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-field">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                style={{padding: '0.75rem', border: '1px solid #ddd', borderRadius: '25px', width: '100%', fontSize: '1rem'}}
              >
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            
            <button type="submit" className="btn solid">Sign Up</button>
            
            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              <div className="google-icon">G</div>
              Continue with Google
            </button>
          </form>
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>Hello, Friend!</h3>
            <p>Fill up personal information and start journey with us</p>
            <button className="btn transparent" onClick={toggleMode}>
              SIGN UP
            </button>
          </div>
        </div>
        
        <div className="panel right-panel">
          <div className="content">
            <h3>Welcome Back!</h3>
            <p>Enter your personal details to use all of site features</p>
            <button className="btn transparent" onClick={toggleMode}>
              SIGN IN
            </button>
          </div>
        </div>
      </div>
      
        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
}

export default AuthPage;