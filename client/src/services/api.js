import axios from 'axios';


const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


/**

 * @param {object} formData
 */
export const createTestDrive = (formData) => {
  return apiClient.post('/crm/test-drives', formData);
};

/**

 * @param {object} formData 
 */
export const createFeedback = (formData) => {
  return apiClient.post('/crm/feedback', formData);
};

