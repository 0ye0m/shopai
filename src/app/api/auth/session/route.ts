// Session API Route for NextAuth v5
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        image: session.user.image,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}
