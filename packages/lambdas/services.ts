
import { 
  TranslationDBObject,
} from "@verbo/shared-types";

import { 
  PutCommand, 
  PutCommandInput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput
} from "@aws-sdk/lib-dynamodb";

import {
    TranslateClient,
    TranslateTextCommand,
    TranslateTextCommandInput,
    TranslateTextCommandOutput,
} from "@aws-sdk/client-translate";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const translateClient = new TranslateClient({});

export const translateText = async (
  sourceLanguageCode: string, 
  targetLanguageCode: string, 
  text: string
): Promise<string> => {
  try {
    const inputParams: TranslateTextCommandInput = {
      SourceLanguageCode: sourceLanguageCode,
      TargetLanguageCode: targetLanguageCode,
      Text: text,
    };

    const translateCommand = new TranslateTextCommand(inputParams);
    const result: TranslateTextCommandOutput = await translateClient.send(translateCommand);

    if (!result.TranslatedText) {
      throw new Error("Unable to translate text");
    }
    
    return result.TranslatedText;
  } catch (error) {
    console.error('Error in translateText():', error);
    throw error;
  }
};
  


export const saveTranslation = async (
  translation: TranslationDBObject,
  translationsTableName: string
) => {
  try {
    const params: PutCommandInput = {
      TableName: translationsTableName,
      Item: translation,
    };

    const command = new PutCommand(params);

    await ddbDocClient.send(command);
  } catch (error) {
    console.error('Error saving translation to DynamoDB:', error);
    throw error;
  }
};


export const getTranslations = async (
  translationsTableName: string
) => {
  try {
    const params: ScanCommandInput = {
      TableName: translationsTableName,
    };

    const command = new ScanCommand(params);
    const result: ScanCommandOutput = await ddbDocClient.send(command);

    if (!result.Items) {
      throw new Error("No translations found");
    }

    // Sort the items by createdAt in descending order
    const sortedItems = result.Items.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return sortedItems;

  } catch (error) {
    console.error('Error getting translations from DynamoDB:', error);
    throw error;
  }
}
