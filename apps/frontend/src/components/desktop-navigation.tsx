"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { signOut } from "aws-amplify/auth";
import { Button } from "./ui/button";

export function DesktopNavigation() {

    const { isLoggedIn } = useAuth();

    return (
        <nav className="flex px-2 py-2 bg-blue-500 text-white">
            <div className="flex flex-row gap-4 w-3/4 mx-auto">
                <div className="mr-auto">
                    <Link href="/">Verbo Translator</Link>
                </div>
                {!isLoggedIn && (
                    <>
                        <div>
                            <Link href="/login">Log in</Link>
                        </div>
                        <div>
                            <Link href="/signup">Sign up</Link>
                        </div>
                    </>
                )}

                {isLoggedIn && (
                    <div>
                        <Link href="#" onClick={() => signOut()}>Log out</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}