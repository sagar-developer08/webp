"use client";

import axios from 'axios';

// Determine the base URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://0vm9jauvgc.execute-api.us-east-1.amazonaws.com/stag/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add a request interceptor to add the token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and user data on unauthorized
      localStorage.removeItem('token');
      // Don't automatically redirect to login page
      // Let the component that made the request handle the error
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
