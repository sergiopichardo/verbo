import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";

interface ApiStackProps extends cdk.StackProps {
  translationsTable: dynamodb.TableV2;  
  translateLambda: lambdaNodejs.NodejsFunction;
  getTranslationsLambda: lambdaNodejs.NodejsFunction;
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

    const translationsResource = restApi.root.addResource("translations");

    translationsResource
    .addMethod(
      "POST",
      new apigateway.LambdaIntegration(props.translateLambda)
    );

    translationsResource
    .addMethod(
      "GET",
      new apigateway.LambdaIntegration(props.getTranslationsLambda)
    );

    new cdk.CfnOutput(this, "restApiUrl", {
      value: restApi.url.slice(0, -1), // removes the trailing '/'
      exportName: "restApiUrl",
    });

    return restApi;
  }
}
