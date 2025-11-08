import React, { useState, useEffect } from 'react';
import { bookTestDrive, getAvailableVehicles, getVehicles, getVehicleById, getCustomers, getBookedSlots } from '../services/api';
import { FiCalendar, FiUser, FiPhone, FiTruck, FiEdit2 } from 'react-icons/fi';

const TestDriveForm = ({ vehicleId, customerId }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        schedule: '',
        notes: '',
        vehicleId: '',
    });
    const [errors, setErrors] = useState({ customerName: '', customerPhone: '', schedule: '', vehicleId: '' });
    const [vehicles, setVehicles] = useState([]);
    const [vehicleLoadingError, setVehicleLoadingError] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [forceNewCustomer, setForceNewCustomer] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(''); // YYYY-MM-DD
    const [selectedHour, setSelectedHour] = useState(''); // 'HH'

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
                // Không tự động chọn xe đầu tiên; buộc người dùng chọn thủ công
            } catch (error) {
                setVehicleLoadingError('Lỗi: Không thể tải danh sách xe.');
            }
        };
        fetchVehicles();
    }, [vehicleId]);

    // Không tự động gán vehicleId từ props; buộc người dùng chọn thủ công

    const getMinDate = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const BUSINESS_START = 8;
    const BUSINESS_END = 18; // exclusive
    const HOURS = Array.from({ length: BUSINESS_END - BUSINESS_START }, (_, i) => String(BUSINESS_START + i).padStart(2, '0'));

    const toLocalDateString = (isoLike) => {
        if (!isoLike) return '';
        const d = new Date(isoLike);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const normalizePhoneDigits = (input) => (input || '').replace(/\D/g, '').slice(0, 11);
    const isValidVietnamPhone = (digits) => /^0\d{9,10}$/.test(digits);
    const isValidName = (name) => !!(name && name.trim().length >= 2);
    const checkScheduleConstraints = (dateStr, hourStr) => {
        if (!dateStr || !hourStr) return { valid: false, message: 'Vui lòng chọn ngày và khung giờ hẹn.' };
        const [year, month, day] = dateStr.split('-').map(Number);
        const hours = Number(hourStr);
        const d = new Date(year, month - 1, day, hours, 0, 0, 0);
        const now = new Date();
        // Không cho phép đặt trong cùng ngày, yêu cầu ít nhất ngày hôm sau
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const startOfSelected = new Date(year, month - 1, day, 0, 0, 0, 0);
        if (startOfSelected.getTime() === startOfToday.getTime()) {
            return { valid: false, message: 'Đăng ký lái thử trước ít nhất 1 ngày (lái thử vào ngày hôm sau).' };
        }
        if (d <= now) return { valid: false, message: 'Ngày giờ hẹn phải sau thời điểm hiện tại.' };
        if (hours < BUSINESS_START || hours >= BUSINESS_END) {
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
        // bỏ xử lý trực tiếp schedule - dùng chọn ngày + giờ
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Tải khung giờ đã đặt khi chọn xe hoặc đổi ngày
    useEffect(() => {
        const loadSlots = async () => {
            const vId = formData.vehicleId;
            const dateStr = selectedDate;
            if (!vId || !dateStr) {
                setBookedSlots([]);
                return;
            }
            setSlotsLoading(true);
            try {
                const res = await getBookedSlots(vId, dateStr);
                const slots = res?.data?.data?.slots || [];
                setBookedSlots(slots);
            } catch (_) {
                setBookedSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };
        loadSlots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.vehicleId, selectedDate]);

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

        const scheduleCheck = checkScheduleConstraints(selectedDate, selectedHour);
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

        const [Y, M, D] = selectedDate.split('-').map(Number);
        const H = Number(selectedHour);
        const composedDate = new Date(Y, M - 1, D, H, 0, 0, 0);
        const dataToSubmit = {
            schedule: composedDate.toISOString(),
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
                            <option value="" disabled>— Chọn xe lái thử trước —</option>
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
                    <label>Ngày giờ hẹn</label>
                    <div className="form-group-icon">
                        <FiCalendar />
                        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setSelectedDate(v);
                                    const check = checkScheduleConstraints(v, selectedHour);
                                    setErrors(prev => ({ ...prev, schedule: check.valid ? '' : check.message }));
                                    // cập nhật schedule nếu có đủ ngày + giờ
                                    if (v && selectedHour) {
                                        const H = String(Number(selectedHour)).padStart(2, '0');
                                        setFormData(prev => ({ ...prev, schedule: `${v}T${H}:00` }));
                                    } else {
                                        setFormData(prev => ({ ...prev, schedule: '' }));
                                    }
                                }}
                                min={getMinDate()}
                                required
                                style={{ flex: 1 }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                    {HOURS.map(hh => {
                                        const label = `${hh}:00`;
                                        const isBooked = bookedSlots.includes(label);
                                        const isPast = (() => {
                                            if (!selectedDate) return false;
                                            const [Y, M, D] = selectedDate.split('-').map(Number);
                                            const slotDate = new Date(Y, M - 1, D, Number(hh), 0, 0, 0);
                                            return slotDate <= new Date();
                                        })();
                                        const disabled = isBooked || isPast;
                                        const active = selectedHour === hh;
                                        return (
                                            <button
                                                key={hh}
                                                type="button"
                                                onClick={() => {
                                                    if (disabled) return;
                                                    setSelectedHour(hh);
                                                    const check = checkScheduleConstraints(selectedDate, hh);
                                                    setErrors(prev => ({ ...prev, schedule: check.valid ? '' : check.message }));
                                                    if (selectedDate) {
                                                        const H = String(Number(hh)).padStart(2, '0');
                                                        setFormData(prev => ({ ...prev, schedule: `${selectedDate}T${H}:00` }));
                                                    }
                                                }}
                                                className="slot-button"
                                                disabled={disabled}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #ced4da',
                                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                                    background: isBooked ? '#fdeaea' : active ? '#007aff' : '#ffffff',
                                                    color: active ? '#ffffff' : '#333'
                                                }}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
                                    Màu đỏ: khung giờ đã có người đặt. Chỉ đặt đầu giờ, thời lượng 1 giờ.
                                </small>
                            </div>
                        </div>
                    </div>
                    {errors.schedule && <small className="message error">{errors.schedule}</small>}
                    <div style={{ marginTop: '0.75rem' }}>
                        {slotsLoading ? (
                            <small>Đang tải khung giờ đã đặt...</small>
                        ) : bookedSlots.length > 0 ? (
                            <small style={{ display: 'block', textAlign: 'left', color: '#555' }}>
                                Khung giờ đã đặt: {bookedSlots.join(', ')}
                            </small>
                        ) : (
                            <small style={{ color: '#666' }}>Chưa có khung giờ nào bị chiếm trong ngày.</small>
                        )}
                    </div>
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