
import { useEffect, useState } from 'react';
import './Account.css';
import logo from '../../assets/bahya-logo.png';

const API = 'http://localhost/takiyat-bahya/backend/api';

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function loadAccount() {
      try {
        const response = await fetch(`${API}/check-auth.php`, {
          credentials: 'include',
        });

        const result = await response.json();

        if (!response.ok || !result.authenticated) {
          window.location.href = '/?page=login';
          return;
        }

        setUser(result.user);
      } catch {
        setError('تعذر تحميل بيانات الحساب.');
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

  async function handleLogout() {
    if (!window.confirm('هل تريدين تسجيل الخروج؟')) return;

    setLoggingOut(true);
    setError('');

    try {
      const response = await fetch(`${API}/logout.php`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر تسجيل الخروج.');
      }

      window.location.href = '/?page=login';
    } catch (err) {
      setError(err.message);
      setLoggingOut(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور الجديدتان غير متطابقتين.');
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(`${API}/change-password.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر تغيير كلمة المرور.');
      }

      setSuccess(result.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور.');
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <main className="account-page" dir="rtl">
        جارٍ تحميل بيانات الحساب...
      </main>
    );
  }

  return (
    <main className="account-page" dir="rtl">
      <section className="account-card">

        <img
          src={logo}
          alt="شعار تكية بهية"
          className="account-logo"
        />

        <h1>إدارة الحساب</h1>
        <p className="account-subtitle">تكية بهية — لوحة الإدارة</p>

        <div className="account-divider"></div>

        {error && (
          <p className="account-error" role="alert">{error}</p>
        )}

        {success && (
          <p className="account-success" role="status">{success}</p>
        )}

        <div className="account-info">
          <div className="account-info-item">
            <span>الاسم الكامل</span>
            <strong>{user?.full_name || 'غير متوفر'}</strong>
          </div>

          <div className="account-info-item">
            <span>اسم المستخدم</span>
            <strong>{user?.username || 'غير متوفر'}</strong>
          </div>

          <div className="account-info-item">
            <span>نوع الحساب</span>
            <strong>مسؤول المنصة</strong>
          </div>
        </div>

        <div className="account-divider"></div>

        <h2 className="account-password-title">تغيير كلمة المرور</h2>

        <form className="account-password-form" onSubmit={handleChangePassword}>

          <label htmlFor="currentPassword">كلمة المرور الحالية</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <label htmlFor="newPassword">كلمة المرور الجديدة</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button
            className="account-change-password"
            type="submit"
            disabled={changingPassword}
          >
            {changingPassword ? 'جارٍ تغيير كلمة المرور...' : 'حفظ كلمة المرور الجديدة'}
          </button>
        </form>

        <button
          className="account-logout"
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج'}
        </button>

        <a className="account-back" href="/?page=admin">
          العودة إلى لوحة الإدارة
        </a>

        <p className="account-footer">تكية بهية — الخير يجمعنا</p>
      </section>
    </main>
  );
}
