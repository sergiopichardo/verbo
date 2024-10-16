import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cdk from "aws-cdk-lib";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";

interface RestApiServiceProps extends cdk.NestedStackProps {
    restApiName: string;
    domainName: string;
    apiSubDomain: string;
    certificate: acm.Certificate;
    userPool?: cognito.UserPool;
    resourceName: string;
}

export class RestApiService extends Construct {
    public restApi: apigateway.RestApi;
    public authorizer?: apigateway.CognitoUserPoolsAuthorizer;
    private translationsResource: apigateway.Resource;

    constructor(scope: Construct, id: string, props: RestApiServiceProps) {
        super(scope, id);

        this.restApi = new apigateway.RestApi(this, props.restApiName, {
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
                allowCredentials: true,
                disableCache: true, // TODO: Remove this when launching to prod
            },
            domainName: {
                domainName: `${props.apiSubDomain}.${props.domainName}`,
                certificate: props.certificate,
            },
        });

        this.translationsResource = this.restApi.root.addResource(props.resourceName);

        if (props.userPool) {
            this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, "CognitoAuthorizer", {
                cognitoUserPools: [props.userPool],
                authorizerName: "userPoolAuthorizer",
            });

            this.authorizer._attachToApi(this.restApi);
            console.log("Authorizer created");
        } else {
            console.log("No user pool provided, authorizer not created");
        }
    }

    public addMethod(props: {
        method: string,
        lambda: lambdaNodejs.NodejsFunction,
        isProtected?: boolean,
    }) {
        let options: apigateway.MethodOptions = {};

        if (props.isProtected) {
            if (!this.authorizer) {
                throw new Error("Authorizer is required for authorized methods");
            }

            options = {
                authorizer: this.authorizer,
                authorizationType: apigateway.AuthorizationType.COGNITO,
            }
        }

        this.translationsResource.addMethod(
            props.method,
            new apigateway.LambdaIntegration(props.lambda),
            options
        );
    }
}
