import axios from 'axios';

// Cấu hình URL cơ sở cho Backend (server đang chạy ở port 5000)
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Gọi API để tạo lịch hẹn lái thử (Msg 2: createAppointment)
 * @param {object} formData Dữ liệu từ form
 */
export const createTestDrive = (formData) => {
  return apiClient.post('/crm/test-drives', formData);
};

/**
 * Gọi API để gửi phản hồi/khiếu nại
 * @param {object} formData Dữ liệu từ form
 */
export const createFeedback = (formData) => {
  return apiClient.post('/crm/feedback', formData);
};