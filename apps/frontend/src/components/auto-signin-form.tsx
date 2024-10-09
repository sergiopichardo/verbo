"use client"

import { useEffect } from "react";
import { autoSignIn } from "aws-amplify/auth";
import { ISignInStep } from "@/app/signup/page";

interface IAutoSignInFormProps {
    onAuthStepChange: (authStep: ISignInStep) => void
}

export default function AutoSignInForm({ onAuthStepChange }: IAutoSignInFormProps) {
    useEffect(() => {
        const handleAutoSignIn = async () => {
            const { nextStep } = await autoSignIn();
            console.log("nextStep", nextStep);
            onAuthStepChange(nextStep);
        };

        handleAutoSignIn();

    }, [onAuthStepChange]);

    return <div>Signing in...</div>
}