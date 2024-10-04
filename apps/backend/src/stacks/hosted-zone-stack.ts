import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

interface HostedZoneStackProps extends cdk.NestedStackProps {
    domainName: string;
}

export class HostedZoneStack extends cdk.NestedStack {
    public readonly hostedZone: route53.IHostedZone;

    constructor(scope: Construct, id: string, props: HostedZoneStackProps) {
        super(scope, id, props);

        this.hostedZone = this.importHostedZone(props);
    }

    private importHostedZone(props: HostedZoneStackProps): route53.IHostedZone {
        return route53.HostedZone.fromLookup(this, "StaticWebsiteHostedZone", {
            domainName: props.domainName,
        });
    }
}
