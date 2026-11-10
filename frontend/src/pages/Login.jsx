import { useState } from 'react';
import './Login.css';
import logo from '../assets/bahya-logo.png';
import { API_BASE_URL } from '../config/api.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر تسجيل الدخول.');
      }

      if (result.csrf_token) {
        sessionStorage.setItem('csrf_token', result.csrf_token);
      }

      window.location.href = '/?page=admin';
    } catch (error) {
      setMessage(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="login-page" dir="rtl">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="شعار تكية بهية" />
        </div>

        <p className="login-subtitle">لوحة إدارة المنصة</p>
        <div className="login-divider"></div>

        <h2>مرحباً بك</h2>
        <p className="login-description">
          سجّل الدخول للوصول إلى لوحة الإدارة
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="login-username">اسم المستخدم</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم"
            autoComplete="username"
            required
          />

          <label htmlFor="login-password">كلمة المرور</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
            autoComplete="current-password"
            required
          />

          {message && (
            <p className="login-message" role="alert">
              {message}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="login-actions" style={{ marginTop: '16px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#77716B', textDecoration: 'none', fontSize: '13px' }}>
            ← العودة إلى الصفحة الرئيسية
          </a>
        </div>

        <p className="login-footer">تكية بهية — الخير يجمعنا</p>
      </div>
    </main>
  );
}
