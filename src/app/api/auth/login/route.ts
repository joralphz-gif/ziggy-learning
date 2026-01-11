import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        parentLearners: true,
      },
    });

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email || undefined,
    });

    // Get learners if parent
    const learners = user.role === 'parent' 
      ? user.parentLearners.map((l: { id: string; displayName: string; avatarEmoji: string }) => ({
          id: l.id,
          displayName: l.displayName,
          avatarEmoji: l.avatarEmoji,
        }))
      : [];

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      learners,
    });

    // Set auth cookie
    const cookieHeader = setAuthCookie(token);
    response.headers.set('Set-Cookie', cookieHeader['Set-Cookie']);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
