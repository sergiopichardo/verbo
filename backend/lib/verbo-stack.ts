import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";

interface VerboStackProps extends cdk.StackProps {}

export class VerboStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: VerboStackProps) {
    super(scope, id, props);

    const translationLambda = this.createTranslationLambda(props);
    this.createTranslationRestApi(translationLambda);
  }

  private createTranslationLambda(
    props: VerboStackProps
  ): lambdaNodejs.NodejsFunction {

    const translationIamPolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    const translationLambda = new lambdaNodejs.NodejsFunction(
      this,
      "translateToLanguage",
      {
        entry: path.join(__dirname, "../lambdas/translateToLanguage/index.ts"),
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        initialPolicy: [
          translationIamPolicy,
        ],
      }
    );

    return translationLambda;
  }


  private createTranslationRestApi(
    translationLambda: lambdaNodejs.NodejsFunction
  ): apigateway.RestApi {
    const restApi = new apigateway.RestApi(this, "translateToLanguageRestApi");

    restApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(translationLambda)
    );

    return restApi;
  }
}
