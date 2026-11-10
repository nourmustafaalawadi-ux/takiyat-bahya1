import { useState } from 'react';
import './ContactSection.css';
import bahyaLogo from '../assets/bahya-logo.png';
import { API_BASE_URL } from '../config/api.js';

const contactPhone = '970599000000';

const initialRequestForm = {
  kitchen_name: '',
  contact_person: '',
  phone: '',
  area_id: '1',
  address: '',
  support_type: 'food_supplies',
  urgency_level: 'urgent',
  target_beneficiaries_count: '',
  description: '',
};

export default function ContactSection() {
  const [formData, setFormData] = useState(initialRequestForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitSupport = async (e) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');

    if (!formData.kitchen_name.trim() || !formData.contact_person.trim() || !formData.phone.trim() || !formData.description.trim()) {
      setSubmitError('يرجى تعبئة كافة الحقول الإلزامية.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/submit-support-request.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'حدث خطأ أثناء إرسال الطلب.');
      }

      setSubmitSuccess(result.message || 'تم إرسال طلب الدعم بنجاح.');
      setFormData(initialRequestForm);
    } catch (err) {
      setSubmitError(err.message || 'تعذر الاتصال بالخادم.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* قسم تقديم طلب دعم للتكيات والمطابخ الخيرية */}
      <section className="support-section" id="support-request" dir="rtl">
        <div className="support-container">
          <div className="support-heading">
            <span className="contact-label">بوابة مساندة التكيات</span>
            <h2>
              هل تدير تكية أو مطبخاً خيرياً
              <span> يحتاج إلى دعم؟</span>
            </h2>
            <p>
              نوفر هذا النموذج للمسؤولين عن التكيات في قطاع غزة لتسجيل احتياجاتهم
              التموينية والتشغيلية (مواد غذائية، غاز طهي، معدات، مياه) لعرضها على الجهات والمؤسسات الداعمة.
            </p>
          </div>

          <form className="support-form" onSubmit={handleSubmitSupport}>
            {submitSuccess && (
              <div className="support-alert success" role="status">
                ✓ {submitSuccess}
              </div>
            )}
            {submitError && (
              <div className="support-alert error" role="alert">
                ⚠ {submitError}
              </div>
            )}

            <div className="support-form-grid">
              <div className="form-group">
                <label htmlFor="sr-kitchen-name">اسم التكية / المطبخ الخيري *</label>
                <input
                  id="sr-kitchen-name"
                  name="kitchen_name"
                  type="text"
                  placeholder="مثال: تكية الأمل الخيرية"
                  value={formData.kitchen_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sr-contact-person">اسم الشخص المسؤول *</label>
                <input
                  id="sr-contact-person"
                  name="contact_person"
                  type="text"
                  placeholder="الاسم الكامل للمشرف"
                  value={formData.contact_person}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sr-phone">رقم الهاتف للتواصل *</label>
                <input
                  id="sr-phone"
                  name="phone"
                  type="tel"
                  placeholder="مثال: 0599123456"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sr-area">المنطقة *</label>
                <select
                  id="sr-area"
                  name="area_id"
                  value={formData.area_id}
                  onChange={handleChange}
                  required
                >
                  <option value="1">الرمال</option>
                  <option value="2">النصر</option>
                  <option value="3">الشاطئ</option>
                  <option value="4">الشيخ رضوان</option>
                  <option value="5">الجلاء</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sr-address">العنوان التفصيلي</label>
                <input
                  id="sr-address"
                  name="address"
                  type="text"
                  placeholder="الشارع أو أقرب معلم بارز"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sr-support-type">نوع الدعم المطلوب *</label>
                <select
                  id="sr-support-type"
                  name="support_type"
                  value={formData.support_type}
                  onChange={handleChange}
                  required
                >
                  <option value="food_supplies">مواد غذائية وتموينية (أرز، دقيق، زيت، بقوليات)</option>
                  <option value="gas_fuel">غاز طهي أو وقود</option>
                  <option value="equipment">أواني ومعدات طهي كبيرة</option>
                  <option value="water">مياه صالحة للشرب والطهي</option>
                  <option value="financial">دعم مالي تشغيلي</option>
                  <option value="other">احتياجات أخرى</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sr-urgency">مستوى الاستعجال *</label>
                <select
                  id="sr-urgency"
                  name="urgency_level"
                  value={formData.urgency_level}
                  onChange={handleChange}
                  required
                >
                  <option value="critical">حرج جداً (خطر توقف خلال 24-48 ساعة)</option>
                  <option value="urgent">عاجل (خلال أيام)</option>
                  <option value="normal">عادي (دعم واستمرار)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sr-beneficiaries">عدد المستفيدين / الوجبات المتوقعة يومياً</label>
                <input
                  id="sr-beneficiaries"
                  name="target_beneficiaries_count"
                  type="number"
                  min="1"
                  placeholder="مثال: 500 وجبة"
                  value={formData.target_beneficiaries_count}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="sr-description">تفاصيل ووصف الاحتياج *</label>
              <textarea
                id="sr-description"
                name="description"
                rows="4"
                placeholder="وضّح الكميات المطلوبة وأسباب النقص وأي تفاصيل تساعد الجهات الداعمة على الاستجابة السريعة..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="support-submit-btn"
              disabled={submitting}
            >
              {submitting ? 'جارٍ إرسال الطلب...' : 'إرسال طلب الدعم للمراجعة'}
            </button>
          </form>
        </div>
      </section>

      {/* قسم التواصل المباشر */}
      <section className="contact-section" id="contact" dir="rtl">
        <div className="contact-content">
          <span className="contact-label">تواصل معنا</span>

          <h2>
            نحن هنا لنقرّب
            <span> طريق الخير.</span>
          </h2>

          <p>
            لديك استفسار أو معلومة عن إحدى التكيات؟
            يسعدنا تواصلك معنا للمساهمة في تحديث
            المعلومات وتحسين خدمات المنصة.
          </p>

          <a
            href={`tel:+${contactPhone}`}
            className="contact-button"
          >
            اتصل بإدارة تكية بهية
            <span>←</span>
          </a>
        </div>
      </section>

      {/* التذييل */}
      <footer className="site-footer" dir="rtl">
        <div className="footer-main">
          <div className="footer-brand">
            <img
              src={bahyaLogo}
              alt="شعار تكية بهية"
            />
            <div>
              <h3>تكية بهية</h3>
              <p>منصة تجمع الخير في غزة</p>
            </div>
          </div>

          <div className="footer-links">
            <a href="#home">الرئيسية</a>
            <a href="#map">خريطة التكيات</a>
            <a href="#directory">دليل التكيات</a>
            <a href="#about">من نحن</a>
            <a href="#support-request">طلب دعم</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 تكية بهية. جميع الحقوق محفوظة.</p>
          <span>المعلومة أقرب، والوصول أسهل.</span>
        </div>
      </footer>
    </>
  );
}
