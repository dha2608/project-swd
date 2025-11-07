import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);
    
    const { login } = useAuth(); // Lấy hàm login từ Context
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsError(false);

        try {
            await login(email, password);
            navigate('/dashboard'); // Chuyển đến trang Dashboard sau khi login thành công
        } catch (error) {
            setMessage(`Lỗi: ${error.response?.data?.message || error.message}`);
            setIsError(true);
        }
    };

    return (
        <div className="container">
            <div className="form-card" style={{animationDelay: '0s'}}>
                <h2>Đăng nhập Hệ thống EVDMS</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email" id="email" name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password" id="password" name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-submit">Đăng nhập</button>
                </form>
                {message && (
                    <div className={`message ${isError ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginPage;