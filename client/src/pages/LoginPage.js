import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || '/dashboard';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification({ message: '', type: '' });

        try {
            await login(formData.email, formData.password);
            navigate(from, { replace: true });
        } catch (error) {
            setNotification({
                message: `Lỗi: ${error.response?.data?.message || error.message}`,
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <motion.div 
                className="login-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <div className="login-header">
                    <h2>Đăng nhập</h2>
                    <p>Chào mừng trở lại hệ thống EVDMS</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <AnimatePresence>
                        {notification.message && (
                            <motion.div
                                className={`message ${notification.type}`}
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: '1rem' }}
                                exit={{ opacity: 0, y: 10, height: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            >
                                {notification.message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="form-group-icon">
                        <FiMail />
                        <input
                            type="email" id="email" name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="form-group-icon">
                        <FiLock />
                        <input
                            type="password" id="password" name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mật khẩu"
                            required
                        />
                    </div>
                    
                    <motion.button 
                        type="submit" 
                        className="btn-submit" 
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.03 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                        {isLoading ? 'Đang đăng nhập...' : (
                            <>
                                <FiLogIn /> Đăng nhập
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="login-footer">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>
            </motion.div>
        </div>
    );
}

export default LoginPage;