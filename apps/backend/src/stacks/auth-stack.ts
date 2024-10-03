import { Construct } from "constructs";

import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";


interface AuthStackProps extends cdk.StackProps {
    appName: string;
}

export class AuthStack extends cdk.Stack {
    public userPool: cognito.UserPool;
    public userPoolClient: cognito.UserPoolClient;
    public identityPool: cognito.CfnIdentityPool;
    constructor(scope: Construct, id: string, props: AuthStackProps) {
        super(scope, id, props);

        this.userPool = this._createCognitoUserPool();
        this.userPoolClient = this._createCognitoUserPoolClient();
        this.identityPool = this._createCognitoIdentityPool();
    }

    private _createCognitoUserPool() {
        const userPool = new cognito.UserPool(this, "UserPool", {
            selfSignUpEnabled: true, // allow users to sign up on their own
            signInAliases: { // allow users to sign in with their email only
                email: true
            },
            autoVerify: { // auto verify email
                email: true
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY, // delete the user pool when the stack is deleted
        });

        new cdk.CfnOutput(this, "userPoolId", {
            value: userPool.userPoolId,
            exportName: "userPoolId",
        });

        return userPool;
    }

    private _createCognitoUserPoolClient() {
        const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
            userPool: this.userPool,
            authFlows: {
                userSrp: true,
            },
            generateSecret: false, // do not generate a secret for the client 
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.COGNITO,
            ],
        });

        new cdk.CfnOutput(this, "userPoolClientId", {
            value: this.userPoolClient.userPoolClientId,
            exportName: "userPoolClientId",
        });

        return userPoolClient;
    }

    private _createCognitoIdentityPool() {
        const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
            allowUnauthenticatedIdentities: true,
            cognitoIdentityProviders: [
                {
                    clientId: this.userPoolClient.userPoolClientId,
                    providerName: this.userPool.userPoolId,
                },
            ],
        });

        return identityPool;
    }
}

