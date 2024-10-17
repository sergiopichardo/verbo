import { Construct } from "constructs";

import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";

import { findPath } from "../../helpers/path-finder";
import { RestApiService } from "./rest-api-service";

interface TranslationServiceProps {
    stageName: string;
    translationsTable: dynamodb.TableV2;
    restApiService: RestApiService;
    hostedZone: route53.IHostedZone;
    domainName: string;
}

export class TranslationService extends Construct {

    constructor(scope: Construct, id: string, props: TranslationServiceProps) {
        super(scope, id);

        // Lambda Layers 
        const utilsLayer = this._createLambdaLayer({
            name: "utils",
            path: findPath("lambda-layers/utils"),
            stageName: props.stageName
        });

        // Lambdas 
        const createAuthenticatedTranslationLambda = this._createTranslationsLambda(props, [utilsLayer]);
        const getAllTranslationsLambda = this._createGetAllTranslationsLambda(props, [utilsLayer]);
        const publicCreateTranslationLambda = this._createPublicCreateTranslationLambda([utilsLayer]);

        props.restApiService.addMethod({
            resource: props.restApiService.translationsResource,
            method: "GET",
            lambda: getAllTranslationsLambda,
            isProtected: true,
        })

        props.restApiService.addMethod({
            resource: props.restApiService.translationsResource,
            method: "POST",
            lambda: createAuthenticatedTranslationLambda,
            isProtected: true,
        })

        props.restApiService.addMethod({
            resource: props.restApiService.publicTranslationsResource,
            method: "POST",
            lambda: publicCreateTranslationLambda,
            isProtected: false,
        })

        new route53.ARecord(this, "ApiSubdomainRecord", {
            zone: props.hostedZone,
            recordName: `api.${props.domainName}`,
            target: route53.RecordTarget.fromAlias(new route53Targets.ApiGateway(props.restApiService.restApi)),
        });
    }

    private _createPublicCreateTranslationLambda(
        layers: lambda.ILayerVersion[]
    ): lambdaNodejs.NodejsFunction {
        return new lambdaNodejs.NodejsFunction(this, "public-create-translation", {
            entry: findPath("lambdas/public-create-translation/index.ts"),
            handler: "handler",
            layers: layers,
            runtime: lambda.Runtime.NODEJS_20_X,
            initialPolicy: [
                new iam.PolicyStatement({
                    actions: ["translate:TranslateText"],
                    resources: ["*"],
                }),
            ],
            bundling: {
                minify: true,
                externalModules: ["/opt/nodejs/utils"], // TODO: change layer name to utils-layer
            },
        });
    }

    private _createGetAllTranslationsLambda(
        props: TranslationServiceProps,
        layers: lambda.ILayerVersion[]
    ): lambdaNodejs.NodejsFunction {

        return new lambdaNodejs.NodejsFunction(this, "get-translations", {
            entry: findPath("lambdas/get-translations/index.ts"),
            handler: "handler",
            layers: layers,
            runtime: lambda.Runtime.NODEJS_20_X,
            initialPolicy: [
                new iam.PolicyStatement({
                    actions: ["dynamodb:Query"],
                    resources: [props.translationsTable.tableArn],
                }),
            ],
            environment: {
                TRANSLATIONS_TABLE_NAME: props.translationsTable.tableName,
                TRANSLATIONS_PARTITION_KEY: "username",
                TRANSLATIONS_SORT_KEY: "requestId",
            },
            bundling: {
                minify: true,
                externalModules: ["/opt/nodejs/utils"], // TODO: change layer name to utils-layer
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

        return new lambdaNodejs.NodejsFunction(this, "create-translation", {
            entry: findPath("lambdas/create-translation/index.ts"),
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
                TRANSLATIONS_PARTITION_KEY: "username",
                TRANSLATIONS_SORT_KEY: "requestId",
            },
            bundling: {
                minify: true,
                externalModules: ["/opt/nodejs/utils"], // TODO: change layer name to utils-layer
            },
        });
    }
}