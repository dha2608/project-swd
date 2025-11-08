import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TestDriveForm from '../components/TestDriveForm';
import FeedbackForm from '../components/FeedbackForm';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiMessageSquare, FiUserCheck, FiBarChart2 } from 'react-icons/fi';
import { getTestDrives, getFeedback, getCrmStatistics, getAvailableVehicles, getCustomers, getVehicles } from '../services/api';

const CrmPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('testDrive');
    
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [isNewCustomer, setIsNewCustomer] = useState(false);

    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [testDrives, setTestDrives] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [testDrivesRes, feedbackRes, statsRes, customersRes] = await Promise.all([
                    getTestDrives(),
                    getFeedback(),
                    getCrmStatistics(),
                    getCustomers(),
                ]);
                setTestDrives(testDrivesRes.data.data);
                setFeedback(feedbackRes.data.data);
                setStatistics(statsRes.data.data);
                setCustomers(customersRes.data.data);

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

                if (customersRes.data.data.length > 0 && !isNewCustomer) {
                    setSelectedCustomerId(customersRes.data.data[0]._id);
                } else if (customersRes.data.data.length === 0) {
                    setIsNewCustomer(true);
                    setSelectedCustomerId('');
                }
                if (vehiclesData.length > 0) {
                    setSelectedVehicleId(vehiclesData[0]._id);
                }

            } catch (err) {
                setError('Không thể tải dữ liệu CRM');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const TabButton = ({ tabId, label, icon }) => (
        <button
            className={`tab-button ${activeTab === tabId ? 'active' : ''}`}
            onClick={() => setActiveTab(tabId)}
        >
            {icon}
            <span>{label}</span>
            {activeTab === tabId && (
                <motion.div
                    className="active-tab-indicator"
                    layoutId="activeCrmTab"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}
        </button>
    );

    const motionVariants = {
        initial: { opacity: 0, y: 25 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
        exit: { opacity: 0, y: -25, transition: { duration: 0.3, ease: 'easeOut' } }
    };

    return (
        <motion.div
            className="crm-page-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
        >
            <header className="crm-header">
                <div className="header-left">
                    <motion.div whileHover={{ x: -4 }}>
                        <Link to="/dashboard" className="back-link">
                            &larr; Dashboard
                        </Link>
                    </motion.div>
                    <h1>Module CRM</h1>
                    <p>Quản lý tương tác và lịch hẹn khách hàng</p>
                </div>
                <div className="header-right">
                    <div className="user-info-badge">
                        <FiUserCheck />
                        <span>{user.name} ({user.role})</span>
                    </div>
                </div>
            </header>

            <nav className="tab-navigation">
                <TabButton tabId="stats" label="Thống kê" icon={<FiBarChart2 />} />
                <TabButton tabId="testDrive" label="Lịch hẹn Lái thử" icon={<FiCalendar />} />
                <TabButton tabId="feedback" label="Phản hồi & Khiếu nại" icon={<FiMessageSquare />} />
            </nav>

            <main className="tab-content-container">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={motionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="tab-content"
                    >
                        {activeTab === 'stats' && (
                            <section>
                                {loading ? <p>Đang tải...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : statistics ? (
                                    <ul>
                                        <li>Tổng số lái thử: {statistics.overview?.totalTestDrives ?? 0}</li>
                                        <li>Tổng số phản hồi: {statistics.overview?.totalFeedback ?? 0}</li>
                                        <li>Lịch hẹn đang chờ: {statistics.overview?.pendingTestDrives ?? 0}</li>
                                    </ul>
                                ) : <p>Không có thống kê.</p>}
                            </section>
                        )}
                        {activeTab === 'testDrive' && (
                            <section>
                                <div className="form-selectors">
                                    <label style={{ marginRight: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={isNewCustomer}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setIsNewCustomer(checked);
                                                if (checked) {
                                                    setSelectedCustomerId('');
                                                } else if (customers.length > 0) {
                                                    setSelectedCustomerId(customers[0]._id);
                                                }
                                            }}
                                        />{' '}
                                        Khách hàng mới
                                    </label>
                                    {!isNewCustomer && (
                                        <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
                                            {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    )}
                                    <select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
                                        {vehicles.map(v => <option key={v._id} value={v._id}>{v.brand} {v.model}</option>)}
                                    </select>
                                    {vehicles.length === 0 && (
                                        <p style={{ color: 'red', marginTop: '0.5rem' }}>
                                            Không có xe khả dụng. Vui lòng thêm xe trong module quản lý xe.
                                        </p>
                                    )}
                                </div>
                                <TestDriveForm customerId={isNewCustomer ? undefined : selectedCustomerId} vehicleId={selectedVehicleId} />
                                {loading ? <p>Đang tải...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : testDrives.length > 0 ? (
                                    <ul>
                                        {testDrives.map(drive => (
                                            <li key={drive._id}>{drive.customer?.name || 'Khách hàng'} - {new Date(drive.schedule).toLocaleString()}</li>
                                        ))}
                                    </ul>
                                ) : <p>Không có lịch lái thử.</p>}
                            </section>
                        )}
                        {activeTab === 'feedback' && (
                            <section>
                                <div className="form-selectors">
                                    <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
                                        <option value="">-- Chọn khách hàng (hoặc tự nhập) --</option>
                                        {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                    <select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
                                        <option value="">-- Liên kết xe (tùy chọn) --</option>
                                        {vehicles.map(v => <option key={v._id} value={v._id}>{v.brand} {v.model}</option>)}
                                    </select>
                                </div>
                                <FeedbackForm customerId={selectedCustomerId} vehicleId={selectedVehicleId} />
                                {loading ? <p>Đang tải...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : feedback.length > 0 ? (
                                    <ul>
                                        {feedback.map(fb => (
                                            <li key={fb._id}>{fb.customer?.name || 'Khách hàng'}: {fb.content}</li>
                                        ))}
                                    </ul>
                                ) : <p>Không có phản hồi.</p>}
                            </section>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </motion.div>
    );
}

export default CrmPage;