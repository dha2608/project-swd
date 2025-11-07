import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api'; // (Chúng ta sẽ cập nhật file này ở bước 10)

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider (Component "bọc" toàn bộ App)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Trạng thái chờ

    // 3. Kiểm tra xem user đã đăng nhập chưa (khi tải lại trang)
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedInfo = JSON.parse(userInfo);
            setUser(parsedInfo);
            // Cấu hình header mặc định cho apiClient
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${parsedInfo.token}`;
        }
        setLoading(false);
    }, []);

    // 4. Hàm Login
    const login = async (email, password) => {
        try {
            // Gọi API /api/auth/login
            const { data } = await apiClient.post('/auth/login', { email, password });
            
            // Lưu thông tin user vào localStorage
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            // Cấu hình header cho các request sau
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            // Cập nhật state
            setUser(data);
            return true;
        } catch (error) {
            throw error; // Ném lỗi để LoginPage có thể bắt
        }
    };

    // 5. Hàm Logout
    const logout = () => {
        localStorage.removeItem('userInfo');
        delete apiClient.defaults.headers.common['Authorization'];
        setUser(null);
    };

    // 6. Cung cấp state và hàm cho các component con
    const value = {
        user,
        loading,
        login,
        logout,
    };

    // Chỉ render con khi đã kiểm tra xong (tránh lỗi)
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 7. Tạo custom Hook (để dễ sử dụng)
export const useAuth = () => {
    return useContext(AuthContext);
};