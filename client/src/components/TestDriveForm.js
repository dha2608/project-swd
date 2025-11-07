import React, { useState } from 'react';
import { createTestDrive } from '../services/api';

function TestDriveForm() {
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

 
        const dataToSubmit = {
            ...formData,

            vehicleId: '60d0fe4f5311236168a109cb', 
            schedule: new Date(formData.schedule).toISOString(),
        };

        try {

            const response = await createTestDrive(dataToSubmit);

            setMessage(`Tạo lịch hẹn thành công! ID: ${response.data._id}`);
            setFormData({ customerName: '', customerPhone: '', schedule: '' });
        } catch (error) {
            setMessage(`Lỗi: ${error.response?.data?.message || error.message}`);
            setIsError(true);
        }
    };

    return (
        <div className="form-card">
            <h2>Đặt lịch hẹn Lái thử</h2>
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