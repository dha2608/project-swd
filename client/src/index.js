import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // <-- IMPORT

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* BỌC TOÀN BỘ APP TRONG AUTHPROVIDER */}
    {/* Điều này cho phép mọi component con (như App) dùng hook "useAuth()" */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);