import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App runtime error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#0a1230',
          color: '#f7f0dc',
          fontFamily: 'Cairo, sans-serif',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#d8b45c', marginBottom: '12px' }}>كنيسة الشهيد مارمرقس مصر الجديدة — أسرة أنبياء (فصل أليشع)</h2>
          <p style={{ maxWidth: '480px', fontSize: '14px', color: '#c9c2a6', marginBottom: '20px' }}>
            حدث خطأ غير متوقع أثناء تحميل الصفحة. يرجى الضغط على زر إعادة التحميل.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              backgroundColor: '#d8b45c',
              color: '#0a1230',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            إعادة تحميل التطبيق (Reload)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
