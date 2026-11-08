
import { useState } from 'react';
import './Login.css';
import logo from '../assets/bahya-logo.png';

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
      const response = await fetch(
        'http://localhost/takiyat-bahya/backend/api/login.php',
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر تسجيل الدخول.');
      }

      // الانتقال إلى لوحة الإدارة بعد نجاح تسجيل الدخول
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

        <h2>مرحباً بعودتكِ</h2>

        <p className="login-description">
          سجّلي الدخول للوصول إلى لوحة الإدارة
        </p>

        <form onSubmit={handleLogin}>
          <label>اسم المستخدم</label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="أدخلي اسم المستخدم"
            autoComplete="username"
            required
          />

          <label>كلمة المرور</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخلي كلمة المرور"
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

        <p className="login-footer">
          تكية بهية — الخير يجمعنا
        </p>

      </div>
    </main>
  );
}
