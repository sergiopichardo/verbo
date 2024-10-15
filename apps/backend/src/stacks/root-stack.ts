import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { StaticWebsiteHostingStack } from "./static-website-hosting";
import { HostedZoneStack } from "./hosted-zone-stack";
import { CertificateStack } from "./certificate-stack";

import { StaticWebsiteDeploymentConstruct } from "../constructs/static-website-deployment-construct";
import { DynamodbStack } from "./dynamodb-stack";
import { AuthStack } from "./auth-stack";
import { TranslationStack } from "./translation-stack";

interface RootStackProps extends cdk.StackProps {
    appName: string;
    domainName: string;
    subdomain: string;
    apiSubDomain: string;
    frontendBuildPath: string;
    cloudFrontFunctionFilePath: string;
    stageName: string;
}

export class RootStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: RootStackProps) {
        super(scope, id, props);

        // email stack (will go here)

        const dynamodbStack = new DynamodbStack(this, `${props.appName}DynamodbStack`, {
            appName: props.appName,
        });

        // create DNS stack 
        const hostedZoneStack = new HostedZoneStack(this, `${props.appName}HostedZoneStack`, {
            domainName: props.domainName,
        });

        // create Certificate stack
        const certificateStack = new CertificateStack(this, `${props.appName}CertificateStack`, {
            domainName: props.domainName,
            hostedZone: hostedZoneStack.hostedZone,
            subdomain: props.subdomain,
            apiSubDomain: props.apiSubDomain,
        });

        // auth stack (will go here) --> it will consume the users table 
        const authStack = new AuthStack(this, `${props.appName}AuthStack`, {
            appName: props.appName,
        });

        const hostingStack = new StaticWebsiteHostingStack(this, `${props.appName}StaticWebsiteHostingStack`, {
            domainName: props.domainName,
            subdomain: props.subdomain,
            frontendBuildPath: props.frontendBuildPath,
            cloudFrontFunctionFilePath: props.cloudFrontFunctionFilePath,
            apiSubDomain: props.apiSubDomain,
            certificate: certificateStack.certificate,
            hostedZone: hostedZoneStack.hostedZone,
        });

        new TranslationStack(this, `${props.appName}TranslationStack`, {
            domainName: props.domainName,
            apiSubDomain: props.apiSubDomain,
            certificate: certificateStack.certificate,
            userPool: authStack.userPool,
            stageName: props.stageName,
            translationsTable: dynamodbStack.translationsTable,
            hostedZone: hostedZoneStack.hostedZone,
        });

        /**
         * Constructs
         */

        new StaticWebsiteDeploymentConstruct(this, `${props.appName}StaticWebsiteDeploymentStack`, {
            domainName: props.domainName,
            subdomain: props.subdomain,
            frontendBuildPath: props.frontendBuildPath,
            distribution: hostingStack.distribution,
            destinationBucket: hostingStack.originBucket,
        });

        // Cloudfront Outputs
        new cdk.CfnOutput(this, "staticWebsiteDistributionDomain", {
            value: `https://${hostingStack.distribution.domainName}`,
            exportName: "staticWebsiteDistributionDomain",
        });

        // // API Gateaway Outputs
        new cdk.CfnOutput(this, "translationsApiBaseUrl", {
            value: `https://${props.apiSubDomain}.${props.domainName}`,
            exportName: "translationsApiBaseUrl",
        });

        // Cognito Outputs
        new cdk.CfnOutput(this, "userPoolId", {
            value: authStack.userPool.userPoolId,
            exportName: "userPoolId",
        });

        new cdk.CfnOutput(this, "userPoolClientId", {
            value: authStack.userPoolClient.userPoolClientId,
            exportName: "userPoolClientId",
        });

        new cdk.CfnOutput(this, "identityPoolId", {
            value: authStack.identityPool.ref,
            exportName: "identityPoolId",
        });
    }
}
