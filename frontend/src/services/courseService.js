import api from './api';

const courseService = {
  getAll: async (semester) => {
    const params = semester ? `?semester=${semester}` : '';
    const response = await api.get(`/courses${params}`);
    return response.data;
  },

  getBySemester: async (department = 'IT') => {
    const response = await api.get(`/courses/by-semester?department=${department}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/courses', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  }
};

export default courseService;
