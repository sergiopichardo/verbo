import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

interface ComputeStackProps extends cdk.StackProps {}

export class ComputeStack extends cdk.Stack {
  private readonly _translationLambda: lambdaNodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    this._translationLambda = this._createTranslationLambda();

  }

  public get translationLambda(): lambdaNodejs.NodejsFunction {
    return this._translationLambda;
  }

  private _createTranslationLambda(): lambdaNodejs.NodejsFunction {

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
}