import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";

interface ApiStackProps extends cdk.StackProps {
  translationsTable: dynamodb.TableV2;  
  translationLambda: lambdaNodejs.NodejsFunction;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.createTranslationRestApi(props);
  }

  private createTranslationRestApi(
    props: ApiStackProps
  ): apigateway.RestApi {
    const restApi = new apigateway.RestApi(this, "translateToLanguageRestApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    props.translationsTable.grantReadWriteData(props.translationLambda);

    const translateResource = restApi.root.addResource("translate");
    translateResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(props.translationLambda)

    );

    new cdk.CfnOutput(this, "restApiUrl", {
      value: restApi.url.slice(0, -1), // removes the trailing '/'
      exportName: "restApiUrl",
    });

    return restApi;
  }
}
