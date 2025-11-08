import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';


const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="notfound-page-wrapper">
            <motion.div
                className="notfound-card"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="unauthorized-icon">
                    <FiLock />
                </div>
                <h1>Truy cập bị từ chối</h1>
                <p>Bạn không có quyền truy cập vào tài nguyên này.</p>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <button onClick={() => navigate(-1)} className="btn-back-home">
                        Quay lại trang trước
                    </button>
                </motion.div>
                <Link to="/dashboard" className="simple-link">Về Dashboard</Link>
            </motion.div>
        </div>
    );
};

export default UnauthorizedPage;