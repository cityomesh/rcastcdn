export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    role: "admin" | "user";
  };
  error?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: "admin" | "user";
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}
