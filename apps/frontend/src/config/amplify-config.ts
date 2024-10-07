import { ResourcesConfig } from "aws-amplify"

export const awsConfig: ResourcesConfig = {
    Auth: {
        Cognito: {
            userPoolId: "us-east-1_T9zuD9H81",
            userPoolClientId: "3h7rd0qamn3vi56rb0l3ibjsh3",
            identityPoolId: "us-east-1:7f0e483a-5a5e-4bb9-9e95-8ac1cf0a70cb",
        }
    },
}

// process.env.NEXT_PUBLIC_AWS_REGION as string