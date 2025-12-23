// /**
//  * API utility functions for making requests to the backend API
//  */

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// /**
//  * Constructs a full API URL by combining the base URL with the endpoint
//  */
// export const getApiUrl = (endpoint: string): string => {
//   // Remove leading slash if present
//   const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
//   return `${API_BASE_URL}/${cleanEndpoint}`;
// };

// /**
//  * Fetches data from the API with the given options
//  */
// export const fetchApi = async (endpoint: string, options?: RequestInit) => {
//   const url = getApiUrl(endpoint);

//   // Get auth token from localStorage
//   const token = localStorage.getItem("auth-token");

//   // Merge default headers with provided options
//   const defaultHeaders: Record<string, string> = {
//     "Content-Type": "application/json",
//   };

//   if (token) {
//     defaultHeaders["Authorization"] = `Bearer ${token}`;
//   }

//   const mergedOptions: RequestInit = {
//     ...options,
//     headers: {
//       ...defaultHeaders,
//       ...options?.headers,
//     },
//   };

//   try {
//     const response = await fetch(url, mergedOptions);

//     if (!response.ok) {
//       // Handle authentication errors
//       if (response.status === 401) {
//         // Token expired or invalid, redirect to login
//         localStorage.removeItem("auth-token");
//         window.location.href = "/login";
//         return;
//       }
//       throw new Error(`API error: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     throw error;
//   }
// };

// /**
//  * Common API methods for CRUD operations
//  */
// export const api = {
//   // GET request
//   get: (endpoint: string) => fetchApi(endpoint),

//   // POST request with JSON body
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   post: (endpoint: string, data: any) =>
//     fetchApi(endpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     }),

//   // PUT request with JSON body
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   put: (endpoint: string, data: any) =>
//     fetchApi(endpoint, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     }),

//   // DELETE request
//   delete: (endpoint: string) =>
//     fetchApi(endpoint, {
//       method: "DELETE",
//     }),
// };

// app/utils/api.ts

/**
 * API utility functions for making requests to the backend API
 */

// Ikkada kevalam empty string vundali, appude local Next.js proxy ki velthundi
const API_BASE_URL = ""; 

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return cleanEndpoint; 
};

export const fetchApi = async (endpoint: string, options?: RequestInit) => {
  const url = getApiUrl(endpoint);
  const token = localStorage.getItem("auth-token");

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("auth-token");
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

export const api = {
  get: (endpoint: string) => fetchApi(endpoint),
  post: (endpoint: string, data: any) =>
    fetchApi(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: (endpoint: string, data: any) =>
    fetchApi(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) =>
    fetchApi(endpoint, {
      method: "DELETE",
    }),
};