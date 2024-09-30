import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

interface DnsRecordsStackProps extends cdk.StackProps {
    distribution: cloudfront.Distribution;
    restApi: apigateway.RestApi;
    hostedZone: route53.IHostedZone;
    domainName: string;
}

export class DnsRecordsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: DnsRecordsStackProps) {
        super(scope, id, props);

        // Create A record for the main domain
        new route53.ARecord(this, "MainDomainRecord", {
            zone: props.hostedZone,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(props.distribution)),
        });

        // Create A record for the www subdomain
        new route53.ARecord(this, "WwwSubdomainRecord", {
            zone: props.hostedZone,
            recordName: `www.${props.domainName}`,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(props.distribution)),
        });

        // Create A record for the API subdomain
        new route53.ARecord(this, "ApiSubdomainRecord", {
            zone: props.hostedZone,
            recordName: `api.${props.domainName}`,
            target: route53.RecordTarget.fromAlias(new route53Targets.ApiGateway(props.restApi)),
        });
    }
}
