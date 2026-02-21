import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    license_number: '',
    license_expiry: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const result = await login(formData.phone, formData.password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
        const registerResult = await register(formData);
        if (registerResult.success) {
          setSuccess('Registration successful! Logging you in...');
          const loginResult = await login(formData.phone, formData.password);
          if (loginResult.success) {
            navigate('/dashboard');
          } else {
            setError('Registration successful but auto-login failed. Please login manually.');
            setTimeout(() => setIsLogin(true), 2000);
          }
        } else {
          setError(registerResult.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel - Form */}
      <div className="login-left">
        <div className="login-content">
          <div className="logo">
            <div className="logo-icon"></div>
            <span className="logo-text">FleeFo</span>
          </div>

          <h1 className="login-title">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="login-subtitle">
            {isLogin ? 'Login to your fleet dashboard' : 'Register your fleet with FleeFo'}
          </p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            {isLogin ? (
              <>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            ) : (
              <div className="register-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    name="license_number"
                    placeholder="DL-XXXXX"
                    value={formData.license_number}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>License Expiry</label>
                  <input
                    type="date"
                    name="license_expiry"
                    value={formData.license_expiry}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Repeat Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : isLogin ? 'Login Now' : 'Register Now'}
            </button>
          </form>

          <p className="toggle-form">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up' : 'Login'}
            </span>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="login-right">
        <div className="visual-content">
          <div className="stat-card card-1">
            <div className="stat-value">$35,647.00</div>
            <div className="stat-change">+6%</div>
          </div>
          <div className="stat-card card-2">
            <div className="stat-value">120,435</div>
            <div className="stat-label">Total Miles</div>
          </div>
          <div className="stat-card card-3">
            <div className="stat-value">$12,924.00</div>
            <div className="stat-label">Maintenance Cost</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
