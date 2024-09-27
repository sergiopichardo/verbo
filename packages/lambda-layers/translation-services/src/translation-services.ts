
import { 
  TranslationDBObject,
  TranslationRequest,
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

  
class TranslationService {
  constructor(
    private readonly translationsTableName: string,
    private readonly translationClient: TranslateClient,
    private readonly ddbDocClient: DynamoDBDocumentClient,
  ) {}

  async translateText(input: TranslationRequest): Promise<string> {
    const inputParams: TranslateTextCommandInput = {
      SourceLanguageCode: input.sourceLanguageCode,
      TargetLanguageCode: input.targetLanguageCode,
      Text: input.sourceText,
    };

    const translateCommand = new TranslateTextCommand(inputParams);
    const result: TranslateTextCommandOutput = await this.translationClient.send(translateCommand);

    if (!result.TranslatedText) {
      throw new Error("Unable to translate text");
    }
    
    return result.TranslatedText;

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in translateText():', error.message);
      throw error;
    } else {
      console.error('Error in translateText():', error);
      throw error;
    }
  }

  async saveTranslation(translation: TranslationDBObject): Promise<void> {
    try {
      const params: PutCommandInput = {
        TableName: this.translationsTableName,
        Item: translation,
      };
  
      const command = new PutCommand(params);
  
      await this.ddbDocClient.send(command);
    } catch (error) {
      console.error('Error saving translation to DynamoDB:', error);
      throw error;
    }
  }

  async getTranslations(): Promise<TranslationDBObject[]> {
    try {
      const params: ScanCommandInput = {
        TableName: this.translationsTableName,
      };
  
      const command = new ScanCommand(params);
      const result: ScanCommandOutput = await this.ddbDocClient.send(command);
  
      if (!result.Items) {
        throw new Error("No translations found");
      }
  
      // Sort the items by createdAt in descending order
      const sortedItems = result.Items.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  
      return sortedItems as TranslationDBObject[];
  
    } catch (error) {
      console.error('Error getting translations from DynamoDB:', error);
      throw error;
    }   
  }
}

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const translateClient = new TranslateClient({});

export const translationService = new TranslationService(
  process.env.TRANSLATIONS_TABLE_NAME as string,
  translateClient,
  ddbDocClient,
);

