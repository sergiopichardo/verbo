import { z } from "zod";

export const logInPageSchema = z.object({
    email: z.string().email().min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type TSignInForm = z.infer<typeof logInPageSchema>;


export const signUpPageSchema = z.object({
    email: z.string().email().min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type TSignUpForm = z.infer<typeof signUpPageSchema>;

export const verifyEmailFormSchema = z.object({
    confirmationCode: z.string().length(6, "Confirmation code must be 6 characters"),
});

export type TVerifyEmailForm = z.infer<typeof verifyEmailFormSchema>;