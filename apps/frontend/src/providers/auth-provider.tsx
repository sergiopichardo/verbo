"use client";

import { useEffect, useState } from 'react';
import * as Auth from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentAuthUser, setCurrentAuthUser] = useState<Auth.AuthUser | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [authError, setAuthError] = useState<Auth.AuthError | null>(null);

    const router = useRouter();

    const resetAuthState = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsLoading(false);
        setCurrentAuthUser(null);
        setAuthError(null);
    };

    const fetchCurrentAuthUser = async () => {
        try {
            const user = await Auth.getCurrentUser();
            let userSession: Auth.AuthSession | null = null;
            let isAdminUser = false;

            if (user) {
                userSession = await Auth.fetchAuthSession();
            }
            if (userSession) {
                isAdminUser = userSession.tokens?.idToken?.payload['cognito:groups']?.toString().includes('Admins') as boolean;
            }

            console.log(user);

            setCurrentAuthUser(user);
            setIsLoggedIn(true);
            setIsLoading(false);
            setIsAdmin(isAdminUser);
            setAuthError(null);
        } catch (error) {
            if (error instanceof Auth.AuthError) {
                setAuthError(error);
            }
            setIsLoggedIn(false);
            setIsAdmin(false);
            setIsLoading(false);
            setCurrentAuthUser(null);
        }
    };

    useEffect(() => {
        const unsubscribe = Hub.listen('auth', ({ payload }) => {
            switch (payload.event) {
                case 'signedIn':
                    fetchCurrentAuthUser();
                    router.push('/');
                    break;
                case 'signedOut':
                    resetAuthState();
                    router.push('/');
                    break;
                default:
                    break;
            }
        });

        fetchCurrentAuthUser();

        return () => unsubscribe();
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                currentAuthUser,
                isAdmin,
                isLoggedIn,
                isLoading,
                authError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
