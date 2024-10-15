import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as route53 from "aws-cdk-lib/aws-route53";


import { RestApiService } from "../constructs/rest-api-service";
import { TranslationService } from "../constructs/translation-service";

interface TranslationStackProps extends cdk.NestedStackProps {
    domainName: string;
    apiSubDomain: string;
    certificate: acm.Certificate;
    userPool: cognito.UserPool;
    stageName: string;
    translationsTable: dynamodb.TableV2;
    hostedZone: route53.IHostedZone;
}

export class TranslationStack extends cdk.NestedStack {
    constructor(scope: Construct, id: string, props: TranslationStackProps) {
        super(scope, id, props);

        const translationRestApiService = new RestApiService(this, "translationRestApi", {
            restApiName: "translationApi",
            domainName: props.domainName,
            apiSubDomain: props.apiSubDomain,
            certificate: props.certificate,
            userPool: props.userPool
        })

        new TranslationService(this, "translationService", {
            restApiService: translationRestApiService,
            translationsTable: props.translationsTable,
            stageName: props.stageName,
            hostedZone: props.hostedZone,
            domainName: props.domainName,
        });
    }
}