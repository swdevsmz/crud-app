import axios, { type AxiosInstance } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'content-type': 'application/json'
  },
  timeout: 10000
});
