import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface JwtPayloadWithUser extends jwt.JwtPayload {
  id: string;
  email: string;
}

export async function getUserFromCookie() {
  // Retrieve the access token from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return null; // No token found
  }
  try {
    // Verify and decode the token
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayloadWithUser;

    // Ensure the decoded token has the required properties
    if (!decoded.id || !decoded.email) {
      throw new Error('Invalid token structure');
    }

    // Return the user information
    return {
      id: decoded.id,
      email: decoded.email,
    };
  } catch (error) {
    // Handle token verification errors
    console.error('Failed to extract user from token', error);
    return null;
  }
}
