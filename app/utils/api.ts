/**
 * API utility functions for making requests to the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Constructs a full API URL by combining the base URL with the endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

/**
 * Get authentication headers if token is available
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetches data from the API with the given options
 */
export const fetchApi = async (endpoint: string, options?: RequestInit) => {
  const url = getApiUrl(endpoint);

  // Merge authentication headers with existing headers
  const headers = {
    ...getAuthHeaders(),
    ...options?.headers,
  };

  const requestOptions = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      // If unauthorized, remove token but don't redirect here
      // Let the ProtectedRoute component handle redirects
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        throw new Error("Authentication required");
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

/**
 * Common API methods for CRUD operations
 */
export const api = {
  // GET request
  get: (endpoint: string) => fetchApi(endpoint),

  // POST request with JSON body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: (endpoint: string, data: any) =>
    fetchApi(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),

  // PUT request with JSON body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: (endpoint: string, data: any) =>
    fetchApi(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),

  // DELETE request
  delete: (endpoint: string) =>
    fetchApi(endpoint, {
      method: "DELETE",
    }),
};
