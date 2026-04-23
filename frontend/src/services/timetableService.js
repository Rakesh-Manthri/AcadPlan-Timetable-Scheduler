import api from './api';

const scheduleService = {
  // Legacy
  getLatest: async () => {
    const response = await api.get('/timetable/latest');
    return response.data;
  },
  generate: async (courses) => {
    const response = await api.post('/timetable/generate', { courses });
    return response.data;
  },

  // Branch Constraints
  getConstraints: async (department) => {
    const response = await api.get(`/timetable/constraints/${department}`);
    return response.data;
  },
  saveConstraints: async (department, data) => {
    const response = await api.put(`/timetable/constraints/${department}`, data);
    return response.data;
  },

  // Wizard Generation
  generateBranch: async (payload) => {
    const response = await api.post('/timetable/generate-branch', payload);
    return response.data;
  },
  getRequest: async (id) => {
    const response = await api.get(`/timetable/request/${id}`);
    return response.data;
  }
};

export default scheduleService;
