
import { useEffect, useState } from 'react';
import './AdminDashboard.css';
import logo from '../../assets/bahya-logo.png';

const API = 'http://localhost/takiyat-bahya/backend/api';

const emptyForm = {
  kitchen_id: '',
  name: '',
  area_id: '',
  address: '',
  phone: '',
  description: '',
  status: 'unknown',
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [kitchens, setKitchens] = useState([]);
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const [editingKitchen, setEditingKitchen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [savingEdit, setSavingEdit] = useState(false);

  // تبويب التكيات الحالية أو الأرشيف
  const [activeTab, setActiveTab] = useState('current');

  async function loadKitchens() {
    const response = await fetch(`${API}/admin-kitchens.php`, {
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'تعذر تحميل التكيات.');
    }

    setKitchens(result.data);
  }

  async function loadAreas() {
    const response = await fetch(`${API}/areas.php`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'تعذر تحميل المناطق.');
    }

    setAreas(result.data);
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch(`${API}/check-auth.php`, {
          credentials: 'include',
        });

        const result = await response.json();

        if (!response.ok || !result.authenticated) {
          setError('يرجى تسجيل الدخول للوصول إلى لوحة الإدارة.');
          return;
        }

        setAuthenticated(true);
        setUser(result.user);

        await Promise.all([loadKitchens(), loadAreas()]);
      } catch {
        setError('تعذر الاتصال بالخادم أو تحميل البيانات.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function openEditForm(kitchen) {
    setError('');
    setMessage('');

    setForm({
      kitchen_id: kitchen.id,
      name: kitchen.name || '',
      area_id: String(kitchen.area_id || ''),
      address: kitchen.address || '',
      phone: kitchen.phone || '',
      description: kitchen.description || '',
      status: kitchen.status || 'unknown',
    });

    setEditingKitchen(true);
  }

  function closeEditForm() {
    setEditingKitchen(false);
    setForm(emptyForm);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function saveKitchen(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.area_id) {
      setError('يرجى إدخال اسم التكية واختيار المنطقة.');
      return;
    }

    setSavingEdit(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API}/update-kitchen.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر حفظ التعديلات.');
      }

      setMessage(result.message);
      closeEditForm();
      await loadKitchens();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حفظ التعديلات.');
    } finally {
      setSavingEdit(false);
    }
  }

  // اعتماد التكية أو رفضها
  async function updateVerification(kitchenId, status) {
    const action = status === 'verified' ? 'اعتماد' : 'رفض';

    const confirmed = window.confirm(
      `هل أنتِ متأكدة من ${action} هذه التكية؟`
    );

    if (!confirmed) return;

    setUpdatingId(kitchenId);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        `${API}/update-kitchen-verification.php`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kitchen_id: kitchenId,
            verification_status: status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر تحديث حالة التكية.');
      }

      setMessage(result.message);
      await loadKitchens();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تنفيذ العملية.');
    } finally {
      setUpdatingId(null);
    }
  }

  // تفعيل التكية أو إيقافها مؤقتًا
  async function toggleKitchenActive(kitchen) {
    const newStatus = Number(kitchen.is_active) === 1 ? 0 : 1;

    const action = newStatus === 1 ? 'إعادة تفعيل' : 'إيقاف';

    const confirmed = window.confirm(
      `هل أنتِ متأكدة من ${action} التكية؟`
    );

    if (!confirmed) return;

    setUpdatingId(kitchen.id);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        `${API}/toggle-kitchen-status.php`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kitchen_id: kitchen.id,
            is_active: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر تحديث حالة التكية.');
      }

      setMessage(result.message);
      await loadKitchens();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحديث حالة التكية.');
    } finally {
      setUpdatingId(null);
    }
  }

  // نقل التكية إلى الأرشيف
  async function archiveKitchen(kitchen) {
    const confirmed = window.confirm(
      `هل تريدين أرشفة "${kitchen.name}"؟ ستختفي من الدليل العام ويمكن استعادتها لاحقًا.`
    );

    if (!confirmed) return;

    setUpdatingId(kitchen.id);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API}/archive-kitchen.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kitchen_id: kitchen.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذرت أرشفة التكية.');
      }

      setMessage(result.message);
      await loadKitchens();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء أرشفة التكية.');
    } finally {
      setUpdatingId(null);
    }
  }

  // استعادة التكية من الأرشيف
  async function restoreKitchen(kitchen) {
    const confirmed = window.confirm(
      `هل تريدين استعادة "${kitchen.name}" إلى التكيات الحالية؟`
    );

    if (!confirmed) return;

    setUpdatingId(kitchen.id);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API}/restore-kitchen.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kitchen_id: kitchen.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذرت استعادة التكية.');
      }

      setMessage(result.message);
      await loadKitchens();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء استعادة التكية.');
    } finally {
      setUpdatingId(null);
    }
  }

  // تسجيل الخروج
  async function handleLogout() {
    const confirmed = window.confirm('هل تريدين تسجيل الخروج؟');

    if (!confirmed) return;

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
      setError(err.message || 'حدث خطأ أثناء تسجيل الخروج.');
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-loading" dir="rtl">
        جارٍ تحميل لوحة الإدارة...
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="admin-dashboard" dir="rtl">
        <div className="admin-empty">
          <h2>{error || 'يرجى تسجيل الدخول أولًا.'}</h2>
          <a href="/?page=login">العودة إلى تسجيل الدخول</a>
        </div>
      </main>
    );
  }

  const currentKitchens = kitchens.filter(
    (k) => Number(k.is_archived) !== 1
  );

  const archivedKitchens = kitchens.filter(
    (k) => Number(k.is_archived) === 1
  );

  const displayedKitchens =
    activeTab === 'current' ? currentKitchens : archivedKitchens;

  const pendingCount = currentKitchens.filter(
    (k) => k.verification_status === 'pending'
  ).length;

  const verifiedCount = currentKitchens.filter(
    (k) => k.verification_status === 'verified'
  ).length;

  const rejectedCount = currentKitchens.filter(
    (k) => k.verification_status === 'rejected'
  ).length;

  function verificationLabel(status) {
    if (status === 'pending') return 'بانتظار المراجعة';
    if (status === 'verified') return 'موثّقة';
    if (status === 'rejected') return 'مرفوضة';
    return status;
  }

  function operationLabel(status) {
    if (status === 'open') return 'مفتوحة';
    if (status === 'closed') return 'مغلقة';
    if (status === 'paused') return 'متوقفة مؤقتًا';
    if (status === 'unknown') return 'غير معروفة';
    return status || 'غير محددة';
  }

  function statusClass(status) {
    if (status === 'verified') return 'verified';
    if (status === 'rejected') return 'rejected';
    return 'pending';
  }

  return (
    <main className="admin-dashboard" dir="rtl">

      <header className="admin-header">
        <div className="admin-brand">
          <img
            className="admin-logo"
            src={logo}
            alt="شعار تكية بهية"
          />

          <div>
            <h1>تكية بهية</h1>
            <p>لوحة إدارة المنصة</p>
          </div>
        </div>

        <div className="admin-header-actions">
          <a className="admin-account" href="/?page=account">
            إدارة الحساب
          </a>

          <button
            className="admin-logout"
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج'}
          </button>
        </div>
      </header>

      <section className="admin-intro">
        <h2>مرحبًا {user?.full_name || 'بكِ'} 👋</h2>
        <p>
          إدارة التكيات ومراجعة طلبات التسجيل ومتابعة بيانات المنصة.
        </p>
      </section>

      {message && (
        <div className="admin-message" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      <section>
        <h2 className="admin-section-title">ملخص التكيات الحالية</h2>

        <div className="admin-stats">
          <article className="admin-stat total">
            <span>التكيات الحالية</span>
            <strong>{currentKitchens.length}</strong>
          </article>

          <article className="admin-stat pending">
            <span>بانتظار المراجعة</span>
            <strong>{pendingCount}</strong>
          </article>

          <article className="admin-stat verified">
            <span>التكيات الموثّقة</span>
            <strong>{verifiedCount}</strong>
          </article>

          <article className="admin-stat rejected">
            <span>التكيات المرفوضة</span>
            <strong>{rejectedCount}</strong>
          </article>
        </div>
      </section>

      <section>
        <h2 className="admin-section-title">إدارة التكيات</h2>

        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('current');
              setError('');
              setMessage('');
            }}
          >
            التكيات الحالية ({currentKitchens.length})
          </button>

          <button
            type="button"
            className={`admin-tab ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('archive');
              setError('');
              setMessage('');
            }}
          >
            الأرشيف ({archivedKitchens.length})
          </button>
        </div>

        <h3 className="admin-list-title">
          {activeTab === 'current' ? 'التكيات المسجلة' : 'التكيات المؤرشفة'}
        </h3>

        {displayedKitchens.length === 0 ? (
          <div className="admin-empty">
            {activeTab === 'current'
              ? 'لا توجد تكيات مسجلة حاليًا.'
              : 'الأرشيف فارغ حاليًا.'}
          </div>
        ) : (
          <div className="admin-kitchens">
            {displayedKitchens.map((kitchen) => (
              <article className="admin-kitchen-card" key={kitchen.id}>
                <h3>{kitchen.name}</h3>

                <p>
                  <strong>المنطقة:</strong> {kitchen.area_name || 'غير محددة'}
                </p>

                <p>
                  <strong>العنوان:</strong> {kitchen.address || 'غير محدد'}
                </p>

                <p>
                  <strong>رقم الهاتف:</strong> {kitchen.phone || 'غير متوفر'}
                </p>

                <p>
                  <strong>الوصف:</strong> {kitchen.description || 'لا يوجد وصف'}
                </p>

                <p>
                  <strong>حالة التشغيل:</strong> {operationLabel(kitchen.status)}
                </p>

                <p>
                  <strong>حالة التوثيق:</strong>
                  {' '}
                  <span className={`admin-status ${statusClass(kitchen.verification_status)}`}>
                    {verificationLabel(kitchen.verification_status)}
                  </span>
                </p>

                {activeTab === 'current' ? (
                  <>
                    <p>
                      <strong>حالة التفعيل:</strong>
                      {' '}
                      {Number(kitchen.is_active) === 1
                        ? 'مفعّلة'
                        : 'موقوفة مؤقتًا'}
                    </p>

                    <div className="admin-actions">
                      <button
                        className="admin-edit"
                        type="button"
                        onClick={() => openEditForm(kitchen)}
                      >
                        تعديل البيانات
                      </button>

                      <button
                        className="admin-toggle"
                        type="button"
                        disabled={updatingId !== null}
                        onClick={() => toggleKitchenActive(kitchen)}
                      >
                        {updatingId === kitchen.id
                          ? 'جارٍ التنفيذ...'
                          : Number(kitchen.is_active) === 1
                            ? 'إيقاف التكية مؤقتًا'
                            : 'إعادة تفعيل التكية'}
                      </button>

                      {kitchen.verification_status === 'pending' && (
                        <>
                          <button
                            className="admin-approve"
                            type="button"
                            disabled={updatingId !== null}
                            onClick={() => updateVerification(kitchen.id, 'verified')}
                          >
                            {updatingId === kitchen.id
                              ? 'جارٍ التنفيذ...'
                              : 'اعتماد التكية'}
                          </button>

                          <button
                            className="admin-reject"
                            type="button"
                            disabled={updatingId !== null}
                            onClick={() => updateVerification(kitchen.id, 'rejected')}
                          >
                            {updatingId === kitchen.id
                              ? 'جارٍ التنفيذ...'
                              : 'رفض التكية'}
                          </button>
                        </>
                      )}

                      <button
                        className="admin-archive"
                        type="button"
                        disabled={updatingId !== null}
                        onClick={() => archiveKitchen(kitchen)}
                      >
                        {updatingId === kitchen.id
                          ? 'جارٍ التنفيذ...'
                          : 'نقل إلى الأرشيف'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="admin-actions">
                    <button
                      className="admin-restore"
                      type="button"
                      disabled={updatingId !== null}
                      onClick={() => restoreKitchen(kitchen)}
                    >
                      {updatingId === kitchen.id
                        ? 'جارٍ التنفيذ...'
                        : 'استعادة التكية'}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {editingKitchen && (
        <div className="admin-edit-overlay">
          <form className="admin-edit-form" onSubmit={saveKitchen}>
            <h2>تعديل بيانات التكية</h2>

            <label htmlFor="edit-name">اسم التكية</label>
            <input
              id="edit-name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
            />

            <label htmlFor="edit-area">المنطقة</label>
            <select
              id="edit-area"
              name="area_id"
              value={form.area_id}
              onChange={handleFormChange}
              required
            >
              <option value="">اختاري المنطقة</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>

            <label htmlFor="edit-address">العنوان</label>
            <input
              id="edit-address"
              name="address"
              value={form.address}
              onChange={handleFormChange}
            />

            <label htmlFor="edit-phone">رقم الهاتف</label>
            <input
              id="edit-phone"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
            />

            <label htmlFor="edit-description">وصف التكية</label>
            <textarea
              id="edit-description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows="4"
            />

            <label htmlFor="edit-status">حالة التشغيل</label>
            <select
              id="edit-status"
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              <option value="open">مفتوحة</option>
              <option value="closed">مغلقة</option>
              <option value="paused">متوقفة مؤقتًا</option>
              <option value="unknown">غير معروفة</option>
            </select>

            <div className="admin-edit-buttons">
              <button type="submit" disabled={savingEdit}>
                {savingEdit ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
              </button>

              <button
                type="button"
                onClick={closeEditForm}
                disabled={savingEdit}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

    </main>
  );
}
