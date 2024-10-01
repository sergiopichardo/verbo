import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";

interface RestApiConstructProps { }

type ApiGatewayMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export class RestApiConstruct extends Construct {
    public readonly restApi: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: RestApiConstructProps) {
        super(scope, id);
    }
}


