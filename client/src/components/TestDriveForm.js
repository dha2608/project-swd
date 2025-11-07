import React, { useState } from 'react';
import { createTestDrive } from '../services/api';

function TestDriveForm() {
    // Quản lý trạng thái của form
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        schedule: '',
    });
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsError(false);

        // Yêu cầu 3: "Chỉ xây dựng chức năng 1c"
        // Vì vậy, chúng ta sẽ "giả lập" (mock) ID của xe (từ 1.a)
        const dataToSubmit = {
            ...formData,
            vehicleId: 'MOCK_VEHICLE_ID_60d0fe4f531123', // ID giả lập
            schedule: new Date(formData.schedule).toISOString(),
        };

        try {
            // (Msg 2) Gửi request đến Controller
            const response = await createTestDrive(dataToSubmit);
            
            // (Msg 12) Hiển thị thành công
            setMessage(`Tạo lịch hẹn thành công! ID: ${response.data._id}`);
            setFormData({ customerName: '', customerPhone: '', schedule: '' });
        } catch (error) {
            setMessage(`Lỗi: ${error.response?.data?.message || error.message}`);
            setIsError(true);
        }
    };

    return (
        <div className="form-card">
            <h2>(1.c.2) Đặt lịch hẹn Lái thử</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="customerName">Tên khách hàng</label>
                    <input type="text" id="customerName" name="customerName"
                        value={formData.customerName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="customerPhone">Số điện thoại</label>
                    <input type="tel" id="customerPhone" name="customerPhone"
                        value={formData.customerPhone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="schedule">Ngày giờ hẹn</label>
                    <input type="datetime-local" id="schedule" name="schedule"
                        value={formData.schedule} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn-submit">Đặt lịch</button>
            </form>
            {message && (
                <div className={`message ${isError ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default TestDriveForm;