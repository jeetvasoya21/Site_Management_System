import api from './api';

class AuthService {
  signup(payload) {
    return api.post('/auth/register', payload).then((response) => response.data);
  }

  login(payload) {
    return api.post('/auth/login', payload).then((response) => response.data);
  }

  logout() {
    return api.post('/auth/logout').then((response) => response.data);
  }

  getCurrentUser() {
    return api.get('/auth/me').then((response) => response.data);
  }

  updateProfile(payload) {
    return api.put('/auth/profile', payload).then((response) => response.data);
  }

  changePassword(payload) {
    return api.put('/auth/change-password', payload).then((response) => response.data);
  }

  refreshToken() {
    return api.post('/auth/refresh-token').then((response) => response.data);
  }
}

export default new AuthService();
