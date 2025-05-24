"use client";

import axiosInstance from './axios';


// User-related API services
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserAddress = async (addressData) => {
  try {
    const response = await axiosInstance.post('/users/address', addressData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await axiosInstance.get('/users/logout', null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    localStorage.removeItem('token');
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};
