import jwt from 'jsonwebtoken';

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function refreshTokens() {
  try {
    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      credentials: 'include' // Important for sending cookies
    });
    
    const result = await response.json();
    
    if (!result.success) {
      // Redirect to login if refresh fails
      window.location.href = '/login';
    }
    
    return result.success;
  } catch (error) {
    console.error('Token refresh failed', error);
    window.location.href = '/login';
    return false;
  }
}