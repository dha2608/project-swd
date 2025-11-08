import React, { useState } from 'react';
import { submitFeedback } from '../services/api';

const FeedbackForm = ({ customerId }) => {
    const [formData, setFormData] = useState({
        subject: '',
        content: '',
        type: 'COMPLAINT',
        customerName: '',
        customerPhone: '',
    });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ customerName: '', customerPhone: '', subject: '', content: '' });

    const normalizePhoneDigits = (input) => (input || '').replace(/\D+/g, '').slice(0, 11);
    const isValidVietnamPhone = (digits) => /^0\d{9,10}$/.test(digits);
    const isValidName = (name) => !!(name && name.trim().length >= 2);
    const isValidSubject = (s) => !!(s && s.trim().length >= 3);
    const isValidContent = (c) => !!(c && c.trim().length >= 10);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'customerPhone') {
            const digits = normalizePhoneDigits(value);
            setFormData(prev => ({ ...prev, customerPhone: digits }));
            setErrors(prev => ({ ...prev, customerPhone: digits && !isValidVietnamPhone(digits) ? 'SĐT phải bắt đầu bằng 0, dài 10–11 số.' : '' }));
            return;
        }
        if (name === 'customerName') {
            setFormData(prev => ({ ...prev, customerName: value }));
            setErrors(prev => ({ ...prev, customerName: value && !isValidName(value) ? 'Tên tối thiểu 2 ký tự.' : '' }));
            return;
        }
        if (name === 'subject') {
            setFormData(prev => ({ ...prev, subject: value }));
            setErrors(prev => ({ ...prev, subject: value && !isValidSubject(value) ? 'Chủ đề tối thiểu 3 ký tự.' : '' }));
            return;
        }
        if (name === 'content') {
            setFormData(prev => ({ ...prev, content: value }));
            setErrors(prev => ({ ...prev, content: value && !isValidContent(value) ? 'Nội dung tối thiểu 10 ký tự.' : '' }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification({ message: '', type: '' });

        const dataToSubmit = {
            content: formData.subject
                ? `[Chủ đề] ${formData.subject}\n\n${formData.content}`
                : formData.content,
            type: formData.type,
        };

        if (!isValidName(formData.customerName)) {
            setErrors(prev => ({ ...prev, customerName: 'Tên tối thiểu 2 ký tự.' }));
            setNotification({ message: 'Vui lòng nhập tên hợp lệ (≥ 2 ký tự).', type: 'error' });
            setLoading(false);
            return;
        }
        const phoneNormalized = normalizePhoneDigits(formData.customerPhone);
        if (!isValidVietnamPhone(phoneNormalized)) {
            setErrors(prev => ({ ...prev, customerPhone: 'SĐT phải bắt đầu bằng 0, dài 10–11 số.' }));
            setNotification({ message: 'Vui lòng nhập SĐT hợp lệ (0 + 9–10 số).', type: 'error' });
            setLoading(false);
            return;
        }
        if (!isValidSubject(formData.subject)) {
            setErrors(prev => ({ ...prev, subject: 'Chủ đề tối thiểu 3 ký tự.' }));
            setNotification({ message: 'Vui lòng nhập chủ đề tối thiểu 3 ký tự.', type: 'error' });
            setLoading(false);
            return;
        }
        if (!isValidContent(formData.content)) {
            setErrors(prev => ({ ...prev, content: 'Nội dung tối thiểu 10 ký tự.' }));
            setNotification({ message: 'Vui lòng nhập nội dung tối thiểu 10 ký tự.', type: 'error' });
            setLoading(false);
            return;
        }

        if (customerId) {
            dataToSubmit.customerId = customerId;
        }
        dataToSubmit.customerName = formData.customerName.trim();
        dataToSubmit.customerPhone = phoneNormalized;

        try {
            const response = await submitFeedback(dataToSubmit);
            const typeLabel = formData.type === 'COMPLAINT' ? 'khiếu nại' : 'phản hồi';
            setNotification({
                message: `Gửi ${typeLabel} thành công! (ID: ${response.data.data._id})`,
                type: 'success'
            });
            setFormData(prev => ({
                subject: '',
                content: '',
                type: prev.type,
                customerName: prev.customerName ?? '',
                customerPhone: prev.customerPhone ?? '',
            }));
        } catch (error) {
            const serverMessage = error.response?.data?.message || error.message;
            const serverErrors = error.response?.data?.errors;

            if (Array.isArray(serverErrors) && serverErrors.length) {
                const nextErrors = { customerName: '', customerPhone: '', subject: '', content: '' };
                serverErrors.forEach(({ field, message }) => {
                    if (!field || !message) return;
                    if (field === 'customerName') nextErrors.customerName = message;
                    if (field === 'customerPhone') nextErrors.customerPhone = message;
                    if (field === 'subject') nextErrors.subject = message;
                    if (field === 'content') nextErrors.content = message;
                });
                setErrors(prev => ({ ...prev, ...nextErrors }));
            }

            setNotification({
                message: `Lỗi: ${serverMessage}`,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-card">
            <h2>Ghi nhận Phản hồi & Khiếu nại</h2>
            <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
                <label htmlFor="type">Phân loại</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange}>
                    <option value="COMPLAINT">Khiếu nại</option>
                    <option value="FEEDBACK">Phản hồi</option>
                    <option value="GENERAL">Khác</option>
                </select>
            </div>
            <div className="form-subsection grid-span-2">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="customerName">Tên khách hàng</label>
                        <input
                            id="customerName"
                            name="customerName"
                            type="text"
                            value={formData.customerName}
                            onChange={handleChange}
                            minLength={2}
                            maxLength={50}
                            required
                        />
                        {errors.customerName && <small className="message error">{errors.customerName}</small>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="customerPhone">Số điện thoại</label>
                        <input
                            id="customerPhone"
                            name="customerPhone"
                            type="tel"
                            value={formData.customerPhone}
                            onChange={handleChange}
                            required
                            inputMode="numeric"
                            pattern="0\d{9,10}"
                        />
                        {errors.customerPhone && <small className="message error">{errors.customerPhone}</small>}
                    </div>
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="subject">Chủ đề</label>
                <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    minLength={3}
                />
                {errors.subject && <small className="message error">{errors.subject}</small>}
            </div>
            <div className="form-group grid-span-2">
                <label htmlFor="content">Nội dung chi tiết</label>
                <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    minLength={10}
                    rows={5}
                />
                {errors.content && <small className="message error">{errors.content}</small>}
            </div>
                <button type="submit" className="btn-submit grid-span-2" disabled={loading}>
                    {loading ? 'Đang gửi...' : 'Gửi'}
                </button>
            </form>
            {notification.message && (
                <div className={`message ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}

export default FeedbackForm;