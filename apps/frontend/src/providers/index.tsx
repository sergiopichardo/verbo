"use client";

import { ConfigureAmplifyClient } from "@/providers/configure-amplify-client";
import { ReactQueryProvider } from "./react-query-provider";
import { AuthProvider } from "./auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ConfigureAmplifyClient />
            <AuthProvider>
                <ReactQueryProvider>
                    {children}
                </ReactQueryProvider>
            </AuthProvider>
        </>
    )
}