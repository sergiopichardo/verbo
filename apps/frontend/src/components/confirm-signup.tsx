"use client"

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { autoSignIn, confirmSignUp, resendSignUpCode } from "aws-amplify/auth"

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
    type TConfirmSignUpForm,
    confirmSignUpFormSchema
} from "@/schema/authentication.schema"
import toast from 'react-hot-toast'
import { ISignUpState } from '@/app/signup/page'


interface IConfirmSignUpFormProps {
    onAuthStepChange: (step: ISignUpState) => void
    email: string | null
}

export default function ConfirmSignUpForm({ onAuthStepChange, email }: IConfirmSignUpFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<TConfirmSignUpForm>({
        resolver: zodResolver(confirmSignUpFormSchema),
        defaultValues: {
            confirmationCode: "",
        },
    })

    const onSubmit = async (data: TConfirmSignUpForm) => {
        setIsLoading(true);

        try {
            if (!email) {
                toast.error("Email is required");
                return;
            }

            const { nextStep } = await confirmSignUp({
                username: email,
                confirmationCode: data.confirmationCode,
            });

            onAuthStepChange(nextStep);
        } catch (error) {
            console.error("Error verifying email:", error);
        } finally {
            setIsLoading(false)
            form.reset()
        }
    }

    const resendCode = async () => {
        setIsLoading(true)
        try {
            if (!email) {
                toast.error("Email is required");
                return;
            }

            await resendSignUpCode({
                username: email
            });

        } catch (error) {
            console.error("Error resending code:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
            <p>Please enter the verification code sent to {email}</p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="confirmationCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirmation Code</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter 6-digit code" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-row gap-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Confirming..." : "Confirm Email"}
                        </Button>
                        <Button
                            onClick={resendCode}
                            disabled={isLoading}
                            variant="outline"
                        >
                            {isLoading ? "Resending..." : "Resend Code"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}