import React, { useState } from 'react';
import { createFeedback } from '../services/api'; 

const formStyle = {
  border: '1px solid #ccc',
  padding: '20px',
  borderRadius: '8px',
  width: '400px',
};
const inputStyle = { width: '95%', padding: '8px', margin: '10px 0' };

function FeedbackForm() {
  const [formData, setFormData] = useState({
    customerId: '', 
    content: '',
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);


    const dataToSubmit = {
      ...formData,
      customerId: '60d0fe4f5311236168a109cb', 
    };

    try {
      const response = await createFeedback(dataToSubmit);
      setMessage(`Ghi nhận khiếu nại thành công! ID: ${response.data._id}`);
      setFormData({ customerId: '', content: '' });
    } catch (error) {
      setMessage(`Lỗi: ${error.response.data.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3>(1.c.3) Ghi nhận Khiếu nại</h3>
      

      <textarea
        name="content" placeholder="Nội dung khiếu nại..."
        value={formData.content} onChange={handleChange} style={inputStyle} required
      />
      
      <button type="submit" style={{ padding: '10px 20px' }}>Gửi Khiếu nại</button>
      
      {message && <p style={{ marginTop: '15px' }}>{message}</p>}
    </form>
  );
}

export default FeedbackForm;