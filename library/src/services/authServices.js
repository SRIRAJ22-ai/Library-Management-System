import API from './api';

export const login = async (credentials) => {
  const { data } = await API.post('/users/login', credentials);
  return data;
};

export const register = async (userData) => {
  const { data } = await API.post('/users/register', userData);
  return data;
};

export const updateProfile = async (userData) => {
  const { data } = await API.put('/users/profile', userData);
  return data;
};