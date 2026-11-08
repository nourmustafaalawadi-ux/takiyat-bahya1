
import { useEffect, useState } from 'react';
import './DirectorySection.css';

const areas = [
  'الرمال',
  'النصر',
  'الشاطئ',
  'الشيخ رضوان',
  'الجلاء',
];

export default function DirectorySection() {
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost/takiyat-bahya/backend/api/kitchens.php')
      .then((response) => {
        if (!response.ok) {
          throw new Error('تعذر تحميل بيانات التكيات');
        }
        return response.json();
      })
      .then((result) => {
        if (result.success) {
          setKitchens(result.data);
        } else {
          throw new Error('تعذر تحميل بيانات التكيات');
        }
      })
      .catch(() => {
        setError('تعذر تحميل بيانات التكيات، يرجى المحاولة لاحقًا.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="directory-section" id="directory" dir="rtl">

      <div className="directory-heading">
        <span className="directory-label">
          دليل التكيات
        </span>

        <h2>اعرف المزيد عن التكيات</h2>

        <p>
          دليل يجمع معلومات التكيات ومواقعها ومواعيد
          توزيع الطعام، لتسهيل الوصول إلى المساعدة.
        </p>
      </div>

      <div className="directory-areas">
        <h3>تصفح حسب المنطقة</h3>

        <div className="directory-area-list">
          {areas.map((area) => (
            <span className="directory-area" key={area}>
              {area}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="directory-empty">
          <h3>جاري تحميل بيانات التكيات...</h3>
        </div>
      ) : error ? (
        <div className="directory-empty">
          <h3>{error}</h3>
        </div>
      ) : kitchens.length === 0 ? (
        <div className="directory-empty">
          <div className="directory-empty-icon">
            <span>⌕</span>
          </div>

          <h3>لا توجد تكيات موثّقة متاحة حاليًا</h3>

          <p>
            نعمل على تجهيز دليل محدث يضم بيانات التكيات
            ومواقعها ومواعيد توزيع الطعام.
            ستظهر المعلومات هنا بعد التحقق منها.
          </p>
        </div>
      ) : (
        <div className="directory-kitchens">
          {kitchens.map((kitchen) => (
            <article className="directory-kitchen-card" key={kitchen.id}>
              <h3>{kitchen.name}</h3>

              <p>{kitchen.area_name}</p>

              {kitchen.description && (
                <p>{kitchen.description}</p>
              )}

              {kitchen.address && (
                <p>العنوان: {kitchen.address}</p>
              )}

              {kitchen.phone && (
                <p>رقم التواصل: {kitchen.phone}</p>
              )}

              <span className={`kitchen-status ${kitchen.status}`}>
                {kitchen.status === 'open' ? 'مفتوحة' :
                 kitchen.status === 'closed' ? 'مغلقة' :
                 kitchen.status === 'paused' ? 'متوقفة مؤقتًا' :
                 'الحالة غير محددة'}
              </span>
            </article>
          ))}
        </div>
      )}

    </section>
  );
}
