import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cdk from "aws-cdk-lib";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";

const DEFAULT_RATE_LIMITS = {
    THROTTLE_RATE: 10,  // requests per second
    THROTTLE_BURST: 20, // burst requests
    QUOTA_LIMIT: 100,   // requests per day
} as const;

interface RestApiServiceProps extends cdk.NestedStackProps {
    restApiName: string;
    domainName: string;
    apiSubDomain: string;
    certificate: acm.Certificate;
    userPool?: cognito.UserPool;
    resourceName: string;
    stageName: string;
    rateLimit?: {
        throttleRateLimit?: number;  // requests per second
        throttleBurstLimit?: number; // burst requests
        quotaLimit?: number;         // total requests
        quotaPeriod?: apigateway.Period; // period for quota
    };
}

export class RestApiService extends Construct {
    public restApi: apigateway.RestApi;
    public authorizer?: apigateway.CognitoUserPoolsAuthorizer;
    public translationsResource: apigateway.Resource;
    public publicTranslationsResource: apigateway.Resource;


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
            deployOptions: {
                stageName: props.stageName,
                throttlingRateLimit: props.rateLimit?.throttleRateLimit ?? DEFAULT_RATE_LIMITS.THROTTLE_RATE,
                throttlingBurstLimit: props.rateLimit?.throttleBurstLimit ?? DEFAULT_RATE_LIMITS.THROTTLE_BURST,
            },
        });

        this.translationsResource = this.restApi.root.addResource(props.resourceName); // https://api.verbotranslator.com/translations
        this.publicTranslationsResource = this.translationsResource.addResource("public"); // https://api.verbotranslator.com/translations/public

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

        // Add usage plan if rate limiting is configured
        if (props.rateLimit) {
            const usagePlan = new apigateway.UsagePlan(this, 'GlobalUsagePlan', {
                name: `${props.restApiName}-usage-plan`,
                throttle: {
                    rateLimit: props.rateLimit.throttleRateLimit ?? DEFAULT_RATE_LIMITS.THROTTLE_RATE,
                    burstLimit: props.rateLimit.throttleBurstLimit ?? DEFAULT_RATE_LIMITS.THROTTLE_BURST,
                },
                ...(props.rateLimit.quotaLimit && props.rateLimit.quotaPeriod && {
                    quota: {
                        limit: props.rateLimit.quotaLimit,
                        period: props.rateLimit.quotaPeriod,
                    },
                }),
            });

            usagePlan.addApiStage({
                stage: this.restApi.deploymentStage,
            });
        }
    }

    public addMethod(props: {
        resource: apigateway.Resource,
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

        props.resource.addMethod(
            props.method,
            new apigateway.LambdaIntegration(props.lambda),
            options
        );
    }
}
