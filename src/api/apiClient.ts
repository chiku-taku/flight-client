import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8088/api', // 确保与后端端口一致
  //timeout: 10000, // 添加超时设置
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    console.log('JWT from localStorage:'+localStorage); // 检查是否获取到 token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      //config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 处理错误响应
    return Promise.reject(error);
  }
);

export default apiClient;