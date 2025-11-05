import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import TestDriveForm from './components/TestDriveForm';
import FeedbackForm from './components/FeedbackForm';

// CSS đơn giản để tách 2 form
const appStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  padding: '20px',
  fontFamily: 'Arial, sans-serif'
};

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px' }}>
        <nav>
          <Link to="/">Trang chủ</Link> | <Link to="/crm">CRM (1.c)</Link>
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<h2>Trang chủ EVDMS</h2>} />
          <Route path="/crm" element={<CrmPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// Trang giả lập cho Module CRM
function CrmPage() {
  return (
    <div>
      <h1>Module Quản lý Khách hàng (1.c)</h1>
      <div style={appStyle}>
        <TestDriveForm />
        <FeedbackForm />
      </div>
    </div>
  );
}

export default App;