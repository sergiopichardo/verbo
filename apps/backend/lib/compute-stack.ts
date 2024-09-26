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
  public readonly translateLambda: lambdaNodejs.NodejsFunction;
  public readonly getTranslationsLambda: lambdaNodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    // Lambda functions
    this.translateLambda = this._createTranslateToLanguageLambda('translate', props);
    this.getTranslationsLambda = this._createGetTranslationsLambda('getTranslations', props);
  }

  private _createGetTranslationsLambda(
    lambdaName: string,
    props: ComputeStackProps,
  ): lambdaNodejs.NodejsFunction {

    const getTranslationsLambda = new lambdaNodejs.NodejsFunction(
      this,
      lambdaName,
      {
        entry: this._getLambdaPath(lambdaName),
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        initialPolicy: this._getPolicies(lambdaName, props),
        environment: {
          TRANSLATIONS_TABLE_NAME: props.translationsTable.tableName,
        },
      }
    );

    return getTranslationsLambda;
  } 

  private _createTranslateToLanguageLambda(
    lambdaName: string,
    props: ComputeStackProps,
  ): lambdaNodejs.NodejsFunction {


    const translationLambda = new lambdaNodejs.NodejsFunction(
      this,
      lambdaName,
      {
        entry: this._getLambdaPath(lambdaName),
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        initialPolicy: this._getPolicies(lambdaName, props),
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

  private _getLambdaPath(lambdaName: string): string {
    const currentDir = __dirname;
    const projectRoot = path.resolve(currentDir, '..', '..', '..');
    const lambdasDirPath = path.join(projectRoot, 'packages', 'lambdas');

    return path.resolve(
      lambdasDirPath,
      lambdaName,
      'index.ts'
    );
  }

  private _getPolicies(lambdaName: string, props: ComputeStackProps): iam.PolicyStatement[] {
    // Policies 
    const translationServicePolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    const getTranslationsTablePolicy = new iam.PolicyStatement({
      actions: [
        "dynamodb:Scan",
      ],
      resources: [props.translationsTable.tableArn],
    });

    const addTranslationsTablePolicy = new iam.PolicyStatement({
      actions: [
      "dynamodb:PutItem",
      ],
      resources: [props.translationsTable.tableArn],
    });
    
    const policiesMap: Record<string, iam.PolicyStatement[]> = {
      translate: [translationServicePolicy, addTranslationsTablePolicy],
      getTranslations: [translationServicePolicy, getTranslationsTablePolicy],
    }

    if (!(lambdaName in policiesMap)) {
      throw new Error(`Lambda ${lambdaName} not found in policies map`);
    }

    return policiesMap[lambdaName];
  }
}