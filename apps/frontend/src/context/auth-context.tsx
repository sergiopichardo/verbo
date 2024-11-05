'use client';

import { createContext } from 'react';
import * as Auth from 'aws-amplify/auth';

export interface AuthContextType {
    currentAuthUser: Auth.AuthUser | null;
    isAdmin: boolean;
    isLoggedIn: boolean;
    isLoading: boolean;
    authError: Auth.AuthError | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);
