import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TestDriveForm from '../components/TestDriveForm';
import FeedbackForm from '../components/FeedbackForm';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiMessageSquare, FiUserCheck } from 'react-icons/fi';

const CrmPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('testDrive');
    
    const [selectedCustomerId] = useState('60d0fe4f5311236168a109cc');
    const [selectedVehicleId] = useState('60d0fe4f5311236168a109cb');

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
                        {activeTab === 'testDrive' ? (
                            <TestDriveForm
                                customerId={selectedCustomerId}
                                vehicleId={selectedVehicleId}
                            />
                        ) : (
                            <FeedbackForm
                                customerId={selectedCustomerId}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </motion.div>
    );
}

export default CrmPage;