export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  expiresAt: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserProfile;
}
