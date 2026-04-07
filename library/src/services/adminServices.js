import API from './api';

export const getAdminStats = async () => {
  const { data } = await API.get('/admin/stats');
  return data;
};

export const getAllUsers = async () => {
  const { data } = await API.get('/users');
  return data;
};

export const manageUserStrikes = async (userId, strikeData) => {
  // strikeData = { action: 'add'/'remove', reason: '...' }
  const { data } = await API.put(`/users/${userId}/strikes`, strikeData);
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await API.delete(`/users/${userId}`);
  return data;
};