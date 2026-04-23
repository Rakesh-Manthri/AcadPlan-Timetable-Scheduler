import api from './api';

const facultyService = {
  getAll: async () => {
    const response = await api.get('/faculty');
    return response.data;
  },
  
  create: async (facultyData) => {
    const response = await api.post('/faculty', facultyData);
    return response.data;
  },

  update: async (id, facultyData) => {
    const response = await api.put(`/faculty/${id}`, facultyData);
    return response.data;
  }
};

export default facultyService;
