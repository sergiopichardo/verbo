"use client"

import SignUpForm from "@/components/signup-form";
import ConfirmSignUpForm from "@/components/confirm-signup";
import AutoSignInForm from "@/components/auto-signin-form";

import {
    SignInOutput,
    SignUpOutput
} from "aws-amplify/auth";

import { useState } from "react";

export type ISignUpState = SignUpOutput['nextStep'];
export type ISignInStep = SignInOutput['nextStep'];


export default function SignUpPage() {
    const [authStep, setAuthStep] = useState<ISignUpState | ISignInStep | null>(null);

    if (authStep) {
        if ((authStep as ISignUpState).signUpStep === 'CONFIRM_SIGN_UP') {
            return <ConfirmSignUpForm onAuthStepChange={setAuthStep} />
        }

        if ((authStep as ISignUpState).signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
            return <AutoSignInForm onAuthStepChange={setAuthStep} />
        }

        // if ((authStep as ISignUpState).signUpStep === 'DONE') {
        //     return <div>Done</div>
        // }
    }

    return <SignUpForm onAuthStepChange={setAuthStep} />

}