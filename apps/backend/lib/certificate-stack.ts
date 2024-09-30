import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

interface CertificateStackProps extends cdk.StackProps {
    domainName: string;
    hostedZone: route53.IHostedZone;
    subdomain: string;
    apiSubDomain: string;
}

export class CertificateStack extends cdk.Stack {
    public readonly certificate: acm.Certificate;

    constructor(scope: Construct, id: string, props: CertificateStackProps) {
        super(scope, id, props);

        this.certificate = new acm.Certificate(this, "StaticWebsiteCertificate", {
            domainName: props.domainName,
            subjectAlternativeNames: [
                `${props.subdomain}.${props.domainName}`, // e.g. app.verbo.com
                `*.${props.domainName}`, // e.g. *.verbo.com
                `${props.apiSubDomain}.${props.domainName}`, // e.g. api.verbo.com
            ],
            validation: acm.CertificateValidation.fromDns(props.hostedZone),
        });
    }
}
