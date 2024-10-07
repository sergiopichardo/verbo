"use client"

import { Amplify } from "aws-amplify"
import { awsConfig } from "../config/amplify-config"

Amplify.configure(awsConfig);

export function ConfigureAmplifyClient() {
    return null;
}