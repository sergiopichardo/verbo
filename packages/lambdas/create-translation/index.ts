import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import {
  TranslationDBObject,
  TranslationRequest,
  TranslationResponse,
} from "@verbo/shared-types";

import {
  gateway,
  exceptions,
  translationClient,
  translationsTable,
} from '/opt/nodejs/utils';


const TRANSLATIONS_TABLE_NAME = process.env.TRANSLATIONS_TABLE_NAME as string;

const TRANSLATIONS_SORT_KEY = process.env.TRANSLATIONS_SORT_KEY as string;

const TRANSLATIONS_PARTITION_KEY = process.env.TRANSLATIONS_PARTITION_KEY as string;

if (!TRANSLATIONS_TABLE_NAME) {
  throw new exceptions.MissingEnvironmentVariableException("TRANSLATIONS_TABLE_NAME");
}

if (!TRANSLATIONS_SORT_KEY) {
  throw new exceptions.MissingEnvironmentVariableException("TRANSLATIONS_SORT_KEY");
}

if (!TRANSLATIONS_PARTITION_KEY) {
  throw new exceptions.MissingEnvironmentVariableException("TRANSLATIONS_PARTITION_KEY");
}

const translationsTableClient = new translationsTable.TranslationsTable(
  TRANSLATIONS_TABLE_NAME,
  TRANSLATIONS_PARTITION_KEY,
  TRANSLATIONS_SORT_KEY
);

/**
 * Create a translation
 * @param event 
 * @param context 
 * @returns a translation JSON response
 */
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {

    const claims = event.requestContext.authorizer?.claims;

    if (!claims) {
      throw new Error("User is not authenticated");
    }

    const username = claims['cognito:username'];

    if (!username) {
      throw new Error("Username does not exist");
    }

    console.log("USERNAME:", username);

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

    const translatedText = await translationClient.translate({
      sourceLanguageCode,
      targetLanguageCode,
      sourceText
    });

    const translationResponse: TranslationResponse = {
      timestamp: new Date().toISOString(),
      targetText: translatedText,
    };

    const tableObj: TranslationDBObject = {
      username,
      requestId: context.awsRequestId,
      sourceLanguageCode,
      targetLanguageCode,
      sourceText,
      targetText: translatedText,
      timestamp: new Date().toISOString(),
    };

    await translationsTableClient.saveUserTranslation(tableObj);

    return gateway.createSuccessJsonResponse(translationResponse);

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "UnsupportedLanguagePairException") {
        return gateway.createErrorJsonResponse("Unsupported language pair");
      }
      console.error('Error in handler:', error.message);
    } else {
      console.error('Unknown error in handler:', error);
    }

    return gateway.createErrorJsonResponse("Unknown error");
  }
};
