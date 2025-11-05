import React, { useState } from 'react';
import { createTestDrive } from '../services/api'; // Import API service

// CSS đơn giản cho Form
const formStyle = {
  border: '1px solid #ccc',
  padding: '20px',
  borderRadius: '8px',
  width: '400px',
};
const inputStyle = { width: '95%', padding: '8px', margin: '10px 0' };

function TestDriveForm() {
  // Quản lý trạng thái của form
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    vehicleId: '', // Sẽ cần ID xe
    schedule: '',
  });
  const [message, setMessage] = useState(null); // Để hiển thị thông báo

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm này thực thi Sơ đồ Tuần tự (Sequence Diagram)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Dữ liệu giả lập cho ID xe (vì chưa làm mục 1.a)
    const dataToSubmit = {
      ...formData,
      vehicleId: '60d0fe4f5311236168a109ca', // ID giả lập
      schedule: new Date(formData.schedule).toISOString(), // Chuyển đổi ngày
    };

    try {
   
      const response = await createTestDrive(dataToSubmit);
      
      setMessage(`Tạo lịch hẹn thành công! ID: ${response.data._id}`);
      setFormData({ customerName: '', customerPhone: '', vehicleId: '', schedule: '' }); 
    } catch (error) {

      setMessage(`Lỗi: ${error.response.data.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3>(1.c.2) Tạo Lịch hẹn Lái thử</h3>
      
      <input
        type="text" name="customerName" placeholder="Tên khách hàng"
        value={formData.customerName} onChange={handleChange} style={inputStyle} required
      />
      <input
        type="text" name="customerPhone" placeholder="SĐT khách hàng"
        value={formData.customerPhone} onChange={handleChange} style={inputStyle} required
      />
      <input
        type="datetime-local" name="schedule"
        value={formData.schedule} onChange={handleChange} style={inputStyle} required
      />

      
      <button type="submit" style={{ padding: '10px 20px' }}>Lưu Lịch hẹn</button>
      
      {message && <p style={{ marginTop: '15px' }}>{message}</p>}
    </form>
  );
}

export default TestDriveForm;