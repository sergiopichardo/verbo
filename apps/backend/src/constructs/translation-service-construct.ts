import { Construct } from "constructs";

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
    stageName: string;
}

export class TranslationServiceConstruct extends Construct {

    constructor(scope: Construct, id: string, props: TranslationServiceProps) {
        super(scope, id);

        // Lambda Layers 
        const utilsLayer = this._createLambdaLayer({
            name: "utils",
            path: findPath("lambda-layers/utils"),
            stageName: props.stageName
        });

        // Lambdas 
        const translationsLambda = this._createTranslationsLambda(props, [utilsLayer]);
        const getTranslationsLambda = this._createGetAllTranslationsLambda(props, [utilsLayer]);

        // API 
        const translationResource = this._createTranslationResource(props.restApi)
        this._createTranslationMethod("POST", translationResource, translationsLambda);
        this._createTranslationMethod("GET", translationResource, getTranslationsLambda);
    }


    private _createGetAllTranslationsLambda(
        props: TranslationServiceProps,
        layers: lambda.ILayerVersion[]
    ): lambdaNodejs.NodejsFunction {

        const lambdaPath = findPath("lambdas/get-translations/index.ts");

        return new lambdaNodejs.NodejsFunction(this, "get-translations", {
            entry: lambdaPath,
            handler: "handler",
            layers: layers,
            runtime: lambda.Runtime.NODEJS_20_X,
            initialPolicy: [
                new iam.PolicyStatement({
                    actions: ["dynamodb:Scan"],
                    resources: [props.translationsTable.tableArn],
                }),
            ],
            environment: {
                TRANSLATIONS_TABLE_NAME: props.translationsTable.tableName,
            },
        });
    }

    private _createLambdaLayer({ name, path, stageName }: {
        name: string;
        path: string;
        stageName: string;
    }) {
        return new lambda.LayerVersion(this, `${name}LambdaLayer`, {
            code: lambda.Code.fromAsset(path),
            compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            removalPolicy: stageName === 'prod'
                ? cdk.RemovalPolicy.RETAIN
                : cdk.RemovalPolicy.DESTROY,
        });
    }

    private _createTranslationsLambda(
        props: TranslationServiceProps,
        layers: lambda.ILayerVersion[]
    ): lambdaNodejs.NodejsFunction {

        const lambdaPath = findPath("lambdas/create-translation/index.ts");

        return new lambdaNodejs.NodejsFunction(this, "create-translation", {
            entry: lambdaPath,
            handler: "handler",
            layers: layers,
            runtime: lambda.Runtime.NODEJS_20_X,
            initialPolicy: [
                new iam.PolicyStatement({
                    actions: ["dynamodb:PutItem"],
                    resources: [props.translationsTable.tableArn],
                }),
                new iam.PolicyStatement({
                    actions: ["translate:TranslateText"],
                    resources: ["*"],
                }),
            ],
            environment: {
                TRANSLATIONS_TABLE_NAME: props.translationsTable.tableName,
                TRANSLATIONS_PARTITION_KEY: "requestId",
            },
        });
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
}