
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import './App.css';
import MapPreviewSection from './components/MapPreviewSection.jsx';
import DirectorySection from './components/DirectorySection.jsx';
import AboutSection from './components/AboutSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import Account from './pages/account/Account.jsx';

function App() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  const path = window.location.pathname.replace(/\/+$/, '');

  if (page === 'login' || path === '/login') {
    return <Login />;
  }

  if (page === 'admin' || path === '/admin') {
    return <AdminDashboard />;
  }

  if (page === 'account' || path === '/account') {
    return <Account />;
  }

  return (
    <div className="app" dir="rtl">
      <Navbar />
      <main>
        <HeroSection />
        <MapPreviewSection />
        <DirectorySection />
        <AboutSection />
      </main>
      <ContactSection />
    </div>
  );
}

export default App;

