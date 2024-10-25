import { ITranslationResult, ITranslationPrimaryKey } from "@verbo/shared-types"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    PutCommandInput,
    ScanCommand,
    ScanCommandInput,
    DeleteCommand,
    DeleteCommandInput,
    QueryCommand,
    QueryCommandInput,
    QueryCommandOutput
} from "@aws-sdk/lib-dynamodb";


export class TranslationsTable {
    private client: DynamoDBDocumentClient;
    private tableName: string;
    private partitionKey: string;
    private sortKey: string;

    constructor(tableName: string, partitionKey: string, sortKey: string) {
        this.client = DynamoDBDocumentClient.from(new DynamoDBClient());
        this.tableName = tableName;
        this.partitionKey = partitionKey;
        this.sortKey = sortKey;
    }

    async saveUserTranslation(translation: ITranslationResult) {
        try {
            const createTranslationParams: PutCommandInput = {
                TableName: this.tableName,
                Item: translation
            }

            const command = new PutCommand(createTranslationParams);
            await this.client.send(command);
        } catch (error) {
            throw error;
        }
    }

    async queryTranslationsByUsername({ username }: Pick<ITranslationPrimaryKey, "username">) {
        try {
            const getTranslationsParams: QueryCommandInput = {
                TableName: this.tableName,
                ExpressionAttributeNames: {
                    "#partitionKey": this.partitionKey
                },
                ExpressionAttributeValues: {
                    ":username": username
                },
                KeyConditionExpression: "#partitionKey = :username",
                ScanIndexForward: true,  // fetches in the order in which the results were inputted
            }

            const command = new QueryCommand(getTranslationsParams);
            const response: QueryCommandOutput = await this.client.send(command);

            if (!response.Items) {
                return []
            }

            return response.Items as ITranslationResult[];
        } catch (error) {
            throw error;
        }
    }

    async getAllPublicTranslations() {
        try {
            const getTranslationsParams: ScanCommandInput = {
                TableName: this.tableName,
            }

            const command = new ScanCommand(getTranslationsParams);
            const response = await this.client.send(command);

            if (!response.Items) {
                return []
            }

            return response.Items as ITranslationResult[];
        } catch (error) {
            throw error;
        }
    }

    async deleteTranslation(item: ITranslationPrimaryKey) {
        try {
            const deleteTranslationParams: DeleteCommandInput = {
                TableName: this.tableName,
                Key: {
                    [this.partitionKey]: item.username,
                    [this.sortKey]: item.requestId
                }
            }

            const command = new DeleteCommand(deleteTranslationParams);

            await this.client.send(command);
            return item;
        } catch (error) {
            throw error;
        }
    }
}
