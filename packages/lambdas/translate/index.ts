import { 
  PutCommand, 
  PutCommandInput 
} from "@aws-sdk/lib-dynamodb";

import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyHandler, 
  APIGatewayProxyResult, 
  Context,
} from "aws-lambda";

import {
  TranslateClient,
  TranslateTextCommand,
  TranslateTextCommandInput,
  TranslateTextCommandOutput,
} from "@aws-sdk/client-translate";

import { 
  TranslationDBObject,
  TranslationRequest, 
  TranslationResponse 
} from "@verbo/shared-types";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const translateClient = new TranslateClient({});

const {
  TRANSLATIONS_TABLE_NAME, 
  TRANSLATIONS_PARTITION_KEY
} = process.env;

if (!TRANSLATIONS_TABLE_NAME) {
  throw new Error("Missing required TRANSLATIONS_TABLE_NAME environment variable");
}

if (!TRANSLATIONS_PARTITION_KEY) {
  throw new Error("Missing required TRANSLATIONS_PARTITION_KEY environment variable");
}

const translateText = async (sourceLanguageCode: string, targetLanguageCode: string, text: string): Promise<string> => {
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

const sendResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(body),
  };
};

const saveTranslation = async (translation: TranslationDBObject) => {
  try {
    const params: PutCommandInput = {
      TableName: TRANSLATIONS_TABLE_NAME,
      Item: translation,
    };

    const command = new PutCommand(params);

    await ddbDocClient.send(command);
  } catch (error) {
    console.error('Error saving translation to DynamoDB:', error);
    throw error;
  }
};

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent, 
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      throw new Error("No body provided");
    }

    const body = JSON.parse(event.body) as TranslationRequest;
    
    if (!body.sourceLanguageCode || !body.targetLanguageCode || !body.sourceText) {
      throw new Error("Missing required properties in the request body");
    }
    
    const { sourceLanguageCode, targetLanguageCode, sourceText } = body;

    const translatedText = await translateText(sourceLanguageCode, targetLanguageCode, sourceText);

    const translationResponse: TranslationResponse = {
      timestamp: new Date().toISOString(),
      targetText: translatedText,
    };

    const tableObj: TranslationDBObject = {
      requestId: context.awsRequestId, // alternatively we could use randomUUID() from node:crypto built-in module
      sourceLanguageCode: sourceLanguageCode,
      targetLanguageCode: targetLanguageCode,
      sourceText: sourceText,
      targetText: translatedText,
      timestamp: new Date().toISOString(),
    };

    await saveTranslation(tableObj);

    return sendResponse(200, translationResponse);

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "UnsupportedLanguagePairException") {
        return sendResponse(400, {
          errorMessage: "Unsupported language pair",
        });
      }
    } 
    
    return sendResponse(500, {
      message: "Unknown error",
      // error: error,
    });
  }
};
