import { TranslationDBObject } from "@verbo/shared-types"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, PutCommandInput, ScanCommand, ScanCommandInput, DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";


export const saveTranslation = async (
    translation: TranslationDBObject,
    translationTableName: string,
) => {

    const client = DynamoDBDocumentClient.from(new DynamoDBClient());

    try {

        const createTranslationParams: PutCommandInput = {
            TableName: translationTableName,
            Item: translation
        }

        const command = new PutCommand(createTranslationParams);

        await client.send(command);
        
    } catch (error) {
        throw error;
    }
}


export const getTranslations = async (
    translationTableName: string,
) => {

    const client = DynamoDBDocumentClient.from(new DynamoDBClient());

    try {

        const getTranslationsParams: ScanCommandInput = {
            TableName: translationTableName,
        }

        const command = new ScanCommand(getTranslationsParams);

        const response = await client.send(command);

        if (!response.Items) {
            return []
        }

        return response.Items as TranslationDBObject[];

    } catch (error) {
        throw error;
    }
}

export const deleteTranslation = async (
    translationTableName: string,
    translationId: string,
) => {

    const client = DynamoDBDocumentClient.from(new DynamoDBClient());

    try {

        const deleteTranslationParams: DeleteCommandInput = {
            TableName: translationTableName,
            Key: {
                id: translationId
            }
        }

        const command = new DeleteCommand(deleteTranslationParams);


        await client.send(command);

    } catch (error) {
        throw error;
    }
}

