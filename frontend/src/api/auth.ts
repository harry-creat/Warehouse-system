import client from './client';
import type { AuthResponse, User } from '../types';

export async function login(email: string, password: string) {
  const res = await client.post<{ success: boolean; data: AuthResponse }>('/auth/login', { email, password });
  return res.data.data;
}

export async function register(data: { username: string; email: string; password: string; role?: string }) {
  const res = await client.post<{ success: boolean; data: { user: User } }>('/auth/register', data);
  return res.data.data;
}

export async function refreshTokens(refreshToken: string) {
  const res = await client.post<{ success: boolean; data: { accessToken: string } }>('/auth/refresh', { refreshToken });
  return res.data.data;
}

export async function logout() {
  await client.post('/auth/logout');
}
