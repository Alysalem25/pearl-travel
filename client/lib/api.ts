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
import { getAuthToken, clearAuthData } from "./auth";

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
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      clearAuthData();

      // Only redirect in client-side (not during SSR)
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject({
        ...error,
        message: "Session expired. Please log in again."
      });
    }

    // Handle 403 Forbidden (insufficient permissions)
    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
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
    register: (data: FormData | { name: string; email: string; password: string; number: string }) =>
      apiClient.post("/auth/register", data, {
        headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined
      }),

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

    getProgamsByCategory: (categoryId: string) =>
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

  // countries endpoints
  countries: {
    getAll: () => apiClient.get("/countries"),
    getInVisa:() => apiClient.get("/countries/inVisa"),
    getOne: (id: string) => apiClient.get(`/countries/${id}`),
    create: (data: FormData) =>
      apiClient.post("/countries", data, {
        headers: { "Content-Type": "multipart/form-data" }
      }),
    update: (id: string, data: any) =>
      apiClient.put(`/countries/${id}`, data),
    delete: (id: string) =>
      apiClient.delete(`/countries/${id}`)
  }, 

  // flights endpoints
  flights: {
    create: (data: { userEmail: string; userName?: string; userNumber?: number; from: string; to: string }) =>
      apiClient.post("/flights", data),
    getAll: () => apiClient.get("/flights"),
    delete: (id: string) => apiClient.delete(`/flights/${id}`),
    changeStatus: (id: string, status: string) => apiClient.put(`/flights/${id}/status`, { status })
  },

  // booked programs endpoints
  bookings: {
    create: (data: { userEmail: string; userName: string; userNumber: string; message: string; programId: string }) =>
      apiClient.post("/programs/book", data),
    getAll: () => apiClient.get("/programs/booked"),
    delete: (id: string) => apiClient.delete(`/programs/booked/${id}`),
    changeStatus: (id: string, status: string, ) => apiClient.put(`/programs/booked/${id}/status`, { status })
  },


  // car trips endpoints
  carTrips: {
    create: (data: { userEmail: string; userName: string; userNumber: string; message: string; carId: string }) =>
      apiClient.post("/carTrip", data),
    getAll: () => apiClient.get("/carTrip"),
    delete: (id: string) => apiClient.delete(`/carTrip/${id}`),
    changeStatus: (id: string, status: string) => apiClient.put(`/carTrip/${id}/status`, { status })
  },

  // hotel endpoints
  hotelBooking: {
    create: (data: { userEmail: string; userName: string; userNumber: string; message: string; hotelId: string }) =>
      apiClient.post("/hotelBooking", data),
    getAll: () => apiClient.get("/hotelBooking"),
    delete: (id: string) => apiClient.delete(`/hotelBooking/${id}`),
    changeStatus: (id: string, status: string, reviewedBy?: string) =>
      apiClient.put(`/hotelBooking/${id}/status`, { status, reviewedBy })
  },

  /**
   * Stats endpoint
   */
  getStats: () => apiClient.get("/stats"),
  users: {
    getSummary: (id: string, start?: string, end?: string) =>
      apiClient.get(`/users/${id}/summary`, {
        params: { ...(start ? { start } : {}), ...(end ? { end } : {}) }
      }),
    getOne: (id: string) => apiClient.get(`/users/${id}`)
  }
};

export default apiClient;
