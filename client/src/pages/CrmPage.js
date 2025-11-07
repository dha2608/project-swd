import React from 'react';
import { Link } from 'react-router-dom';
import TestDriveForm from '../components/TestDriveForm';
import FeedbackForm from '../components/FeedbackForm';
import { useAuth } from '../context/AuthContext';

function CrmPage() {
    const { user } = useAuth();

    return (
        <div>
            <Link to="/dashboard" style={{ fontWeight: 'bold' }}> (Quay lại Dashboard)</Link>
            <h1>Module 1.c: Quản lý Khách hàng (CRM)</h1>
            <p>Nhân viên đang demo: <strong>{user.name} ({user.role})</strong></p>

            <div className="container">
                {/* Chúng ta truyền user data xuống các form 
                  để biết ai là người đang tạo (hoặc có thể không cần nếu 
                  backend tự lấy user từ token)
                */}
                <TestDriveForm />
                <FeedbackForm />
            </div>
        </div>
    );
}

export default CrmPage;