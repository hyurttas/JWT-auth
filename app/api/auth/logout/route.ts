import { getUserFromCookie } from '@/actions/decode';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get the user from the cookie
    const user = await getUserFromCookie();
        console.log('user:',user);
        
    if (user) {
      // Delete all refresh tokens for the user (prevents token reuse)
      await prisma.refreshToken.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // Optional: Log logout event
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          activityType: 'LOGOUT',
          timestamp: new Date()
        }
      });
    }

    // Create a response with comprehensive cookie clearing
    const response = NextResponse.json({ 
      status: 200, 
      message: 'Logout successful' 
    });

    // Clear ALL authentication-related cookies
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');

    // Set secure, HTTP-only cookie flags
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1 // Immediately expire
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      status: 500, 
      message: 'Logout failed' 
    }, { status: 500 });
  }
}