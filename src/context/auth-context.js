import { createContext, useContext } from 'react';

// Shared auth context. Consumed via the useAuth() hook below.
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
