import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
interface DynamodbStackProps extends cdk.StackProps {
    appName: string;
}

export class DynamodbStack extends cdk.Stack {
    public readonly translationsTable: dynamodb.TableV2;

    constructor(scope: Construct, id: string, props: DynamodbStackProps) {
        super(scope, id, props);

        this.translationsTable = this._createTranslationsTable(props);
    }

    private _createTranslationsTable(props: DynamodbStackProps): dynamodb.TableV2 {
        const _table = new dynamodb.TableV2(this, `${props.appName}TranslationsTable`, {
            partitionKey: {
                name: 'requestId',
                type: dynamodb.AttributeType.STRING
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            billing: dynamodb.Billing.onDemand()
        });
        return _table;
    }

}