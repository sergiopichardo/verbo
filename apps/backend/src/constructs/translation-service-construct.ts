import { Construct } from "constructs";

import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

import { type ApiGatewayMethods } from "../stacks/api-stack";
import { findPath } from "../../helpers/path-finder";

interface TranslationServiceProps {
    restApi: apigateway.RestApi;
    domainName: string;
    apiSubDomain: string;
    appName: string;
    translationsTable: dynamodb.TableV2;
}

export class TranslationServiceConstruct extends Construct {

    constructor(scope: Construct, id: string, props: TranslationServiceProps) {
        super(scope, id);

        // Lambdas 
        const utilsLambdaLayer = this._createLambdaLayer("utils");
        const translationsLambda = this._createTranslationsLambda(props, [utilsLambdaLayer]);
        const getTranslationsLambda = this._createGetTranslationsLambda(props, [utilsLambdaLayer]);

        // API 
        const translationResource = this._createTranslationResource(props.restApi)
        this._createTranslationMethod("POST", translationResource, translationsLambda);
        this._createTranslationMethod("GET", translationResource, getTranslationsLambda);
    }

    private _createGetTranslationsLambda(props: TranslationServiceProps, layers: lambda.LayerVersion[]): lambdaNodejs.NodejsFunction {

        const getTranslationsTablePolicy = new iam.PolicyStatement({
            actions: [
                "dynamodb:Scan",
            ],
            resources: [props.translationsTable.tableArn],
        });

        const _lambda = new lambdaNodejs.NodejsFunction(
            this,
            "get-translations",
            {
                entry: findPath("lambdas/get-translations/index.ts"),
                runtime: lambda.Runtime.NODEJS_20_X,
                handler: "handler",
                initialPolicy: [
                    getTranslationsTablePolicy,
                ],
                environment: {
                    TRANSLATIONS_TABLE_NAME: props.translationsTable.tableName,
                },
                layers: layers,
            }
        );

        return _lambda;
    }

    private _createTranslationsLambda(props: TranslationServiceProps, layers: lambda.LayerVersion[]): lambdaNodejs.NodejsFunction {
        const getTranslationsTablePolicy = new iam.PolicyStatement({
            actions: [
                "dynamodb:PutItem",
            ],
            resources: [props.translationsTable.tableArn],
        });

        const translateTextPolicy = new iam.PolicyStatement({
            actions: [
                "translate:TranslateText",
            ],
            resources: ["*"],
        });

        const _lambda = new lambdaNodejs.NodejsFunction(
            this,
            "create-translation",
            {
                entry: findPath("lambdas/create-translation/index.ts"),
                runtime: lambda.Runtime.NODEJS_20_X,
                handler: "handler",
                initialPolicy: [
                    getTranslationsTablePolicy,
                    translateTextPolicy,
                ],
                // this is commented out because I'll do this in a cleaner way later on
                // bundling: {
                // Important: We're specifying with this lambda layer path that the lambda layer code are external modules 
                // so that the bundler doesn't try to bundle them into the lambda. Otherwise, the lambda layer code will be 
                // duplicated in each lambda function.
                // these reduces the size of the lambda function and speeds up the lambda function execution.
                // externalModules: ["/opt/nodejs/utils"],
                // },
                environment: {
                    TRANSLATIONS_TABLE_NAME: props.translationsTable.tableName,
                    TRANSLATIONS_PARTITION_KEY: "requestId",
                },
                layers: layers,
            }
        );

        return _lambda;
    }

    private _createTranslationResource(restApi: apigateway.RestApi) {
        return restApi.root.addResource("translations")
    }

    private _createTranslationMethod(
        method: ApiGatewayMethods,
        resource: apigateway.Resource,
        lambda: lambdaNodejs.NodejsFunction,
    ) {
        resource.addMethod(method, new apigateway.LambdaIntegration(lambda))
    }

    private _createLambdaLayer(layerName: string): lambda.LayerVersion {
        const layerPath = findPath('lambda-layers/utils');

        return new lambda.LayerVersion(
            this,
            `${layerName}LambdaLayer`,
            {
                code: lambda.AssetCode.fromAsset(layerPath),
                description: `${layerName} Lambda Layer`,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
                compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            }
        );
    }
}