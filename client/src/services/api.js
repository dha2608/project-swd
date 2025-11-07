import axios from 'axios';

// Cấu hình URL cơ sở cho Backend
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/* * NÂNG CẤP QUAN TRỌNG (Interceptor):
 * Tự động gắn 'Authorization' (Token) vào header của MỌI request
 * nếu người dùng đã đăng nhập (có token trong localStorage).
*/
apiClient.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// --- API cho Module CRM (1.c) ---
// (Những hàm này vẫn giữ nguyên)
export const createTestDrive = (formData) => {
  return apiClient.post('/crm/test-drives', formData);
};

export const createFeedback = (formData) => {
  return apiClient.post('/crm/feedback', formData);
};

// (Các hàm gọi API Auth (login, register) đã được chuyển vào AuthContext
//  vì chúng liên quan đến state, nhưng chúng ta vẫn dùng apiClient ở đây)

export default apiClient;