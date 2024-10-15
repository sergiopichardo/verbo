import { Construct } from "constructs";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

interface StaticWebsiteDeploymentConstructProps {
    domainName: string;
    subdomain: string;
    frontendBuildPath: string;
    distribution: cloudfront.Distribution;
    destinationBucket: s3.Bucket;
}

export class StaticWebsiteDeploymentConstruct extends Construct {
    constructor(scope: Construct, id: string, props: StaticWebsiteDeploymentConstructProps) {
        super(scope, id);

        new s3Deployment.BucketDeployment(this, "StaticWebsiteDeployment", {
            sources: [s3Deployment.Source.asset(props.frontendBuildPath)],
            distribution: props.distribution,
            distributionPaths: ["/*"], // The file paths to invalidate in the CloudFront distribution cache.
            destinationBucket: props.destinationBucket,
            retainOnDelete: false,
            memoryLimit: 512,
        });
    }
}
