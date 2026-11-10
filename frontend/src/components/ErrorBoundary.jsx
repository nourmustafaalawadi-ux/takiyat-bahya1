import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F8F4EE',
            fontFamily: 'Cairo, Tahoma, sans-serif',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #EAE1D7',
              padding: '40px 30px',
              maxWidth: '480px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>🍲</div>
            <h2 style={{ color: '#992B2B', margin: '0 0 10px', fontSize: '22px' }}>
              تكية بهية | أمل وسط الركام
            </h2>
            <p style={{ color: '#514A44', fontSize: '15px', lineHeight: '1.8', margin: '0 0 20px' }}>
              حدث خطأ غير متوقع أثناء عرض الصفحة. لا تقلق، كافة البيانات محفوظة.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#992B2B',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '10px',
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
