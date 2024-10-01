import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import { capitalize } from "lodash";


interface RestApiStackProps extends cdk.StackProps {
  translationsTable: dynamodb.TableV2;
  translateLambda: lambdaNodejs.NodejsFunction;
  getTranslationsLambda: lambdaNodejs.NodejsFunction;
  domainName: string;
  apiSubDomain: string;
  certificate: acm.Certificate;
}

type ApiGatewayMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export class RestApiStack extends cdk.Stack {
  public readonly restApi: apigateway.RestApi;


  constructor(scope: Construct, id: string, props: RestApiStackProps) {
    super(scope, id, props);

    this.restApi = this.createRestApi("translateToLanguageRestApi", props);

    this._addResource({
      restApi: this.restApi,
      endpoint: "translations",
      handlers: [
        {
          httpMethod: "GET",
          lambda: props.getTranslationsLambda
        },
        {
          httpMethod: "POST",
          lambda: props.translateLambda
        }
      ]
    });

    this._exportOutput({
      value: `https://${props.apiSubDomain}.${props.domainName}`,
      exportName: "restApiUrl",
    });
  }

  private createRestApi(
    restApiName: string,
    props: RestApiStackProps
  ): apigateway.RestApi {

    const restApi = new apigateway.RestApi(this, restApiName, {
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

    return restApi;
  }

  private _addResource(input: {
    restApi: apigateway.RestApi,
    endpoint: string,
    handlers: {
      httpMethod: ApiGatewayMethods;
      lambda: lambdaNodejs.NodejsFunction;
    }[]
  }) {
    const endpoint = input.restApi.root.addResource(input.endpoint);

    input.handlers.forEach((handler) => {
      endpoint.addMethod(
        handler.httpMethod,
        new apigateway.LambdaIntegration(handler.lambda)
      );
    });
  }

  private _exportOutput({ value, exportName }: { value: string, exportName: string }) {
    new cdk.CfnOutput(this, `${capitalize(exportName)}`, {
      value,
      exportName,
    });
  }
}
