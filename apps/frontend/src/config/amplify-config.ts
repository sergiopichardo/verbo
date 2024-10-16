import { ResourcesConfig } from "aws-amplify"
import backendOutputs from "./backendOutputs.json";

export const awsConfig: ResourcesConfig = {
    Auth: {
        Cognito: {
            userPoolId: backendOutputs.userPoolId,
            userPoolClientId: backendOutputs.userPoolClientId,
            identityPoolId: backendOutputs.identityPoolId,
        }
    },
}

// process.env.NEXT_PUBLIC_AWS_REGION as string