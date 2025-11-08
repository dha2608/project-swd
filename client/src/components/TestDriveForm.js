import React, { useState, useEffect } from 'react';
import { bookTestDrive, getAvailableVehicles, getVehicles, getVehicleById, getCustomers } from '../services/api';
import { FiCalendar, FiUser, FiPhone, FiTruck, FiEdit2 } from 'react-icons/fi';

const TestDriveForm = ({ vehicleId, customerId }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        schedule: '',
        notes: '',
        vehicleId: vehicleId || '',
    });
    const [errors, setErrors] = useState({ customerName: '', customerPhone: '', schedule: '', vehicleId: '' });
    const [vehicles, setVehicles] = useState([]);
    const [vehicleLoadingError, setVehicleLoadingError] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [forceNewCustomer, setForceNewCustomer] = useState(false);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setVehicleLoadingError('');
                let vehiclesData = [];
                try {
                    const availableRes = await getAvailableVehicles();
                    vehiclesData = availableRes.data.data || [];
                    if (!vehiclesData || vehiclesData.length === 0) {
                        const allVehiclesRes = await getVehicles();
                        vehiclesData = allVehiclesRes.data.data || [];
                    }
                } catch (vehErr) {
                }
                setVehicles(vehiclesData);
                if (!vehicleId && vehiclesData.length > 0) {
                    setFormData(prev => ({ ...prev, vehicleId: vehiclesData[0]._id }));
                }
            } catch (error) {
                setVehicleLoadingError('Lỗi: Không thể tải danh sách xe.');
            }
        };
        fetchVehicles();
    }, [vehicleId]);

    useEffect(() => {
        if (vehicleId) {
            setFormData(prev => ({ ...prev, vehicleId }));
        }
    }, [vehicleId]);

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 15);
        return now.toISOString().slice(0, 16);
    };

    const normalizePhoneDigits = (input) => (input || '').replace(/\D/g, '').slice(0, 11);
    const isValidVietnamPhone = (digits) => /^0\d{9,10}$/.test(digits);
    const isValidName = (name) => !!(name && name.trim().length >= 2);
    const checkScheduleConstraints = (isoLike) => {
        if (!isoLike) return { valid: false, message: 'Vui lòng chọn ngày giờ hẹn.' };
        const d = new Date(isoLike);
        const now = new Date();
        if (d <= now) return { valid: false, message: 'Ngày giờ hẹn phải sau thời điểm hiện tại.' };
        const day = d.getDay(); // 0: Sunday
        if (day === 0) return { valid: false, message: 'Không nhận lịch hẹn vào Chủ nhật.' };
        const minutes = d.getHours() * 60 + d.getMinutes();
        if (minutes < 8 * 60 || minutes > 18 * 60) {
            return { valid: false, message: 'Thời gian hẹn phải trong khung giờ 08:00–18:00.' };
        }
        return { valid: true };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'customerPhone') {
            const digits = normalizePhoneDigits(value);
            setFormData(prev => ({ ...prev, customerPhone: digits }));
            if (digits && !isValidVietnamPhone(digits)) {
                setErrors(prev => ({ ...prev, customerPhone: 'Số điện thoại phải bắt đầu bằng 0 và dài 10–11 số.' }));
            } else {
                setErrors(prev => ({ ...prev, customerPhone: '' }));
            }
            return;
        }
        if (name === 'customerName') {
            setFormData(prev => ({ ...prev, customerName: value }));
            if (value && !isValidName(value)) {
                setErrors(prev => ({ ...prev, customerName: 'Tên phải có ít nhất 2 ký tự.' }));
            } else {
                setErrors(prev => ({ ...prev, customerName: '' }));
            }
            return;
        }
        if (name === 'schedule') {
            setFormData(prev => ({ ...prev, schedule: value }));
            const check = checkScheduleConstraints(value);
            setErrors(prev => ({ ...prev, schedule: check.valid ? '' : check.message }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification({ message: '', type: '' });
        let forceNewCustomerLocal = false; // cờ cục bộ để quyết định dữ liệu gửi

        if (!formData.vehicleId) {
            setNotification({ message: 'Lỗi: Vui lòng chọn xe để đăng ký lái thử.', type: 'error' });
            setLoading(false);
            return;
        }

        const localVehicleExists = vehicles && vehicles.length > 0 && vehicles.some(v => v._id === formData.vehicleId);
        if (!localVehicleExists) {
            let msg = 'Xe không tồn tại hoặc không khả dụng. Vui lòng chọn lại từ danh sách xe khả dụng.';
            try {
                const res = await getVehicleById(formData.vehicleId);
                const veh = res?.data?.data;
                if (veh && veh.status && veh.status !== 'AVAILABLE') {
                    msg = 'Xe hiện không có sẵn để đặt lịch lái thử.';
                } else if (veh) {
                    msg = 'Xe không thuộc quyền quản lý của bạn hoặc không nằm trong danh sách khả dụng.';
                }
            } catch (vehErr) {
                msg = vehErr?.response?.data?.message || msg;
            }

            setErrors(prev => ({ ...prev, vehicleId: msg }));
            setNotification({ message: `Lỗi: ${msg}`, type: 'error' });

            try {
                const availableRes = await getAvailableVehicles();
                let vehiclesData = availableRes.data.data || [];
                if (!vehiclesData || vehiclesData.length === 0) {
                    const allVehiclesRes = await getVehicles();
                    vehiclesData = allVehiclesRes.data.data || [];
                }
                setVehicles(vehiclesData);
                if (vehiclesData.length > 0) {
                    setFormData(prev => ({ ...prev, vehicleId: vehiclesData[0]._id }));
                } else {
                    setFormData(prev => ({ ...prev, vehicleId: '' }));
                }
            } catch (_) {
            }
            setLoading(false);
            return;
        }

        try {
            await getVehicleById(formData.vehicleId);
        } catch (vehError) {
            const msg = vehError.response?.data?.message || 'Xe không tồn tại hoặc bạn không có quyền truy cập.';
            setErrors(prev => ({ ...prev, vehicleId: msg }));
            setNotification({ message: `Lỗi: ${msg}`, type: 'error' });
            try {
                const availableRes = await getAvailableVehicles();
                let vehiclesData = availableRes.data.data || [];
                if (!vehiclesData || vehiclesData.length === 0) {
                    const allVehiclesRes = await getVehicles();
                    vehiclesData = allVehiclesRes.data.data || [];
                }
                setVehicles(vehiclesData);
                if (vehiclesData.length > 0) {
                    setFormData(prev => ({ ...prev, vehicleId: vehiclesData[0]._id }));
                } else {
                    setFormData(prev => ({ ...prev, vehicleId: '' }));
                }
            } catch (_) {
            }
            setLoading(false);
            return;
        }

        if (customerId && !forceNewCustomer) {
            try {
                const res = await getCustomers();
                const customers = res.data.data || [];
                const exists = customers.some(c => c._id === customerId);
                if (!exists) {
                    forceNewCustomerLocal = true;
                    setForceNewCustomer(true);
                }
            } catch (_) {
                forceNewCustomerLocal = true;
                setForceNewCustomer(true);
            }
        }

        const scheduleCheck = checkScheduleConstraints(formData.schedule);
        if (!scheduleCheck.valid) {
            setErrors(prev => ({ ...prev, schedule: scheduleCheck.message }));
            setNotification({ message: scheduleCheck.message, type: 'error' });
            setLoading(false);
            return;
        }

        const willCreateNewCustomer = !customerId || forceNewCustomer || forceNewCustomerLocal;
        if (willCreateNewCustomer) {
            if (!isValidName(formData.customerName)) {
                setErrors(prev => ({ ...prev, customerName: 'Tên phải có ít nhất 2 ký tự.' }));
                setNotification({ message: 'Vui lòng nhập tên hợp lệ (≥ 2 ký tự).', type: 'error' });
                setLoading(false);
                return;
            }
            const phoneDigits = normalizePhoneDigits(formData.customerPhone);
            if (!isValidVietnamPhone(phoneDigits)) {
                setFormData(prev => ({ ...prev, customerPhone: phoneDigits }));
                setErrors(prev => ({ ...prev, customerPhone: 'Số điện thoại phải bắt đầu bằng 0 và dài 10–11 số.' }));
                setNotification({ message: 'Vui lòng nhập SĐT hợp lệ (0 + 9–10 số).', type: 'error' });
                setLoading(false);
                return;
            }
        }

        const dataToSubmit = {
            schedule: new Date(formData.schedule).toISOString(),
            notes: formData.notes,
            vehicleId: formData.vehicleId,
        };

        if (!willCreateNewCustomer && customerId) {
            dataToSubmit.customerId = customerId;
        } else {
            dataToSubmit.customerName = formData.customerName.trim();
            dataToSubmit.customerPhone = normalizePhoneDigits(formData.customerPhone);
        }

        try {
            const response = await bookTestDrive(dataToSubmit);
            setNotification({
                message: `Tạo lịch hẹn thành công! ID: ${response.data.data._id}`,
                type: 'success'
            });
            setFormData({
                customerName: '',
                customerPhone: '',
                schedule: '',
                notes: '',
                vehicleId: vehicleId || (vehicles.length > 0 ? vehicles[0]._id : ''),
            });
        } catch (error) {
            const apiMessage = error.response?.data?.message || error.message;
            const apiErrors = error.response?.data?.errors;

            if (Array.isArray(apiErrors) && apiErrors.length > 0) {
                const mapped = { ...errors };
                apiErrors.forEach(({ field, message }) => {
                    if (field && typeof field === 'string') {
                        if (field === 'customerName') mapped.customerName = message;
                        if (field === 'customerPhone') mapped.customerPhone = message;
                        if (field === 'schedule') mapped.schedule = message;
                        if (field === 'vehicleId') mapped.vehicleId = message;
                        if (field === 'customerId') {
                            setNotification({ message: `Lỗi: ${message}`, type: 'error' });
                        }
                        if (field === 'notes') {
                            setNotification({ message: `Lỗi: ${message}`, type: 'error' });
                        }
                    }
                });
                setErrors(mapped);
            }

            setNotification({
                message: `Lỗi: ${apiMessage}`,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-card">
            <h2>Đặt lịch hẹn Lái thử</h2>
            <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-group grid-span-2">
                    <label htmlFor="vehicle">Chọn xe lái thử</label>
                    <div className="form-group-icon">
                        <FiTruck />
                        <select
                            id="vehicle"
                            name="vehicleId"
                            value={formData.vehicleId}
                            onChange={handleChange}
                            required
                            disabled={vehicles.length === 0 || vehicleLoadingError}
                        >
                            <option value="" disabled>-- Vui lòng chọn xe --</option>
                            {vehicles.map(v => (
                                <option key={v._id} value={v._id}>
                                    {v.brand} {v.model}
                                </option>
                            ))}
                        </select>
                    </div>
                    {vehicleLoadingError && <small className="message error">{vehicleLoadingError}</small>}
                    {errors.vehicleId && <small className="message error">{errors.vehicleId}</small>}
                    {vehicles.length === 0 && !vehicleLoadingError && (
                        <small className="message error">
                            Không có xe khả dụng. Vui lòng thêm xe trong module quản lý xe.
                        </small>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="customerName">Tên khách hàng {(!customerId || forceNewCustomer) && (<span className="required-star">*</span>)}</label>
                    <div className="form-group-icon">
                        <FiUser />
                        <input
                            type="text"
                            id="customerName"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            required={!customerId || forceNewCustomer}
                        />
                    </div>
                    {errors.customerName && <small className="message error">{errors.customerName}</small>}
                </div>
                <div className="form-group">
                    <label htmlFor="customerPhone">Số điện thoại {(!customerId || forceNewCustomer) && (<span className="required-star">*</span>)}</label>
                    <div className="form-group-icon">
                        <FiPhone />
                        <input
                            type="tel"
                            id="customerPhone"
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleChange}
                            inputMode="numeric"
                            pattern="0\d{9,10}"
                            required={!customerId || forceNewCustomer}
                        />
                    </div>
                    {errors.customerPhone && <small className="message error">{errors.customerPhone}</small>}
                </div>
                
                <div className="form-group grid-span-2">
                    <label htmlFor="schedule">Ngày giờ hẹn</label>
                    <div className="form-group-icon">
                        <FiCalendar />
                        <input
                            type="datetime-local"
                            id="schedule"
                            name="schedule"
                            value={formData.schedule}
                            onChange={handleChange}
                            min={getMinDateTime()}
                            required
                        />
                    </div>
                    {errors.schedule && <small className="message error">{errors.schedule}</small>}
                </div>
                
                <div className="form-group grid-span-2">
                    <label htmlFor="notes">Ghi chú</label>
                    <div className="form-group-icon">
                        <FiEdit2 />
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                </div>
                
                <button type="submit" className="btn-submit grid-span-2" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Xác nhận Lịch hẹn'}
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

export default TestDriveForm;