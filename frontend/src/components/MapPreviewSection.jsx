import { useEffect, useState } from 'react';
import './MapPreviewSection.css';
import InteractiveMap from './InteractiveMap.jsx';
import { API_BASE_URL } from '../config/api.js';

const fallbackAreas = [
  { id: 1, name: 'الرمال' },
  { id: 2, name: 'النصر' },
  { id: 3, name: 'الشاطئ' },
  { id: 4, name: 'الشيخ رضوان' },
  { id: 5, name: 'الجلاء' },
];

export default function MapPreviewSection() {
  const [areas, setAreas] = useState(fallbackAreas);
  const [kitchens, setKitchens] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadMapData() {
      try {
        const [areasRes, kitchensRes] = await Promise.all([
          fetch(`${API_BASE_URL}/areas.php`).then((r) => r.json()).catch(() => ({ success: false })),
          fetch(`${API_BASE_URL}/kitchens.php`).then((r) => r.json()).catch(() => ({ success: false })),
        ]);

        if (!isMounted) return;

        if (areasRes.success && Array.isArray(areasRes.data) && areasRes.data.length > 0) {
          setAreas(areasRes.data);
        }

        if (kitchensRes.success && Array.isArray(kitchensRes.data)) {
          setKitchens(kitchensRes.data);
        }
      } catch {
        if (isMounted) {
          setError('تعذر تحميل بيانات الخريطة.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMapData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="map-section" id="map" dir="rtl">
      <div className="map-section-heading">
        <span className="map-section-label">استكشف مناطق التغطية</span>
        <h2>اكتشف التكيات في منطقتك</h2>
        <p>
          تعرّف على مناطق التغطية واستكشف مواقع التكيات الموثقة جغرافياً في غزة من مكان واحد.
        </p>
      </div>

      <div className="map-section-content">
        <div className="map-areas">
          <h3>مناطق التغطية</h3>
          <p>اختر المنطقة التي ترغب في استكشافها على الخريطة:</p>

          <div className="map-area-list">
            <button
              type="button"
              className={`map-area-item ${selectedArea === '' ? 'active' : ''}`}
              onClick={() => setSelectedArea('')}
            >
              <span className="map-area-icon"><span>🗺</span></span>
              <span>جميع المناطق ({kitchens.length})</span>
              <span className="map-area-arrow">←</span>
            </button>

            {loading ? (
              <p>جاري تحميل المناطق...</p>
            ) : error ? (
              <p className="map-error">{error}</p>
            ) : (
              areas.map((area) => (
                <button
                  type="button"
                  className={`map-area-item ${
                    selectedArea === area.name ? 'active' : ''
                  }`}
                  key={area.id || area.name}
                  onClick={() => setSelectedArea(area.name)}
                >
                  <span className="map-area-icon"><span>⌖</span></span>
                  <span>{area.name}</span>
                  <span className="map-area-arrow">←</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="map-container">
          <div className="map-container-heading">
            <h3>خريطة التكيات الخيرية</h3>
            <span className="map-active-badge">
              {selectedArea || 'عرض كافة المناطق المتاحة'}
            </span>
          </div>

          <InteractiveMap selectedArea={selectedArea} kitchens={kitchens} />

          <p className="map-note">
            💡 اضغط على علامة أي تكية على الخريطة لعرض تفاصيلها ورقم التواصل ومواعيد تقديم الوجبات.
          </p>
        </div>
      </div>
    </section>
  );
}
