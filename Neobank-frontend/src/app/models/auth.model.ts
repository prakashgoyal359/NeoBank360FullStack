export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  message: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: 'USER' | 'ADMIN';
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}
