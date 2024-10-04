import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

interface DnsRecordStackProps extends cdk.NestedStackProps {
    domainName: string;
    hostedZone: route53.IHostedZone;
    restApi: apigateway.RestApi;
    distribution: cloudfront.Distribution;
}

export class DnsRecordStack extends cdk.NestedStack {
    constructor(scope: Construct, id: string, props: DnsRecordStackProps) {
        super(scope, id, props);

        new route53.ARecord(this, "MainDomainRecord", {
            zone: props.hostedZone,
            recordName: props.domainName,
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
