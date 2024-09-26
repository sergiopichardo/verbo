import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyHandler, 
  APIGatewayProxyResult, 
  Context,
} from "aws-lambda";

import { 
  TranslationDBObject,
  TranslationRequest, 
  TranslationResponse 
} from "@verbo/shared-types";

import { saveTranslation, translateText } from "../services";

import { gateway } from '/opt/nodejs/utils';


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

    await saveTranslation(tableObj, TRANSLATIONS_TABLE_NAME);

    return gateway.createSuccessJsonResponse(translationResponse);

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "UnsupportedLanguagePairException") {
        return gateway.createErrorJsonResponse("Unsupported language pair");
      }
    } 
    
    return gateway.createErrorJsonResponse("Unknown error");
  }
};
