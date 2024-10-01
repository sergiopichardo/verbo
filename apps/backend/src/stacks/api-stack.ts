import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";


interface RestApiStackProps extends cdk.StackProps {
  domainName: string;
  apiSubDomain: string;
  certificate: acm.Certificate;
}

export type ApiGatewayMethods = "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

export class RestApiStack extends cdk.Stack {
  private readonly _restApi: apigateway.RestApi;


  constructor(scope: Construct, id: string, props: RestApiStackProps) {
    super(scope, id, props);

    this._restApi = this._createRestApi("translationsApi", props);
  }

  public get restApi() {
    return this._restApi;
  }

  private _createRestApi(
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
}
