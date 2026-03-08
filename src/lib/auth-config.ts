// Auth configuration for NextAuth v5
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

// Type declarations for NextAuth v5
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

// Get the base URL dynamically from request headers
async function getBaseURL() {
  try {
    const headersList = await headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000';
    const proto = headersList.get('x-forwarded-proto') || 'https';
    
    // Don't include port if it's default for the protocol
    const url = new URL(`${proto}://${host}`);
    return url.origin;
  } catch {
    return process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }
}

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  trustHost: true, // Trust X-Forwarded-* headers from proxy
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          scope: "openid email profile"
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar || user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (account?.provider === 'google' && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account }: any) {
      if (account?.provider === 'google') {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
        });
        if (!existingUser) {
          await db.user.create({
            data: {
              email: user.email!,
              name: user.name,
              avatar: user.image,
              image: user.image,
              role: 'customer',
            },
          });
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }: any) {
      // Get the actual base URL from headers
      const actualBaseUrl = await getBaseURL();
      
      // If the url is relative, use the actual base URL
      if (url.startsWith("/")) return `${actualBaseUrl}${url}`;
      
      // If the url is already absolute, check if we need to rewrite it
      try {
        const urlObj = new URL(url);
        // If URL points to localhost, rewrite to actual base URL
        if (urlObj.host === 'localhost:3000') {
          const actualUrl = new URL(urlObj.pathname + urlObj.search, actualBaseUrl);
          return actualUrl.toString();
        }
        // Otherwise, allow cross-origin redirect
        return url;
      } catch {
        return actualBaseUrl;
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
