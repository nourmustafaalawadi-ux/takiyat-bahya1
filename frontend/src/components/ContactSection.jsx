
import './ContactSection.css';

// يمكن تغيير رقم الهاتف من هنا لاحقًا
const contactPhone = '970599000000';

export default function ContactSection() {
  return (
    <>
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

      <footer className="site-footer" dir="rtl">
        <div className="footer-main">
          <div className="footer-brand">
            <img
              src="/src/assets/bahya-logo.png"
              alt="شعار تكية بهية"
            />

            <div>
              <h3>تكية بهية</h3>
              <p>منصة تجمع معلومات التكيات في غزة</p>
            </div>
          </div>

          <div className="footer-links">
            <a href="#home">الرئيسية</a>
            <a href="#map">خريطة التكيات</a>
            <a href="#directory">دليل التكيات</a>
            <a href="#about">من نحن</a>
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
