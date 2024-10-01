import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
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
    cloudFrontFunctionFilePath: string;
    apiSubDomain: string;
    restApi: apigateway.RestApi;
    hostedZone: route53.IHostedZone;
    certificate: acm.Certificate;
}

export class StaticWebsiteHostingStack extends cdk.Stack {

    public readonly distribution: cloudfront.Distribution;
    public readonly originBucket: s3.Bucket;

    constructor(scope: Construct, id: string, props: StaticWebsiteHostingStackProps) {
        super(scope, id, props);

        this.originBucket = this._createBucket();
        const certificate = props.certificate;
        const cloudFrontFunction = this._createCloudFrontFunction(props);
        this.distribution = this._createDistribution(this.originBucket, certificate, cloudFrontFunction, props);
        this._createRecords(props);
    }

    private _createCloudFrontFunction(props: StaticWebsiteHostingStackProps): cloudfront.Function {
        return new cloudfront.Function(this, "StaticWebsiteCloudFrontFunction", {
            functionName: "StaticWebsiteCloudFrontFunction",
            code: cloudfront.FunctionCode.fromFile({
                filePath: props.cloudFrontFunctionFilePath,
            }),
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

    private _createDistribution(
        originBucket: s3.Bucket,
        certificate: acm.Certificate,
        cloudFrontFunction: cloudfront.Function,
        props: StaticWebsiteHostingStackProps
    ): cloudfront.Distribution {

        const distribution = new cloudfront.Distribution(this, "StaticWebsiteDistribution", {
            defaultRootObject: "index.html",
            // how cloudfront handles requests that are not successful
            errorResponses: [
                // This configuration handles HTTP 403 (Forbidden) errors:
                // - When a 403 error occurs, it's typically due to S3 blocking access
                // - Instead of showing the default 403 page, it redirects to a custom 404 page
                // - It changes the response status to 200 (OK) to prevent browser error messages
                // - This approach provides a better user experience for restricted or non-existent content
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: "/404.html",
                },
                // This configuration handles HTTP 404 (Not Found) errors:
                // - When a 404 error occurs, it means the requested resource was not found
                // - Instead of showing the default 404 page, it serves a custom 404.html page
                // - It changes the response status to 200 (OK) to prevent browser error messages
                // - This approach provides a more user-friendly experience for missing content
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
                functionAssociations: [{
                    function: cloudFrontFunction,
                    eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                }],
            },
            certificate,
        });

        new cdk.CfnOutput(this, "StaticWebsiteDistributionDomain", {
            value: `https://${distribution.domainName}`,
            exportName: "staticWebsiteDistributionDomain",
        });

        return distribution;
    }

    private _createRecords(props: StaticWebsiteHostingStackProps) {
        // Create A record for the main domain
        new route53.ARecord(this, "MainDomainRecord", {
            zone: props.hostedZone,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(this.distribution)),
        });

        // Create A record for the www subdomain
        new route53.ARecord(this, "WwwSubdomainRecord", {
            zone: props.hostedZone,
            recordName: `www.${props.domainName}`,
            target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(this.distribution)),
        });

        // Create A record for the API subdomain
        new route53.ARecord(this, "ApiSubdomainRecord", {
            zone: props.hostedZone,
            recordName: `api.${props.domainName}`,
            target: route53.RecordTarget.fromAlias(new route53Targets.ApiGateway(props.restApi)),
        });
    }
}
