"use client"

import { signIn } from "aws-amplify/auth"
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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
    type TSignInForm,
    logInPageSchema
} from "@/schema/authentication.schema"
import Link from "next/link"

export default function LogInPage() {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<TSignInForm>({
        resolver: zodResolver(logInPageSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    useEffect(() => {
        setIsLoading(true)
    }, [])

    const onSubmit = async (data: TSignInForm) => {
        try {
            await signIn({ ...data, username: data.email })
            // Handle successful sign-in
        } catch (error) {
            console.error("Error signing in:", error)
            // Handle sign-in error
        } finally {
            form.reset();
            setIsLoading(false);
        }
    }

    if (!isLoading) {
        return <div>Loading ...</div> // or a loading indicator
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
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Sign In</Button>
                </form>
            </Form>
            <div className="mt-4">
                Don't have an account? <Link href="/signup" className="text-blue-500">Sign Up</Link>
            </div>
        </div>
    )
}