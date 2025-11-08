import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
    return (
        <div className="notfound-page-wrapper">
            <motion.div
                className="notfound-card"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <h1>404</h1>
                <h2>Trang không tồn tại</h2>
                <p>Rất tiếc, chúng tôi không thể tìm thấy trang bạn yêu cầu.</p>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link to="/dashboard" className="btn-back-home">
                        Quay về Dashboard
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default NotFoundPage;