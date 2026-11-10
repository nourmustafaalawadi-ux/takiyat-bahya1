import { useEffect, useState, useMemo } from 'react';
import './DirectorySection.css';
import { API_BASE_URL } from '../config/api.js';

const defaultAreas = [
  { id: 1, name: 'الرمال' },
  { id: 2, name: 'النصر' },
  { id: 3, name: 'الشاطئ' },
  { id: 4, name: 'الشيخ رضوان' },
  { id: 5, name: 'الجلاء' },
];

export default function DirectorySection() {
  const [kitchens, setKitchens] = useState([]);
  const [areas, setAreas] = useState(defaultAreas);
  const [selectedArea, setSelectedArea] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const [kitchensRes, areasRes] = await Promise.all([
          fetch(`${API_BASE_URL}/kitchens.php`).then((r) => r.json()).catch(() => ({ success: false })),
          fetch(`${API_BASE_URL}/areas.php`).then((r) => r.json()).catch(() => ({ success: false })),
        ]);

        if (!isMounted) return;

        if (kitchensRes.success && Array.isArray(kitchensRes.data)) {
          setKitchens(kitchensRes.data);
        } else {
          setError('تعذر تحميل بيانات التكيات من الخادم.');
        }

        if (areasRes.success && Array.isArray(areasRes.data) && areasRes.data.length > 0) {
          setAreas(areasRes.data);
        }
      } catch {
        if (isMounted) {
          setError('تعذر الاتصال بالخادم، يرجى المحاولة لاحقًا.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredKitchens = useMemo(() => {
    return kitchens.filter((kitchen) => {
      const matchArea = !selectedArea || kitchen.area_name === selectedArea;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        kitchen.name?.toLowerCase().includes(q) ||
        kitchen.address?.toLowerCase().includes(q) ||
        kitchen.description?.toLowerCase().includes(q) ||
        kitchen.area_name?.toLowerCase().includes(q);

      return matchArea && matchSearch;
    });
  }, [kitchens, selectedArea, searchQuery]);

  const handleResetFilters = () => {
    setSelectedArea('');
    setSearchQuery('');
  };

  return (
    <section className="directory-section" id="directory" dir="rtl">
      <div className="directory-heading">
        <span className="directory-label">دليل التكيات والمطابخ الخيرية</span>
        <h2>اعرف المزيد عن التكيات في غزة</h2>
        <p>
          دليل موحد يجمع التكيات الموثقة ومواقعها ومواعيد تقديم الوجبات،
          لتسهيل وصول العائلات والأفراد إلى المساعدة الإغاثية.
        </p>
      </div>

      {/* شريط البحث المباشر */}
      <div className="directory-search-wrapper">
        <div className="directory-search-box">
          <span className="directory-search-icon">🔍</span>
          <input
            type="search"
            placeholder="ابحث عن تكية، حي، شارع، أو كلمة مفتاحية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="directory-search-input"
            aria-label="البحث في دليل التكيات"
          />
          {searchQuery && (
            <button
              type="button"
              className="directory-search-clear"
              onClick={() => setSearchQuery('')}
              title="مسح البحث"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* أزرار التصفية حسب المنطقة */}
      <div className="directory-areas">
        <h3>تصفح حسب المنطقة:</h3>
        <div className="directory-area-list" role="tablist">
          <button
            type="button"
            className={`directory-area-btn ${selectedArea === '' ? 'active' : ''}`}
            onClick={() => setSelectedArea('')}
          >
            جميع المناطق ({kitchens.length})
          </button>
          {areas.map((area) => (
            <button
              type="button"
              className={`directory-area-btn ${selectedArea === area.name ? 'active' : ''}`}
              key={area.id || area.name}
              onClick={() => setSelectedArea(area.name)}
            >
              {area.name}
            </button>
          ))}
        </div>
      </div>

      {/* محتوى البطاقات أو الحالات */}
      {loading ? (
        <div className="directory-empty">
          <div className="directory-spinner"></div>
          <h3>جاري تحميل بيانات التكيات...</h3>
        </div>
      ) : error ? (
        <div className="directory-empty">
          <div className="directory-empty-icon"><span>⚠</span></div>
          <h3>{error}</h3>
          <p>تأكد من تشغيل خادم قاعدة البيانات، ثم حاول تحديث الصفحة.</p>
        </div>
      ) : filteredKitchens.length === 0 ? (
        <div className="directory-empty">
          <div className="directory-empty-icon"><span>⌕</span></div>
          <h3>لا توجد تكيات مطابقة لمعايير البحث</h3>
          <p>
            {selectedArea || searchQuery
              ? 'لم نعثر على نتائج تطابق خيارات البحث الحالية. جرّب اختيار منطقة أخرى أو إعادة ضبط الفلاتر.'
              : 'نعمل على توثيق بيانات التكيات المتاحة حالياً، وستظهر فور اعتمادها.'}
          </p>
          {(selectedArea || searchQuery) && (
            <button
              type="button"
              className="directory-reset-btn"
              onClick={handleResetFilters}
            >
              إعادة ضبط الفلاتر وعرض الكل
            </button>
          )}
        </div>
      ) : (
        <div className="directory-kitchens">
          {filteredKitchens.map((kitchen) => (
            <article className="directory-kitchen-card" key={kitchen.id}>
              <div className="kitchen-card-header">
                <h3>{kitchen.name}</h3>
                <span className={`kitchen-status ${kitchen.status || 'unknown'}`}>
                  {kitchen.status === 'open'
                    ? 'مفتوحة الآن'
                    : kitchen.status === 'closed'
                    ? 'مغلقة'
                    : kitchen.status === 'paused'
                    ? 'متوقفة مؤقتًا'
                    : 'غير محددة'}
                </span>
              </div>

              <div className="kitchen-card-meta">
                <span className="kitchen-area-badge">📍 {kitchen.area_name}</span>
              </div>

              {kitchen.description && (
                <p className="kitchen-card-desc">{kitchen.description}</p>
              )}

              {kitchen.address && (
                <p className="kitchen-card-info">
                  <strong>العنوان:</strong> {kitchen.address}
                </p>
              )}

              {kitchen.phone && (
                <p className="kitchen-card-info">
                  <strong>رقم التواصل:</strong>{' '}
                  <a href={`tel:${kitchen.phone}`} className="kitchen-phone-link">
                    {kitchen.phone} 📞
                  </a>
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
