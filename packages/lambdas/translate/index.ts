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


import { translationService } from "/opt/nodejs/translation-services"
import { gateway, exceptions } from '/opt/nodejs/utils';


const TRANSLATIONS_TABLE_NAME = process.env.TRANSLATIONS_TABLE_NAME as string;
const TRANSLATIONS_PARTITION_KEY = process.env.TRANSLATIONS_PARTITION_KEY as string;


if (!TRANSLATIONS_TABLE_NAME) {
  throw new exceptions.MissingEnvironmentVariableException("TRANSLATIONS_TABLE_NAME");
}

if (!TRANSLATIONS_PARTITION_KEY) {
  throw new exceptions.MissingEnvironmentVariableException("TRANSLATIONS_PARTITION_KEY");
}

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent, 
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      throw new exceptions.MissingRequestBodyException();
    }

    const body = JSON.parse(event.body) as TranslationRequest;
    
    if (!body.sourceLanguageCode) {
      throw new exceptions.MissingParametersException("sourceLanguageCode is missing");
    }

    if (!body.targetLanguageCode) {
      throw new exceptions.MissingParametersException("targetLanguageCode is missing");
    }

    if (!body.sourceText) {
      throw new exceptions.MissingParametersException("sourceText is missing");
    }
    
    const { sourceLanguageCode, targetLanguageCode, sourceText } = body;

    const translatedText = await translationService.translateText(sourceLanguageCode, targetLanguageCode, sourceText)

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

    await translationService.saveTranslation(tableObj, TRANSLATIONS_TABLE_NAME);

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
