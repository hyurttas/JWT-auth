// lib/tokenUtils.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.REFRESH_TOKEN_SECRET as string || 'fallback_secret_key_CHANGE_IN_PRODUCTION';

interface TokenPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}