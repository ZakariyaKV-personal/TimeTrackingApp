// api/userService.js
import api from './api';
export const resetPassword = async (userId, newPassword) => {
    try {  
      const response = await api.put(`/api/auth/profile/${userId}/password`, { newPassword }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      });
  
      return response.status === 200; // Successful update
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  };
  