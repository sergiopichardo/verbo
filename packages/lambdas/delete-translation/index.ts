import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";

import {
  DeleteITranslationRequest,
} from "@verbo/shared-types";

import {
  gateway,
  exceptions,
  translationsTable,
  cognitoUtils,
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
): Promise<APIGatewayProxyResult> => {
  try {

    const username = cognitoUtils.getCognitoUsername(event);
    if (!username) {
      throw new exceptions.UnauthorizedException("User is not authenticated");
    }

    if (!event.body) {
      throw new exceptions.MissingRequestBodyException();
    }

    const body = JSON.parse(event.body) as DeleteITranslationRequest;

    if (!body.translationId) {
      throw new exceptions.MissingParametersException("translationId is missing");
    }

    const translationId = body.translationId;

    await translationsTableClient.deleteTranslation({
      requestId: translationId,
      username: username
    });

    return gateway.createSuccessJsonResponse({});

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
