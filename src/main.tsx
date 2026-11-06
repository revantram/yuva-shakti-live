import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

function renderApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return false;

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    return true;
  } catch (err) {
    console.error('Failed to render React app:', err);
    rootElement.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;text-align:center;font-family:sans-serif;background:#f8fafc;color:#0f172a;">
        <div style="font-size:40px;margin-bottom:12px;">🚩</div>
        <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;">युवा शक्ति ग्रुप (भाटी परिवार)</h2>
        <p style="font-size:14px;color:#64748b;margin-bottom:16px;">ऐप लोड हो रहा है... कृपया प्रतीक्षा करें।</p>
        <button onclick="window.location.reload()" style="background:#f97316;color:white;border:none;padding:8px 18px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;">पुनः लोड करें</button>
      </div>
    `;
    return false;
  }
}

if (!renderApp()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderApp());
  } else {
    setTimeout(renderApp, 50);
  }
}

