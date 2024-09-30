import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { ApiStack } from "../lib/api-stack";
import { DynamoDBStack } from "../lib/dynamodb-stack";
import { ComputeStack } from "../lib/compute-stack";
import { StaticWebsiteHostingStack } from "./static-website-hosting";
import { HostedZoneStack } from "./hosted-zone-stack";
import { CertificateStack } from "./certificate-stack";
import { DnsRecordsStack } from "./dns-records-stack";

interface RootStackProps extends cdk.StackProps {
    appName: string;
    domainName: string;
    subdomain: string;
    apiSubDomain: string;
    frontendBuildPath: string;
    cloudFrontFunctionFilePath: string;
    stageName?: string;
}

export class RootStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: RootStackProps) {
        super(scope, id, props);

        // email stack (will go here)

        // create DNS stack 
        const dnsStack = new HostedZoneStack(this, `${props.appName}DnsStack`, {
            domainName: props.domainName,
            env: props.env,
        });

        // create Certificate stack
        const certificateStack = new CertificateStack(this, `${props.appName}CertificateStack`, {
            domainName: props.domainName,
            hostedZone: dnsStack.hostedZone,
            subdomain: props.subdomain,
            apiSubDomain: props.apiSubDomain,
            env: props.env,
        });

        const dynamodbStack = new DynamoDBStack(this, `${props.appName}DynamoDBStack`, {
            appName: props.appName,
            env: props.env,
        });

        // auth stack (will go here)

        const computeStack = new ComputeStack(this, `${props.appName}ComputeStack`, {
            translationsTable: dynamodbStack.translationsTable,
            appName: props.appName,
            env: props.env,
        });

        const apiStack = new ApiStack(this, `${props.appName}ApiStack`, {
            translationsTable: dynamodbStack.translationsTable,
            translateLambda: computeStack.translateLambda,
            getTranslationsLambda: computeStack.getTranslationsLambda,
            domainName: props.domainName,
            apiSubDomain: props.apiSubDomain,
            certificate: certificateStack.certificate,
            env: props.env,
        });

        const staticWebsiteHostingStack = new StaticWebsiteHostingStack(this, `${props.appName}StaticWebsiteHostingStack`, {
            domainName: props.domainName,
            subdomain: props.subdomain,
            restApi: apiStack.restApi,
            frontendBuildPath: props.frontendBuildPath,
            cloudFrontFunctionFilePath: props.cloudFrontFunctionFilePath,
            apiSubDomain: props.apiSubDomain,
            hostedZone: dnsStack.hostedZone,
            certificate: certificateStack.certificate,
            env: props.env,
        });

        // DNS records stack
        new DnsRecordsStack(this, `${props.appName}DnsRecordsStack`, {
            domainName: props.domainName,
            distribution: staticWebsiteHostingStack.distribution,
            restApi: apiStack.restApi,
            hostedZone: dnsStack.hostedZone,
            env: props.env,
        });
    }
}
