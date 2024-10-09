"use client"

import { useEffect } from "react";
import { autoSignIn } from "aws-amplify/auth";
import { ISignInStep } from "@/app/signup/page";

interface IAutoSignInFormProps {
    onAuthStepChange: (authStep: ISignInStep) => void
}

export default function AutoSignInForm({ onAuthStepChange }: IAutoSignInFormProps) {
    useEffect(() => {
        // see autoSignIn.d.ts for complete auth example with switch case
        autoSignIn()
            .then(({ nextStep }) => {
                onAuthStepChange(nextStep)
            })
            .catch((error) => console.error("Error auto signing in:", error))
    }, [])

    return <div>Signing in...</div>
}