import { useEffect, useState, useMemo } from 'react';
import './AdminDashboard.css';
import logo from '../../assets/bahya-logo.png';
import { API_BASE_URL as API } from '../../config/api.js';

const emptyKitchenForm = {
  kitchen_id: '',
  name: '',
  area_id: '',
  address: '',
  phone: '',
  latitude: '',
  longitude: '',
  description: '',
  status: 'unknown',
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [kitchens, setKitchens] = useState([]);
  const [areas, setAreas] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // إدارة النماذج
  const [editingKitchen, setEditingKitchen] = useState(false);
  const [addingKitchen, setAddingKitchen] = useState(false);
  const [form, setForm] = useState(emptyKitchenForm);
  const [savingForm, setSavingForm] = useState(false);

  // التبويبات: 'current' (التكيات) | 'support' (طلبات الدعم) | 'archived' (الأرشيف)
  const [activeTab, setActiveTab] = useState('current');

  // فلترة والبحث في لوحة الإدارة
  const [adminSearch, setAdminSearch] = useState('');

  // استدعاء الهيدرز الآمنة متضمنة CSRF
  function getSecureHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return headers;
  }

  async function loadKitchens() {
    const response = await fetch(`${API}/admin-kitchens.php`, {
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'تعذر تحميل التكيات.');
    }
    setKitchens(result.data || []);
  }

  async function loadAreas() {
    const response = await fetch(`${API}/areas.php`);
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'تعذر تحميل المناطق.');
    }
    setAreas(result.data || []);
  }

  async function loadSupportRequests() {
    try {
      const response = await fetch(`${API}/admin-support-requests.php`, {
        credentials: 'include',
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setSupportRequests(result.data || []);
      }
    } catch {
      // عدم إيقاف اللوحة في حال كان جدول الدعم فارغاً
    }
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
        if (result.csrf_token) {
          setCsrfToken(result.csrf_token);
        }

        await Promise.all([loadKitchens(), loadAreas(), loadSupportRequests()]);
      } catch {
        setError('تعذر الاتصال بالخادم أو تحميل البيانات. يرجى التأكد من تشغيل خادم MySQL.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // فتح نموذج تعديل تكية
  function openEditForm(kitchen) {
    setError('');
    setMessage('');
    setForm({
      kitchen_id: kitchen.id,
      name: kitchen.name || '',
      area_id: String(kitchen.area_id || ''),
      address: kitchen.address || '',
      phone: kitchen.phone || '',
      latitude: kitchen.latitude !== null ? String(kitchen.latitude) : '',
      longitude: kitchen.longitude !== null ? String(kitchen.longitude) : '',
      description: kitchen.description || '',
      status: kitchen.status || 'unknown',
    });
    setEditingKitchen(true);
  }

  // فتح نموذج إضافة تكية جديدة
  function openAddForm() {
    setError('');
    setMessage('');
    setForm(emptyKitchenForm);
    setAddingKitchen(true);
  }

  function closeModals() {
    setEditingKitchen(false);
    setAddingKitchen(false);
    setForm(emptyKitchenForm);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // حفظ تكية جديدة
  async function handleCreateKitchen(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.area_id) {
      setError('يرجى إدخال اسم التكية واختيار المنطقة.');
      return;
    }

    setSavingForm(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API}/add-kitchen.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getSecureHeaders(),
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر إضافة التكية.');
      }

      setMessage(result.message || 'تمت إضافة التكية بنجاح.');
      closeModals();
      await loadKitchens();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حفظ التكية.');
    } finally {
      setSavingForm(false);
    }
  }

  // حفظ تعديلات تكية قائمة
  async function handleUpdateKitchen(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.area_id) {
      setError('يرجى إدخال اسم التكية واختيار المنطقة.');
      return;
    }

    setSavingForm(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API}/update-kitchen.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getSecureHeaders(),
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر حفظ التعديلات.');
      }

      setMessage(result.message || 'تم حفظ التعديلات بنجاح.');
      closeModals();
      await loadKitchens();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حفظ التعديلات.');
    } finally {
      setSavingForm(false);
    }
  }

  // اعتماد التكية أو رفضها
  async function updateVerification(kitchenId, status) {
    const action = status === 'verified' ? 'اعتماد' : 'رفض';
    const confirmed = window.confirm(`هل أنتِ متأكدة من ${action} هذه التكية؟`);
    if (!confirmed) return;

    setUpdatingId(kitchenId);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API}/update-kitchen-verification.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getSecureHeaders(),
        body: JSON.stringify({
          kitchen_id: kitchenId,
          verification_status: status,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر تحديث حالة التوثيق.');
      }

      setMessage(result.message);
      await loadKitchens();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحديث حالة التوثيق.');
    } finally {
      setUpdatingId(null);
    }
  }

  // تبديل حالة تشغيل التكية (تفعيل / إيقاف مؤقت)
  async function toggleKitchenActive(kitchen) {
    const nextStatus = Number(kitchen.is_active) === 1 ? 0 : 1;
    const action = nextStatus === 1 ? 'تفعيل' : 'إيقاف';
    const confirmed = window.confirm(`هل تريدين ${action} هذه التكية؟`);
    if (!confirmed) return;

    setUpdatingId(kitchen.id);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API}/toggle-kitchen-status.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getSecureHeaders(),
        body: JSON.stringify({
          kitchen_id: kitchen.id,
          is_active: nextStatus,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر تغيير حالة التكية.');
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
    const confirmed = window.confirm(`هل أنتِ متأكدة من نقل "${kitchen.name}" إلى الأرشيف؟`);
    if (!confirmed) return;

    setUpdatingId(kitchen.id);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API}/archive-kitchen.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getSecureHeaders(),
        body: JSON.stringify({ kitchen_id: kitchen.id }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر نقل التكية إلى الأرشيف.');
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
    const confirmed = window.confirm(`هل تريدين استعادة "${kitchen.name}" من الأرشيف؟`);
    if (!confirmed) return;

    setUpdatingId(kitchen.id);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API}/restore-kitchen.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getSecureHeaders(),
        body: JSON.stringify({ kitchen_id: kitchen.id }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر استعادة التكية.');
      }

      setMessage(result.message);
      await loadKitchens();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء استعادة التكية.');
    } finally {
      setUpdatingId(null);
    }
  }

  // تحديث حالة طلب دعم
  async function handleUpdateSupportStatus(requestId, newStatus) {
    try {
      const response = await fetch(`${API}/update-support-request.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getSecureHeaders(),
        body: JSON.stringify({
          request_id: requestId,
          status: newStatus,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage(result.message);
        await loadSupportRequests();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message || 'تعذر تحديث حالة طلب الدعم.');
    }
  }

  // أرشفة طلب دعم
  async function handleArchiveSupportRequest(requestId) {
    if (!window.confirm('هل تريدين أرشفة طلب الدعم هذا؟')) return;
    try {
      const response = await fetch(`${API}/update-support-request.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getSecureHeaders(),
        body: JSON.stringify({
          request_id: requestId,
          archive_action: 'archive',
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage(result.message);
        await loadSupportRequests();
      }
    } catch (err) {
      setError(err.message || 'تعذر أرشفة الطلب.');
    }
  }

  // تسجيل الخروج
  async function handleLogout() {
    if (!window.confirm('هل تريدين تسجيل الخروج من لوحة الإدارة؟')) return;
    setLoggingOut(true);
    setError('');

    try {
      const response = await fetch(`${API}/logout.php`, {
        method: 'POST',
        credentials: 'include',
        headers: getSecureHeaders(),
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

  // تصنيف وتصفية التكيات
  const activeKitchensList = useMemo(() => {
    return kitchens.filter((k) => Number(k.is_archived) === 0);
  }, [kitchens]);

  const archivedKitchensList = useMemo(() => {
    return kitchens.filter((k) => Number(k.is_archived) === 1);
  }, [kitchens]);

  const filteredCurrentKitchens = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    if (!q) return activeKitchensList;
    return activeKitchensList.filter(
      (k) =>
        k.name?.toLowerCase().includes(q) ||
        k.area_name?.toLowerCase().includes(q) ||
        k.address?.toLowerCase().includes(q) ||
        k.phone?.includes(q)
    );
  }, [activeKitchensList, adminSearch]);

  const filteredArchivedKitchens = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    if (!q) return archivedKitchensList;
    return archivedKitchensList.filter(
      (k) =>
        k.name?.toLowerCase().includes(q) ||
        k.area_name?.toLowerCase().includes(q)
    );
  }, [archivedKitchensList, adminSearch]);

  // إحصائيات لوحة التحكم
  const stats = useMemo(() => {
    const total = activeKitchensList.length;
    const openCount = activeKitchensList.filter((k) => k.status === 'open' && Number(k.is_active) === 1).length;
    const pendingCount = activeKitchensList.filter((k) => k.verification_status === 'pending').length;
    const supportCount = supportRequests.filter((r) => r.status === 'pending').length;
    return { total, openCount, pendingCount, supportCount };
  }, [activeKitchensList, supportRequests]);

  const statusLabel = (status) => {
    switch (status) {
      case 'open': return 'مفتوحة';
      case 'closed': return 'مغلقة';
      case 'paused': return 'متوقفة مؤقتًا';
      default: return 'غير معروفة';
    }
  };

  const verificationLabel = (status) => {
    switch (status) {
      case 'verified': return 'معتمدة';
      case 'rejected': return 'مرفوضة';
      case 'pending': return 'قيد المراجعة';
      default: return 'غير محددة';
    }
  };

  const supportTypeLabel = (type) => {
    switch (type) {
      case 'food_supplies': return 'مواد تموينية وغذائية';
      case 'gas_fuel': return 'غاز طهي ووقود';
      case 'equipment': return 'معدات وأواني طهي';
      case 'water': return 'مياه صالحة للطهي';
      case 'financial': return 'دعم مالي تشغيلي';
      default: return 'احتياجات عامة';
    }
  };

  if (loading) {
    return (
      <main className="admin-loading" dir="rtl">
        <div className="admin-spinner"></div>
        <p>جارٍ تحميل لوحة الإدارة...</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="admin-unauthorized" dir="rtl">
        <div className="admin-unauthorized-card">
          <img src={logo} alt="شعار تكية بهية" />
          <h2>غير مصرح لكِ بالوصول</h2>
          <p>{error || 'يرجى تسجيل الدخول للوصول إلى لوحة الإدارة.'}</p>
          <a href="/?page=login" className="admin-login-link">
            الانتقال إلى صفحة تسجيل الدخول
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard" dir="rtl">
      {/* الشريط العلوي */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <img src={logo} alt="شعار تكية بهية" />
          <div>
            <h1>لوحة إدارة المنصة</h1>
            <p>تكية بهية — أمل وسط الركام في قطاع غزة</p>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-add-kitchen-btn"
            onClick={openAddForm}
          >
            + إضافة تكية جديدة
          </button>

          <a href="/?page=account" className="admin-account-link">
            إدارة الحساب ({user?.full_name || user?.username})
          </a>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}
          </button>
        </div>
      </header>

      {/* التنبيهات والرسائل */}
      {message && (
        <div className="admin-alert success" role="status">
          ✓ {message}
        </div>
      )}
      {error && (
        <div className="admin-alert error" role="alert">
          ⚠ {error}
        </div>
      )}

      {/* شريط الإحصائيات الحية */}
      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="stat-title">إجمالي التكيات النشطة</span>
          <strong className="stat-value">{stats.total}</strong>
          <span className="stat-meta">في مناطق التغطية الخمس</span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-title">تكيات مفتوحة اليوم</span>
          <strong className="stat-value stat-green">{stats.openCount}</strong>
          <span className="stat-meta">توزع الطعام والمساعدات</span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-title">تكيات قيد المراجعة</span>
          <strong className="stat-value stat-amber">{stats.pendingCount}</strong>
          <span className="stat-meta">تحتاج لاعتماد الإدارة</span>
        </div>

        <div className="admin-stat-card">
          <span className="stat-title">طلبات دعم جديدة</span>
          <strong className="stat-value stat-red">{stats.supportCount}</strong>
          <span className="stat-meta">مطابخ تحتاج لمساندة عاجلة</span>
        </div>
      </section>

      {/* التبويبات والبحث */}
      <section className="admin-controls-bar">
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            التكيات المسجلة ({activeKitchensList.length})
          </button>

          <button
            type="button"
            className={`admin-tab ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            طلبات الدعم والمطابخ ({supportRequests.length})
          </button>

          <button
            type="button"
            className={`admin-tab ${activeTab === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveTab('archived')}
          >
            الأرشيف ({archivedKitchensList.length})
          </button>
        </div>

        {activeTab !== 'support' && (
          <div className="admin-search-wrapper">
            <input
              type="search"
              placeholder="ابحث بالاسم أو الحي أو الهاتف..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="admin-search-input"
            />
          </div>
        )}
      </section>

      {/* محتوى التبويب: التكيات المسجلة والأرشيف */}
      {(activeTab === 'current' || activeTab === 'archived') && (
        <section className="admin-kitchens-section">
          {((activeTab === 'current' && filteredCurrentKitchens.length === 0) ||
            (activeTab === 'archived' && filteredArchivedKitchens.length === 0)) ? (
            <div className="admin-empty-state">
              <p>
                {adminSearch
                  ? 'لا توجد تكيات تطابق عبارة البحث.'
                  : activeTab === 'current'
                  ? 'لا توجد تكيات مسجلة حاليًا. يمكنكِ إضافة تكية جديدة من الزر أعلاه.'
                  : 'الأرشيف فارغ حالياً.'}
              </p>
            </div>
          ) : (
            <div className="admin-kitchens-grid">
              {(activeTab === 'current' ? filteredCurrentKitchens : filteredArchivedKitchens).map(
                (kitchen) => (
                  <article className="admin-kitchen-card" key={kitchen.id}>
                    <div className="admin-card-header">
                      <h3>{kitchen.name}</h3>
                      <div className="admin-badges">
                        <span className={`admin-status ${kitchen.verification_status}`}>
                          {verificationLabel(kitchen.verification_status)}
                        </span>
                        <span className={`kitchen-status ${kitchen.status || 'unknown'}`}>
                          {statusLabel(kitchen.status)}
                        </span>
                      </div>
                    </div>

                    <div className="admin-card-body">
                      <p>
                        <strong>المنطقة:</strong> {kitchen.area_name || 'غير محددة'}
                      </p>
                      <p>
                        <strong>العنوان:</strong> {kitchen.address || 'غير محدد'}
                      </p>
                      <p>
                        <strong>الهاتف:</strong>{' '}
                        {kitchen.phone ? (
                          <a href={`tel:${kitchen.phone}`} dir="ltr">
                            {kitchen.phone}
                          </a>
                        ) : (
                          'غير متوفر'
                        )}
                      </p>
                      <p>
                        <strong>الإحداثيات:</strong>{' '}
                        {kitchen.latitude && kitchen.longitude
                          ? `${kitchen.latitude}, ${kitchen.longitude}`
                          : 'غير محددة على الخريطة'}
                      </p>
                      {kitchen.description && (
                        <p className="admin-card-desc">
                          <strong>الوصف:</strong> {kitchen.description}
                        </p>
                      )}
                    </div>

                    {activeTab === 'current' ? (
                      <div className="admin-card-actions">
                        <button
                          type="button"
                          className="admin-edit-btn"
                          disabled={updatingId !== null}
                          onClick={() => openEditForm(kitchen)}
                        >
                          تعديل البيانات
                        </button>

                        <button
                          type="button"
                          className="admin-toggle-btn"
                          disabled={updatingId !== null}
                          onClick={() => toggleKitchenActive(kitchen)}
                        >
                          {Number(kitchen.is_active) === 1 ? 'إيقاف مؤقت' : 'تفعيل'}
                        </button>

                        {kitchen.verification_status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="admin-verify-btn"
                              disabled={updatingId !== null}
                              onClick={() => updateVerification(kitchen.id, 'verified')}
                            >
                              اعتماد
                            </button>
                            <button
                              type="button"
                              className="admin-reject-btn"
                              disabled={updatingId !== null}
                              onClick={() => updateVerification(kitchen.id, 'rejected')}
                            >
                              رفض
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          className="admin-archive-btn"
                          disabled={updatingId !== null}
                          onClick={() => archiveKitchen(kitchen)}
                        >
                          نقل للأرشيف
                        </button>
                      </div>
                    ) : (
                      <div className="admin-card-actions">
                        <button
                          type="button"
                          className="admin-restore-btn"
                          disabled={updatingId !== null}
                          onClick={() => restoreKitchen(kitchen)}
                        >
                          استعادة من الأرشيف
                        </button>
                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          )}
        </section>
      )}

      {/* محتوى التبويب: طلبات الدعم */}
      {activeTab === 'support' && (
        <section className="admin-support-section">
          {supportRequests.length === 0 ? (
            <div className="admin-empty-state">
              <p>لا توجد طلبات دعم واردة حالياً.</p>
            </div>
          ) : (
            <div className="admin-support-list">
              {supportRequests.map((req) => (
                <article className="admin-support-card" key={req.id}>
                  <div className="admin-support-header">
                    <div>
                      <h3>{req.kitchen_name}</h3>
                      <span className="support-requester">
                        المشرف: {req.contact_person} —{' '}
                        <a href={`tel:${req.phone}`} dir="ltr">{req.phone}</a>
                      </span>
                    </div>

                    <div className="admin-support-meta-badges">
                      <span className={`urgency-badge ${req.urgency_level}`}>
                        {req.urgency_level === 'critical' ? 'حرج جداً' : req.urgency_level === 'urgent' ? 'عاجل' : 'عادي'}
                      </span>
                      <span className="support-type-badge">
                        {supportTypeLabel(req.support_type)}
                      </span>
                    </div>
                  </div>

                  <div className="admin-support-body">
                    <p><strong>المنطقة والعنوان:</strong> {req.area_name} — {req.address || 'غير محدد'}</p>
                    {req.target_beneficiaries_count && (
                      <p><strong>عدد الوجبات / المستفيدين المستهدفين:</strong> {req.target_beneficiaries_count}</p>
                    )}
                    <p className="admin-support-desc">
                      <strong>وصف الاحتياج:</strong> {req.description}
                    </p>
                    {req.admin_notes && (
                      <p className="admin-notes-preview">
                        <strong>ملاحظات الإدارة:</strong> {req.admin_notes}
                      </p>
                    )}
                  </div>

                  <div className="admin-support-footer">
                    <div className="status-changer">
                      <label htmlFor={`status-${req.id}`}>حالة الطلب:</label>
                      <select
                        id={`status-${req.id}`}
                        value={req.status}
                        onChange={(e) => handleUpdateSupportStatus(req.id, e.target.value)}
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="under_review">قيد المراجعة والتنسيق</option>
                        <option value="fulfilled">تم تقديم الدعم بنجاح</option>
                        <option value="rejected">مرفوض / غير متاح</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="admin-support-archive"
                      onClick={() => handleArchiveSupportRequest(req.id)}
                    >
                      أرشفة الطلب
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* نافذة مودال: إضافة تكية جديدة */}
      {addingKitchen && (
        <div className="admin-modal-overlay">
          <form className="admin-modal-form" onSubmit={handleCreateKitchen}>
            <h2>إضافة تكية جديدة للمنصة</h2>

            <label htmlFor="add-name">اسم التكية / المطبخ الخيري *</label>
            <input
              id="add-name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="مثال: تكية الشهداء الخيرية"
              required
            />

            <label htmlFor="add-area">المنطقة *</label>
            <select
              id="add-area"
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

            <label htmlFor="add-address">العنوان التفصيلي</label>
            <input
              id="add-address"
              name="address"
              value={form.address}
              onChange={handleFormChange}
              placeholder="الشارع أو أقرب معلم"
            />

            <label htmlFor="add-phone">رقم الهاتف للتواصل</label>
            <input
              id="add-phone"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              placeholder="0599000000"
            />

            <div className="admin-coords-grid">
              <div>
                <label htmlFor="add-lat">خط العرض (Latitude)</label>
                <input
                  id="add-lat"
                  name="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={handleFormChange}
                  placeholder="مثال: 31.5240"
                />
              </div>
              <div>
                <label htmlFor="add-lng">خط الطول (Longitude)</label>
                <input
                  id="add-lng"
                  name="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={handleFormChange}
                  placeholder="مثال: 34.4560"
                />
              </div>
            </div>

            <label htmlFor="add-desc">وصف التكية والوجبات</label>
            <textarea
              id="add-desc"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows="3"
              placeholder="مواعيد التوزيع، الفئات المستهدفة، أو معلومات إضافية..."
            />

            <label htmlFor="add-status">حالة التشغيل الأولية</label>
            <select
              id="add-status"
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              <option value="open">مفتوحة</option>
              <option value="closed">مغلقة</option>
              <option value="paused">متوقفة مؤقتًا</option>
              <option value="unknown">غير محددة</option>
            </select>

            <div className="admin-modal-buttons">
              <button type="submit" disabled={savingForm} className="btn-primary">
                {savingForm ? 'جارٍ الحفظ...' : 'حفظ وإضافة التكية'}
              </button>
              <button type="button" onClick={closeModals} disabled={savingForm} className="btn-secondary">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* نافذة مودال: تعديل بيانات التكية */}
      {editingKitchen && (
        <div className="admin-modal-overlay">
          <form className="admin-modal-form" onSubmit={handleUpdateKitchen}>
            <h2>تعديل بيانات التكية</h2>

            <label htmlFor="edit-name">اسم التكية *</label>
            <input
              id="edit-name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
            />

            <label htmlFor="edit-area">المنطقة *</label>
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

            <div className="admin-coords-grid">
              <div>
                <label htmlFor="edit-lat">خط العرض (Latitude)</label>
                <input
                  id="edit-lat"
                  name="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={handleFormChange}
                  placeholder="31.5240"
                />
              </div>
              <div>
                <label htmlFor="edit-lng">خط الطول (Longitude)</label>
                <input
                  id="edit-lng"
                  name="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={handleFormChange}
                  placeholder="34.4560"
                />
              </div>
            </div>

            <label htmlFor="edit-desc">وصف التكية</label>
            <textarea
              id="edit-desc"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows="3"
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
              <option value="unknown">غير محددة</option>
            </select>

            <div className="admin-modal-buttons">
              <button type="submit" disabled={savingForm} className="btn-primary">
                {savingForm ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
              </button>
              <button type="button" onClick={closeModals} disabled={savingForm} className="btn-secondary">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
