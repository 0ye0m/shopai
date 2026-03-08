// NextAuth v5 Configuration - Re-exports from auth-config
import NextAuth from 'next-auth';
import { authOptions } from './auth-config';

// Create and export NextAuth handlers
export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
