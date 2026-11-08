
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar" dir="rtl">
      <a className="navbar-brand" href="#home" onClick={closeMenu}>
       <img
          src="/src/assets/bahya-logo.png"
          alt="شعار تكية بهية"
          className="navbar-logo"
        /> 
        <span className="navbar-brand-text">
          <strong>تكية بهية</strong>
          <small>منصة تجمع الخير في غزة</small>
        </span>
      </a>

      <nav className={`navbar-links ${menuOpen ? 'is-open' : ''}`}>
        <a className="active" href="#home" onClick={closeMenu}>الرئيسية</a>
        <a href="#map" onClick={closeMenu}>خريطة التكيات</a>
        <a href="#directory" onClick={closeMenu}>دليل التكيات</a>
        <a href="#about" onClick={closeMenu}>من نحن</a>
      </nav>

      <a className="navbar-contact" href="#contact">تواصل معنا</a>

      <button
        className="navbar-toggle"
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? '✕' : '☰'}
      </button>
    </header>
  );
}
