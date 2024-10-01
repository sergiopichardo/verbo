import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

interface ComputeStackProps extends cdk.StackProps {
  translationsTable: dynamodb.TableV2;
  appName: string;
}


export class ComputeStack extends cdk.Stack {
  public readonly translateLambda: lambdaNodejs.NodejsFunction;
  public readonly getTranslationsLambda: lambdaNodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    // layers 
    const utilsLambdaLayer = this._createLambdaLayer('utils');

    // lambdas
    this.translateLambda = this._createTranslateToLanguageLambda(
      'create-translation',
      props,
      [utilsLambdaLayer]
    );

    this.getTranslationsLambda = this._createGetTranslationsLambda(
      'get-translations',
      props,
      [utilsLambdaLayer]
    );
  }


  private _createLambdaLayer(layerName: string): lambda.LayerVersion {
    const layerPath = this._getLambdaLayerPath(layerName);

    return new lambda.LayerVersion(
      this,
      `${layerName}LambdaLayer`,
      {
        code: lambda.AssetCode.fromAsset(layerPath),
        description: `${layerName} Lambda Layer`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      }
    );
  }



  private _createGetTranslationsLambda(
    lambdaName: string,
    props: ComputeStackProps,
    layers: lambda.LayerVersion[],
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
        layers: layers,
      }
    );

    return getTranslationsLambda;
  }


  private _createTranslateToLanguageLambda(
    lambdaName: string,
    props: ComputeStackProps,
    layers: lambda.LayerVersion[],
  ): lambdaNodejs.NodejsFunction {

    if (!props.translationsTable) {
      throw new Error("Missing required translations table");
    }

    const translationLambda = new lambdaNodejs.NodejsFunction(
      this,
      lambdaName,
      {
        entry: this._getLambdaPath(lambdaName),
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "handler",
        initialPolicy: this._getPolicies(lambdaName, props),
        // this is commented out because I'll do this in a cleaner way later on
        // bundling: {
        // Important: We're specifying with this lambda layer path that the lambda layer code are external modules 
        // so that the bundler doesn't try to bundle them into the lambda. Otherwise, the lambda layer code will be 
        // duplicated in each lambda function.
        // these reduces the size of the lambda function and speeds up the lambda function execution.
        // externalModules: ["/opt/nodejs/utils"],
        // },
        environment: {
          TRANSLATIONS_TABLE_NAME: props.translationsTable.tableName,
          TRANSLATIONS_PARTITION_KEY: "requestId",
        },
        layers: layers,
      }
    );

    return translationLambda;
  }

  private _getLambdaLayerPath(layerName: string): string {
    const currentDir = __dirname;
    const projectRoot = path.resolve(currentDir, '..', '..', '..', '..');
    const layersDirPath = path.join(projectRoot, 'packages', 'lambda-layers');

    return path.resolve(layersDirPath, layerName);
  }

  private _getLambdaPath(lambdaName: string): string {
    const currentDir = __dirname;
    const projectRoot = path.resolve(currentDir, '..', '..', '..', '..');
    const lambdasDirPath = path.join(projectRoot, 'packages', 'lambdas');

    return path.resolve(
      lambdasDirPath,
      lambdaName,
      'index.ts'
    );
  }

  private _getPolicies(lambdaName: string, props: ComputeStackProps): iam.PolicyStatement[] {
    // Policies 
    const policies = {
      translationService: new iam.PolicyStatement({
        actions: ["translate:TranslateText"],
        resources: ["*"],
      }),

      getTranslationsTable: new iam.PolicyStatement({
        actions: [
          "dynamodb:Scan",
        ],
        resources: [props.translationsTable.tableArn],
      }),

      addTranslationsTable: new iam.PolicyStatement({
        actions: [
          "dynamodb:PutItem",
        ],
        resources: [props.translationsTable.tableArn],
      }),
    };

    const policiesMap: Record<string, iam.PolicyStatement[]> = {
      'create-translation': [
        policies.translationService,
        policies.addTranslationsTable
      ],
      'get-translations': [
        policies.getTranslationsTable
      ],
    }

    if (!(lambdaName in policiesMap)) {
      throw new Error(`Lambda ${lambdaName} not found in policies map`);
    }

    return policiesMap[lambdaName];
  }
}