import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

interface DynamodbStackProps extends cdk.NestedStackProps {
    appName: string;
}

export class DynamodbStack extends cdk.NestedStack {
    public readonly translationsTable: dynamodb.TableV2;

    constructor(scope: Construct, id: string, props: DynamodbStackProps) {
        super(scope, id, props);

        this.translationsTable = this._createTranslationsTable(props);
    }

    private _createTranslationsTable(props: DynamodbStackProps): dynamodb.TableV2 {
        const _table = new dynamodb.TableV2(this, `${props.appName}TranslationsTable`, {
            partitionKey: {
                name: 'username', // is used to identify all the requests that belong to a user
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'requestId', // the requestId of the lambda function request (which is unique and identifies each translation)
                type: dynamodb.AttributeType.STRING
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billing: dynamodb.Billing.onDemand()
        });
        return _table;
    }

}