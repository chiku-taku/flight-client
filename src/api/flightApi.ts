// src/api/flightApi.ts
import axios from 'axios';

// 配置后端 API 基础路径
const apiClient = axios.create({
  baseURL: 'http://localhost:8088/api',
});

// 搜索航班 API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchRoundFlights = async (searchParams: any) => {
  console.log('前端发送的参数:', searchParams); // 确认参数是否正确
  try {
    const response = await apiClient.post('/flights/searchRound', searchParams);
    return response.data;
  } catch (error) {
    console.error('搜索航班失败:', error);
    throw error;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchSingleFlights = async (searchParams: any) => {
  console.log('前端发送的参数:', searchParams); // 确认参数是否正确
  try {
    const response = await apiClient.post('/flights/searchSingle', searchParams);
    return response.data;
  } catch (error) {
    console.error('搜索航班失败:', error);
    throw error;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const register = async (searchParams: any) => {
  console.log('前端发送的参数:', searchParams); // 确认参数是否正确
  try {
    const response = await apiClient.post('/auth/register', searchParams);
    return response.data;
  } catch (error) {
    console.error('搜索航班失败:', error);
    throw error;
  }
};