import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";

interface StaticWebsiteHostingStackProps extends cdk.StackProps {
    frontendBuildPath: string;
}

export class StaticWebsiteHostingStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: StaticWebsiteHostingStackProps) {
        super(scope, id, props);

        const bucket = this._createBucket();
        const distribution = this._createDistribution(bucket);
        this._createDeployment(bucket, distribution, props);
    }

    private _createBucket(): s3.Bucket {
        const _bucket = new s3.Bucket(this, "StaticWebsiteBucket", {
            publicReadAccess: false,
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        return _bucket;
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

    private _createDistribution(originBucket: s3.Bucket): cloudfront.Distribution {
        const distribution = new cloudfront.Distribution(this, "StaticWebsiteDistribution", {
            defaultRootObject: "index.html",
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: "/404.html",
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: "/404.html",
                },
            ],
            defaultBehavior: {
                origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(originBucket),
            },
        });

        new cdk.CfnOutput(this, "StaticWebsiteDistributionDomain", {
            value: `https://${distribution.domainName}`,
            exportName: "staticWebsiteDistributionDomain",
        });

        return distribution;
    }
}