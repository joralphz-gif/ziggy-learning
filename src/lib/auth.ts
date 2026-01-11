import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { JwtPayload, AuthUser, UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'ziggy-alpha-hub-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  return {
    id: payload.userId,
    email: payload.email || null,
    role: payload.role,
  };
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<AuthUser> {
  const user = await getAuthUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  
  return user;
}

export function setAuthCookie(token: string) {
  return {
    'Set-Cookie': `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
  };
}

export function clearAuthCookie() {
  return {
    'Set-Cookie': 'auth-token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
  };
}
