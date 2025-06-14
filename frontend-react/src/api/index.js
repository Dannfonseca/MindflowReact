/*
  Arquivo: src/api/index.js
  Descrição: Separada a URL base da URL da API para corrigir erros de conexão do Socket.IO.
*/
import { jwtDecode } from 'jwt-decode';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mindflowreact.onrender.com/api';
export const API_URL = `${API_BASE_URL}/api`;

export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem('token');
  
  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      console.log('Token expirado, limpando...');
      localStorage.removeItem('token');
      token = null;
      window.location.href = '/login'; 
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['x-auth-token'] = token;
  }

  const newOptions = { ...options, headers };

  return fetch(url, newOptions);
};