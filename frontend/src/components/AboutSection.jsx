import './AboutSection.css';
import bahyaLogo from '../assets/bahya-logo.png';

export default function AboutSection() {
  return (
    <section className="about-section" id="about" dir="rtl">
      <div className="about-content">
        <span className="about-label">من نحن</span>

        <h2>
          لأن الوصول إلى المعلومة
          <span> يصنع فرقًا.</span>
        </h2>

        <p>
          تكية بهية منصة إلكترونية إنسانية تهدف إلى تسهيل وصول
          سكان قطاع غزة إلى معلومات التكيات ومواقعها
          ومواعيد توزيع الطعام، من خلال جمع المعلومات
          وتنظيمها في مكان واحد يسهل الوصول إليه.
        </p>

        <p>
          نؤمن أن تنظيم المعلومات وتحديثها يساعدان
          الأفراد على معرفة الخيارات المتاحة لهم،
          ويعززان التواصل بين المجتمع والجهات القائمة
          على تقديم المساعدة، كما نتيح للتكيات الإعلان عن
          احتياجاتها التموينية والتشغيلية لتلقي المساندة.
        </p>

        <div className="about-values">
          <div className="about-value">
            <span className="about-value-icon">⌖</span>
            <div>
              <h3>سهولة الوصول</h3>
              <p>معلومات منظمة في مكان واحد وموثقة جغرافياً.</p>
            </div>
          </div>

          <div className="about-value">
            <span className="about-value-icon">✓</span>
            <div>
              <h3>موثوقية المعلومات</h3>
              <p>الحرص على التحقق الدوري من البيانات وتحديثها.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="about-visual">
        <div className="about-visual-card">
          <img
            src={bahyaLogo}
            alt="شعار تكية بهية"
            className="about-logo"
          />

          <h3>تكية بهية</h3>
          <p>منصة تجمع معلومات التكيات في قطاع غزة</p>
          <span>المعلومة أقرب، والوصول أسهل.</span>
        </div>

        <div className="about-decoration about-decoration-one"></div>
        <div className="about-decoration about-decoration-two"></div>
      </div>
    </section>
  );
}
