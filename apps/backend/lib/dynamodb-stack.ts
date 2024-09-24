import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";

interface DynamoDBStackProps extends cdk.StackProps {
    appName: string;
}

export class DynamoDBStack extends cdk.Stack {
  private readonly _translationsTable: dynamodb.TableV2;

  constructor(scope: Construct, id: string, props: DynamoDBStackProps) {
    super(scope, id, props);

    this._translationsTable = this._createTranslationsTable();
  }

  public get translationsTable(): dynamodb.TableV2 {
    return this._translationsTable;
  }

  private _createTranslationsTable(): dynamodb.TableV2 {
    return new dynamodb.TableV2(this, `TranslationsTable`, {
        partitionKey: { 
            name: 'requestId', 
            type: dynamodb.AttributeType.STRING 
        },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}