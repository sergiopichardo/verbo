import { Construct } from "constructs";

import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";


interface AuthStackProps extends cdk.NestedStackProps {
    appName: string;
}

export class AuthStack extends cdk.NestedStack {
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

        return userPool;
    }

    private _createCognitoUserPoolClient() {
        const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
            userPool: this.userPool,
            authFlows: {
                userSrp: true,
            },
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.COGNITO,
            ],
            generateSecret: false, // do not generate a secret for the client 
            // This is necessary for single page applications (SPAs) as they
            // cannot securely store a client secret on the client-side
        });

        return userPoolClient;
    }

    private _createCognitoIdentityPool() {
        const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
            allowUnauthenticatedIdentities: true,
            cognitoIdentityProviders: [
                {
                    clientId: this.userPoolClient.userPoolClientId,
                    providerName: this.userPool.userPoolProviderName,
                },
            ],
        });

        const authenticatedRole = new iam.Role(
            this,
            "CognitoDefaultAuthenticatedRole",
            {
                assumedBy: new iam.FederatedPrincipal(
                    "cognito-identity.amazonaws.com",
                    {
                        StringEquals: {
                            "cognito-identity.amazonaws.com:aud": identityPool.ref,
                        },
                        "ForAnyValue:StringLike": {
                            "cognito-identity.amazonaws.com:amr": "authenticated",
                        },
                    },
                    "sts:AssumeRoleWithWebIdentity"
                ),
            }
        );

        const unauthenticatedRole = new iam.Role(this, 'CognitoDefaultUnauthenticatedRole', {
            assumedBy: new iam.FederatedPrincipal(
                'cognito-identity.amazonaws.com',
                {
                    StringEquals: {
                        'cognito-identity.amazonaws.com:aud': identityPool.ref,
                    },
                    'ForAnyValue:StringLike': {
                        'cognito-identity.amazonaws.com:amr': 'unauthenticated',
                    },
                },
                'sts:AssumeRoleWithWebIdentity'
            ),
        });

        new cognito.CfnIdentityPoolRoleAttachment(
            this,
            "IdentityPoolRoleAttachment",
            {
                identityPoolId: identityPool.ref,
                roles: {
                    authenticated: authenticatedRole.roleArn,
                    unauthenticated: unauthenticatedRole.roleArn,
                },
            }
        );

        return identityPool;
    }
}

