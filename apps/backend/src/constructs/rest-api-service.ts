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
}

export class RestApiService extends Construct {
    public restApi: apigateway.RestApi;
    public authorizer?: apigateway.CognitoUserPoolsAuthorizer;

    constructor(scope: Construct, id: string, props: RestApiServiceProps) {
        super(scope, id);

        this.restApi = new apigateway.RestApi(this, props.restApiName, {
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
            },
            domainName: {
                domainName: `${props.apiSubDomain}.${props.domainName}`,
                certificate: props.certificate,
            },
        });

        if (props.userPool) {
            this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(this.restApi, "CognitoAuthorizer", {
                cognitoUserPools: [props.userPool],
                authorizerName: "userPoolAuthorizer",
            });
        }
    }


    public addMethod(props: {
        method: string,
        lambda: lambdaNodejs.NodejsFunction,
        isAuthorized?: boolean,
    }) {

        if (props.isAuthorized && !this.authorizer) {
            throw new Error("Authorizer is required for authorized methods");
        }

        let options: apigateway.MethodOptions = {};

        if (props.isAuthorized) {
            options = {
                authorizer: this.authorizer as apigateway.CognitoUserPoolsAuthorizer,
                authorizationType: apigateway.AuthorizationType.COGNITO,
            }
        }

        this.restApi.root.addMethod(
            props.method,
            new apigateway.LambdaIntegration(props.lambda),
            options
        )
    }
}

