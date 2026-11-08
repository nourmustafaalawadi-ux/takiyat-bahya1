
import './HeroSection.css';
import bahyaLogo from '../assets/bahya-logo.png';

export default function HeroSection() {
  return (
    <section className="hero-section" id="home" dir="rtl">
      <div className="hero-content">

        <span className="hero-label">
          تكية بهية | دليل التكيات في قطاع غزة
        </span>

        <h1>
          كل ما تحتاج معرفته عن التكيات،
          <span> في مكان واحد.</span>
        </h1>

        <p className="hero-description">
          منصة تكية بهية تجمع معلومات التكيات في مناطق قطاع غزة،
          لتسهيل الوصول إلى مواقعها والتعرّف على مواعيد توزيع الطعام
          وآخر التحديثات.
        </p>

        <div className="hero-actions">
          <a href="#map" className="hero-button hero-button-primary">
            استكشف خريطة التكيات
          </a>

          <a href="#directory" className="hero-button hero-button-secondary">
            تصفح دليل التكيات
          </a>
        </div>

      </div>

      <div className="hero-visual">
        <div className="hero-logo-wrapper">
          <img
            src={bahyaLogo}
            alt="شعار تكية بهية"
            className="hero-logo"
          />
        </div>
      </div>
    </section>
  );
}
