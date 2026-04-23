import api from './api';

const roomsService = {
  getAll: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },
  
  create: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  update: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  }
};

export default roomsService;
