import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";

interface VerboStackProps extends cdk.StackProps {
  translationsTable: dynamodb.TableV2;  
}

export class VerboStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: VerboStackProps) {
    super(scope, id, props);

    const translationLambda = this.createTranslationLambda(props);
    this.createTranslationRestApi(translationLambda);
  }

  private createTranslationLambda(
    props: VerboStackProps
  ): lambdaNodejs.NodejsFunction {

    const currentDir = __dirname;
    const projectRoot = path.resolve(currentDir, '..', '..', '..');
    const lambdasDirPath = path.join(projectRoot, 'packages', 'lambdas');

    const translateLambdaPath = path.resolve(
      lambdasDirPath,
      'translate',
      'index.ts'
    );

    console.log('Lambda path:', translateLambdaPath);

    const translationIamPolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    const translationLambda = new lambdaNodejs.NodejsFunction(
      this,
      "translateToLanguage",
      {
        entry: translateLambdaPath,
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        initialPolicy: [translationIamPolicy],
        bundling: {
          externalModules: ["@aws-sdk/*"],
          nodeModules: ["@aws-sdk/client-translate"],
        }
      }
    );

    return translationLambda;
  }

  private createTranslationRestApi(
    translationLambda: lambdaNodejs.NodejsFunction
  ): apigateway.RestApi {
    const restApi = new apigateway.RestApi(this, "translateToLanguageRestApi", {
      description: "This service translates text from one language to another.",
    });

    const translateResource = restApi.root.addResource("translate");
    translateResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(translationLambda)
    );

    new cdk.CfnOutput(this, "restApiUrl", {
      value: restApi.url,
      exportName: "restApiUrl",
    });

    return restApi;
  }
}
