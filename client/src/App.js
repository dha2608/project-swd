import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // Component bảo vệ
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CrmPage from './pages/CrmPage';
import './App.css'; // Import CSS đã nâng cấp

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Mặc định: Chuyển đến Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Route Công khai */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* --- Các Route được Bảo vệ --- */}
        {/* (Phải đăng nhập mới vào được) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/crm" element={<CrmPage />} />
          {/* Thêm các route được bảo vệ khác ở đây (VD: /sales, /inventory) */}
        </Route>
        
        {/* (Tùy chọn: Thêm trang 404) */}
        <Route path="*" element={
          <div>
            <h2>Trang không tồn tại (404)</h2>
            <Link to="/">Quay về trang chủ</Link>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;