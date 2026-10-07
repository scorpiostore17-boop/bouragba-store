import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('يرجى إدخال كلمة السر');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.adminLogin(password.trim());
      localStorage.setItem('bouragba_admin_auth', 'true');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'كلمة السر غير صحيحة، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper page-enter">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-login-icon">
            <i className="fa-solid fa-lock"></i>
          </div>
          <h1 className="admin-login-title">تسجيل الدخول للإدارة</h1>
          <p className="admin-login-subtitle">
            يرجى إدخال كلمة السر الخاصة بلوحة تحكم متجر بوراقبة
          </p>
        </div>

        {error && (
          <div className="admin-login-error" role="alert">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password-input">
              كلمة السر (Password)
            </label>
            <div className="password-input-wrap">
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة السر هنا..."
                className="form-input"
                autoFocus
                dir="ltr"
                required
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'إخفاء' : 'إظهار'}
                aria-label="إظهار أو إخفاء كلمة السر"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            <small className="admin-login-hint">
              كلمة السر الافتراضية الأولية: <code>ADMIN123</code>
            </small>
          </div>

          <button
            type="submit"
            className="btn-primary admin-login-submit"
            disabled={loading}
            id="btn-admin-login-submit"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                جاري التحقق...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i>
                دخول لوحة التحكم
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="back-to-store-link">
            <i className="fa-solid fa-arrow-right"></i>
            العودة إلى المتجر
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
