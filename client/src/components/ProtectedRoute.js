import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useAuth(); // Lấy thông tin user từ Context

    if (!user) {
        // Nếu user chưa đăng nhập, điều hướng về trang /login
        // 'replace' để người dùng không thể "back" lại trang cũ
        return <Navigate to="/login" replace />;
    }

    // Nếu đã đăng nhập, cho phép hiển thị trang (Dashboard, CRM...)
    return <Outlet />;
};

export default ProtectedRoute;