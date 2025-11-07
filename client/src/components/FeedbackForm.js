import React, { useState } from 'react';
import { createFeedback } from '../services/api';

function FeedbackForm() {
    const [formData, setFormData] = useState({
        content: '',
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
        // Chúng ta "giả lập" ID của khách hàng
        const dataToSubmit = {
            ...formData,
            // SỬA LỖI: Thay chuỗi text bằng một chuỗi 24-ký-tự-hex
            customerId: '60d0fe4f5311236168a109cc', // ID giả lập (đúng định dạng)
        };

        try {
            const response = await createFeedback(dataToSubmit);
            setMessage(`Ghi nhận khiếu nại thành công! ID: ${response.data._id}`);
            setFormData({ content: '' });
        } catch (error) {
            setMessage(`Lỗi: ${error.response?.data?.message || error.message}`);
            setIsError(true);
        }
    };

    return (
        <div className="form-card">
            <h2>(1.c.3) Ghi nhận Khiếu nại</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="content">Nội dung khiếu nại</label>
                    <textarea id="content" name="content"
                        value={formData.content} onChange={handleChange} required
                        placeholder="Mô tả vấn đề của khách hàng..."
                    />
                </div>
                <button type="submit" className="btn-submit">Gửi Khiếu nại</button>
            </form>
            {message && (
                <div className={`message ${isError ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default FeedbackForm;