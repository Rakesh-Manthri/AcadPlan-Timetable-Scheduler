import api from './api';

const timetableService = {
  getLatest: async () => {
    const response = await api.get('/timetable/latest');
    return response.data;
  },

  generate: async (courses) => {
    const response = await api.post('/timetable/generate', { courses });
    return response.data;
  }
};

export default timetableService;
