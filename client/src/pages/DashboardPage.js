import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <div>
            <h1>Chào mừng, {user?.name || 'User'}!</h1>
            <p>Email: {user?.email}</p>
            <p>Vai trò: {user?.role}</p>
            
            <button 
                onClick={logout} 
                style={{ background: '#dc3545', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                Đăng xuất
            </button>
            
            <hr style={{margin: '20px 0'}} />

            <h2>Chọn chức năng:</h2>
            <nav>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '15px' }}>
                        {/* Link đến trang CRM */}
                        <Link to="/crm" style={{ textDecoration: 'none' }}>
                            <div className="form-card" style={{width: '300px', textAlign: 'center', animationDelay: '0.1s'}}>
                                <h2>Demo Module 1.c: CRM</h2>
                                <p>(Quản lý Lịch hẹn & Khiếu nại)</p>
                            </div>
                        </Link>
                    </li>
                    {/* Thêm các link khác cho các module (1.b, 2.a...) ở đây */}
                </ul>
            </nav>
        </div>
    );
}

export default DashboardPage;