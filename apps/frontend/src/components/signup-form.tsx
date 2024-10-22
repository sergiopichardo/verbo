"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from 'react'

import { signUp, confirmSignUp, SignUpOutput, AuthError } from "aws-amplify/auth"

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
    type TSignUpForm,
    signUpPageSchema
} from "@/schema/authentication.schema"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { ISignUpState } from "@/app/signup/page"

interface ISignUpFormProps {
    onAuthStepChange: (step: ISignUpState) => void
    setEmail: (email: string) => void
}


export default function SignUpForm({ onAuthStepChange, setEmail }: ISignUpFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<TSignUpForm>({
        resolver: zodResolver(signUpPageSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = async (data: TSignUpForm) => {
        setIsLoading(true)
        try {
            const { nextStep } = await signUp({
                username: data.email,
                password: data.password,
                options: {
                    userAttributes: {
                        email: data.email,
                    },
                    autoSignIn: {
                        enabled: true,
                    }
                }
            })

            onAuthStepChange(nextStep);
            setEmail(data.email);

        } catch (error) {
            if (error instanceof AuthError) {
                if (error.name === "UsernameExistsException") {
                    form.setError("email", {
                        type: "custom",
                        message: "An account with this email address already exists"
                    });
                } else {
                    toast.error("Error signing up");
                }
            }
        } finally {
            form.reset();
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
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
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
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
                        {isLoading ? "Signing up..." : "Sign Up"}
                    </Button>
                </form>
            </Form>
            <div className="mt-4">
                Already have an account? <Link href="/login" className="text-blue-500">Log In</Link>
            </div>
        </div>
    )
}