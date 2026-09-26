import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, user } = body;

    if (!idToken || !user) {
      return NextResponse.json(
        { error: 'Missing idToken or user data' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';

    // Set secure HttpOnly cookie for the JWT token
    cookieStore.set('user_session', idToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 14 * 24 * 60 * 60, // 14 days
    });

    // Set profile cookie for server and client session recognition
    cookieStore.set('user_profile', encodeURIComponent(JSON.stringify(user)), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 14 * 24 * 60 * 60,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    const profileCookie = cookieStore.get('user_profile');

    if (!sessionCookie?.value || !profileCookie?.value) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = JSON.parse(decodeURIComponent(profileCookie.value));
    return NextResponse.json({ authenticated: true, user });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
