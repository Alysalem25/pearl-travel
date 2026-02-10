/**
 * Secure API Client
 * Axios instance with JWT interceptors and error handling
 * 
 * Security Features:
 * - Automatically adds Authorization header with JWT
 * - Handles 401/403 errors (redirect to login)
 * - Centralized error handling
 * - Token refresh support (can be extended)
 * - Type-safe requests
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAuthToken, clearAuthData, getAuthHeader } from "./auth";
import { useRouter } from "next/navigation";

// Create axios instance with base URL
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * Request Interceptor
 * Automatically add JWT token to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authorization header if token exists
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle authentication errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      clearAuthData();
      
      // Only redirect in client-side (not during SSR)
      if (typeof window !== "undefined") {
        const router = useRouter();
        router.push("/login");
      }
      
      return Promise.reject({
        ...error,
        message: "Session expired. Please log in again."
      });
    }
    
    // Handle 403 Forbidden (insufficient permissions)
    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        const router = useRouter();
        router.push("/");
      }
      
      return Promise.reject({
        ...error,
        message: "You don't have permission to access this resource."
      });
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      return Promise.reject({
        ...error,
        message: "Resource not found."
      });
    }
    
    // Handle 400 Bad Request (validation errors)
    if (error.response?.status === 400) {
      const data = error.response.data as any;
      return Promise.reject({
        ...error,
        message: data?.error || "Invalid request."
      });
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      return Promise.reject({
        ...error,
        message: "Server error. Please try again later."
      });
    }
    
    // Network error or timeout
    if (!error.response) {
      return Promise.reject({
        ...error,
        message: "Network error. Please check your connection."
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Methods with proper typing
 */
export const api = {
  /**
   * Authentication endpoints
   */
  auth: {
    register: (data: { name: string; email: string; password: string; number: string }) =>
      apiClient.post("/auth/register", data),
    
    login: (data: { email: string; password: string }) =>
      apiClient.post("/auth/login", data),
    
    me: () => apiClient.get("/auth/me")
  },

  /**
   * Category endpoints
   */
  categories: {
    getAll: () => apiClient.get("/categories"),
    
    getOne: (id: string) => apiClient.get(`/categories/${id}`),
    
    create: (data: FormData) =>
      apiClient.post("/categories", data, {
        headers: { "Content-Type": "multipart/form-data" }
      }),
    
    update: (id: string, data: any) =>
      apiClient.put(`/categories/${id}`, data),
    
    delete: (id: string) =>
      apiClient.delete(`/categories/${id}`),
    
    addImages: (id: string, files: FormData) =>
      apiClient.post(`/categories/${id}/images`, files, {
        headers: { "Content-Type": "multipart/form-data" }
      })
  },

  /**
   * Program endpoints
   */
  programs: {
    getAll: () => apiClient.get("/programs"),
    
    getOne: (id: string) => apiClient.get(`/programs/${id}`),
    
    create: (data: FormData) =>
      apiClient.post("/programs", data, {
        headers: { "Content-Type": "multipart/form-data" }
      }),

    getProgamsByCategory: (categoryId: string)=>
       apiClient.get(`/programs/category/${categoryId}`),
    
    update: (id: string, data: any) =>
      apiClient.put(`/programs/${id}`, data),
    
    delete: (id: string) =>
      apiClient.delete(`/programs/${id}`),
    
    addImages: (id: string, files: FormData) =>
      apiClient.post(`/programs/${id}/images`, files, {
        headers: { "Content-Type": "multipart/form-data" }
      })
  },

  /**
   * Stats endpoint
   */
  getStats: () => apiClient.get("/stats")
};

export default apiClient;
