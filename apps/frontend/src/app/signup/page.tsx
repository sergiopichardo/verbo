"use client"

import SignUpForm from "@/components/signup-form";
import ConfirmSignUpForm from "@/components/confirm-signup";
import AutoSignInForm from "@/components/auto-signin-form";

import {
    SignInOutput,
    SignUpOutput
} from "aws-amplify/auth";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/*
SignUpOutput['nextStep'] = {
    isSignUpComplete: boolean,
    userId?: string,
    nextStep: 'CONFIRM_SIGN_UP' | 'COMPLETE_AUTO_SIGN_IN' | 'DONE'
}

SignInOutput['nextStep'] = {
    isSignInComplete: boolean,
    userId?: string,
    nextStep: 'CONFIRM_SIGN_IN' | 'COMPLETE_AUTO_SIGN_IN' | 'DONE'
}
*/
export type ISignUpState = SignUpOutput['nextStep'];
export type ISignInStep = SignInOutput['nextStep'];


export default function SignUpPage() {
    const [authStep, setAuthStep] = useState<ISignUpState | ISignInStep | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!authStep) return;
        if ((authStep as ISignInStep).signInStep === 'DONE') {
            router.push('/')
        }
    }, [authStep, router])

    if (authStep) {
        if ((authStep as ISignUpState).signUpStep === 'CONFIRM_SIGN_UP') {
            return <ConfirmSignUpForm onAuthStepChange={setAuthStep} email={email} />
        }

        if ((authStep as ISignUpState).signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
            return <AutoSignInForm onAuthStepChange={setAuthStep} />
        }
    }

    return <SignUpForm onAuthStepChange={setAuthStep} setEmail={setEmail} />
}

