import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";

interface ApiStackProps extends cdk.StackProps {
  translationsTable: dynamodb.TableV2;
  translateLambda: lambdaNodejs.NodejsFunction;
  getTranslationsLambda: lambdaNodejs.NodejsFunction;
  domainName: string;
  apiSubDomain: string;
  certificate: acm.Certificate;
}

export class ApiStack extends cdk.Stack {
  public readonly restApi: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.restApi = this.createTranslationRestApi(props);
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
      domainName: {
        domainName: `${props.apiSubDomain}.${props.domainName}`,
        endpointType: apigateway.EndpointType.REGIONAL,
        certificate: props.certificate,
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
      value: `https://${props.apiSubDomain}.${props.domainName}`,
      exportName: "restApiUrl",
    });

    // new cdk.CfnOutput(this, "restApiUrl", {
    //   value: restApi.url.slice(0, -1), // removes the trailing '/'
    //   exportName: "restApiUrl",
    // });

    return restApi;
  }
}
