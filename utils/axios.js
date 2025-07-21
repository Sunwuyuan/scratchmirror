import axios from 'axios';
import randomUseragent from 'random-useragent';

// 创建 axios 实例
const axiosInstance = axios.create({
    timeout: 30000, // 30秒超时
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
axiosInstance.interceptors.request.use(
    (config) => {
        // 每次请求都使用新的随机 UA
        config.headers['User-Agent'] = randomUseragent.getRandom();
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;