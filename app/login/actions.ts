'use server'

import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod'; // Recommended for validation

// Input Validation Schema
const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
});

// Token Creation Function
async function createTokens(userId: string, email: string) {
  // Ensure environment variables are set
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('Token secrets are not configured');
  }

  // Create access token (short-lived)
  const accessToken = jwt.sign(
    { id: userId, email }, 
    process.env.ACCESS_TOKEN_SECRET, 
    { expiresIn: '15m' }
  );

  // Create refresh token (long-lived)
  const refreshToken = jwt.sign(
    { id: userId, tokenId: uuidv4() }, 
    process.env.REFRESH_TOKEN_SECRET, 
    { expiresIn: '7d' }
  );

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  return { accessToken, refreshToken };
}

export async function handleSubmit(formData: FormData) {
    try {
    // Extract and validate input
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };

    // Validate input using Zod
    const validatedData = LoginSchema.parse(rawData);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    // Handle user not found
    if (!user) {
      return {
        success: false,
        error: 'User not found. Please check your email and try again.'
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password, 
      user.password as string
    );

    // Handle invalid password
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Invalid password. Please try again.'
      };
    }

    // Generate authentication tokens
    const { accessToken, refreshToken } = await createTokens(
      user.id, 
      user.email
    );

    // Set access token cookie
    const cookieStore = await cookies();
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 // 15 minutes
    });

    // Set refresh token cookie
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    // Successful login
    return {
      success: true,
      redirect: '/dashboard'
    };

  } catch (error:any) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      };
    }

    // Log unexpected errors (consider using a proper logging mechanism)
    console.error('Login error:', error);

    // Generic error response
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}