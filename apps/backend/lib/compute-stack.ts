import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

interface ComputeStackProps extends cdk.StackProps {
  translationsTable: dynamodb.TableV2;
}

export class ComputeStack extends cdk.Stack {
  private readonly _translationLambda: lambdaNodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    this._translationLambda = this._createTranslationLambda(props);

  }

  public get translationLambda(): lambdaNodejs.NodejsFunction {
    return this._translationLambda;
  }

  private _createTranslationLambda(props: ComputeStackProps): lambdaNodejs.NodejsFunction {

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

    const translationTablePolicy = new iam.PolicyStatement({
      actions: [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query",
      ],
      resources: [props.translationsTable.tableArn],
    });

    const translationLambda = new lambdaNodejs.NodejsFunction(
      this,
      "translateToLanguage",
      {
        entry: translateLambdaPath,
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        initialPolicy: [
          translationIamPolicy, 
          translationTablePolicy
        ],
        bundling: {
          externalModules: ["@aws-sdk/*"],
          nodeModules: ["@aws-sdk/client-translate"],
        },
        environment: {
          TRANSLATIONS_TABLE_NAME: props.translationsTable.tableName,
          TRANSLATIONS_PARTITION_KEY: "requestId",
        },
      }
    );

    return translationLambda;
  }
}