
import { useEffect, useState } from 'react';
import './MapPreviewSection.css';
import InteractiveMap from './InteractiveMap.jsx';

export default function MapPreviewSection() {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost/takiyat-bahya/backend/api/areas.php')
      .then((response) => {
        if (!response.ok) {
          throw new Error('تعذر تحميل المناطق');
        }
        return response.json();
      })
      .then((result) => {
        if (result.success) {
          setAreas(result.data);
        } else {
          throw new Error('تعذر تحميل المناطق');
        }
      })
      .catch(() => {
        setError('تعذر تحميل المناطق، يرجى المحاولة لاحقًا.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="map-section" id="map" dir="rtl">
      <div className="map-section-heading">
        <span className="map-section-label">
          استكشف مناطق التغطية
        </span>

        <h2>اكتشف التكيات في منطقتك</h2>

        <p>
          تعرّف على مناطق التغطية واستكشف مواقع التكيات
          ومعلوماتها من مكان واحد.
        </p>
      </div>

      <div className="map-section-content">
        <div className="map-areas">
          <h3>مناطق التغطية</h3>
          <p>اختر المنطقة التي ترغب في استكشافها.</p>

          <div className="map-area-list">
            {loading ? (
              <p>جاري تحميل المناطق...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              areas.map((area) => (
                <button
                  type="button"
                  className={`map-area-item ${
                    selectedArea === area.name ? 'active' : ''
                  }`}
                  key={area.id}
                  onClick={() => setSelectedArea(area.name)}
                >
                  <span className="map-area-icon">
                    <span>⌖</span>
                  </span>

                  <span>{area.name}</span>

                  <span className="map-area-arrow">←</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="map-container">
          <div className="map-container-heading">
            <h3>خريطة التكيات</h3>
            <span>
              {selectedArea || 'استكشف الخريطة'}
            </span>
          </div>

          <InteractiveMap selectedArea={selectedArea} />

          <p className="map-note">
            تظهر الخريطة الجغرافية حاليًا، وستُضاف مواقع التكيات
            بعد التحقق من بياناتها.
          </p>
        </div>
      </div>
    </section>
  );
}
