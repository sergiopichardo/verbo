"use client";


import { ConfigureAmplifyClient } from "@/providers/configure-amplify-client";
import { ReactQueryProvider } from "./react-query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ConfigureAmplifyClient />
            <ReactQueryProvider>
                {children}
            </ReactQueryProvider>
        </>
    )
}