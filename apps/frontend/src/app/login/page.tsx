"use client"

import { AuthError, getCurrentUser, signIn, signOut } from "aws-amplify/auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from 'react'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    type TSignInForm,
    logInPageSchema
} from "@/schema/authentication.schema";

import Link from "next/link";
import toast from "react-hot-toast"

const LogInForm = () => {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<TSignInForm>({
        resolver: zodResolver(logInPageSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: TSignInForm) => {
        setIsLoading(true);

        try {
            await signIn({
                username: data.email,
                password: data.password,
                options: {
                    usernameAttributes: {
                        email: data.email
                    }
                }
            });

        } catch (error) {
            setIsLoading(false);
            if (error instanceof AuthError) {
                if (error.name === "UserNotFoundException") {
                    form.setError("email", {
                        type: "custom",
                        message: "User not found"
                    });
                } else if (error.name === "NotAuthorizedException") {
                    form.setError("password", {
                        type: "custom",
                        message: "Invalid username or password"
                    });
                } else {
                    toast.error("Error signing in");
                }
            }
        } finally {
            form.reset();
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Log In</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            </Form>
            <div className="mt-4">
                Don&apos;t have an account? <Link href="/signup" className="text-blue-500">Sign Up</Link>
            </div>
        </div>
    )
}

const LogOut = () => {

    return (
        <div>
            <Button onClick={async () => {
                await signOut();
                console.log("signed out")
            }}>Log Out</Button>
        </div>
    )
}

export default function LogInPage() {
    const [user, setUser] = useState<object | null | undefined>(undefined);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getCurrentUser();
                console.log(user)
                setUser(user);
            } catch (error) {
                setUser(null);
            }
        }
        fetchUser();
    }, [])


    if (user) {
        return <LogOut />
    }

    return <LogInForm />
}