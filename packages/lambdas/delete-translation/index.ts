import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";

import {
  DeleteTranslationRequest,
} from "@verbo/shared-types";

import {
  gateway,
  exceptions,
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

    if (!event.body) {
      throw new exceptions.MissingRequestBodyException();
    }

    const body = JSON.parse(event.body) as DeleteTranslationRequest;

    if (!body.translationId) {
      throw new exceptions.MissingParametersException("translationId is missing");
    }

    const translationId = body.translationId;
    if (!translationId) {
      throw new exceptions.MissingParametersException("translationId is missing");
    }

    await translationsTableClient.deleteTranslation(translationId, username);

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