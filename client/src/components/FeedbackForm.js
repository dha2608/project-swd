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

        const dataToSubmit = {
            ...formData,
            customerId: '60d0fe4f5311236168a109cc', 
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
            <h2>Ghi nhận Khiếu nại</h2>
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