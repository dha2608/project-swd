import React from 'react';
import TestDriveForm from './components/TestDriveForm';
import FeedbackForm from './components/FeedbackForm';
import './App.css'; // Import file CSS

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: 'center', color: '#007bff' }}>
        EVDMS - Module CRM
      </h1>
      <div className="crm-container">
        <TestDriveForm />
        <FeedbackForm />
      </div>
    </div>
  );
}

export default App;