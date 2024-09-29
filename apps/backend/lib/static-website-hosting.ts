import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";

interface StaticWebsiteHostingStackProps extends cdk.StackProps {
    frontendBuildPath: string;
    domainName: string;
    subdomain: string;
}

export class StaticWebsiteHostingStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: StaticWebsiteHostingStackProps) {
        super(scope, id, props);

        const hostedZone = this._importHostedZone(props);
        const certificate = this._createTLSCertificate(props, hostedZone);
        const bucket = this._createBucket();
        const distribution = this._createDistribution(bucket, certificate, props);
        this._createDeployment(bucket, distribution, props);
    }

    private _createTLSCertificate(props: StaticWebsiteHostingStackProps, hostedZone: route53.IHostedZone): acm.Certificate {
        return new acm.Certificate(this, "StaticWebsiteCertificate", {
            domainName: props.domainName,
            subjectAlternativeNames: [`${props.subdomain}.${props.domainName}`, `*.${props.domainName}`],
            validation: acm.CertificateValidation.fromDns(hostedZone),
        });
    }

    private _importHostedZone(props: StaticWebsiteHostingStackProps): route53.IHostedZone {
        return route53.HostedZone.fromLookup(this, "StaticWebsiteHostedZone", {
            domainName: props.domainName,
        });
    }

    private _configureRoute53Records(
        hostedZone: route53.IHostedZone, 
        distribution: cloudfront.Distribution, 
        props: StaticWebsiteHostingStackProps
    ): void {
        // Creates two domain names e.g. `domainname.com` and `www.domainname.com` 
        // that point to the same CloudFront distribution.

        new route53.ARecord(this, "DomainNameRecord", {
            zone: hostedZone,
            recordName: props.domainName,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
        });

        new route53.ARecord(this, "SubdomainRecord", {
            zone: hostedZone,
            recordName: `${props.subdomain}.${props.domainName}`,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
        });

    }

    private _createBucket(): s3.Bucket {
        return new s3.Bucket(this, "StaticWebsiteBucket", {
            publicReadAccess: false,
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
    }

    private _createDeployment(
        destinationBucket: s3.Bucket, 
        distribution: cloudfront.Distribution,
        props: StaticWebsiteHostingStackProps
    ): s3Deployment.BucketDeployment {        

        return new s3Deployment.BucketDeployment(this, "StaticWebsiteDeployment", {
            sources: [s3Deployment.Source.asset(props.frontendBuildPath)],
            distribution,
            distributionPaths: ["/*"], // The file paths to invalidate in the CloudFront distribution cache.
            destinationBucket,
            retainOnDelete: false,
        });
    }

    private _createDistribution(
        originBucket: s3.Bucket, 
        certificate: acm.Certificate, 
        props: StaticWebsiteHostingStackProps
    ): cloudfront.Distribution {

        const distribution = new cloudfront.Distribution(this, "StaticWebsiteDistribution", {
            defaultRootObject: "index.html",
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: "/404.html",
                },
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: "/404.html",
                },
            ],
            domainNames: [`${props.subdomain}.${props.domainName}`, props.domainName],
            defaultBehavior: {
                origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(originBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            certificate,
        });

        new cdk.CfnOutput(this, "StaticWebsiteDistributionDomain", {
            value: `https://${distribution.domainName}`,
            exportName: "staticWebsiteDistributionDomain",
        });

        return distribution;
    }
}