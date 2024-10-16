import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";

import {
    TranslationDBObject
} from "@verbo/shared-types";

import { exceptions, translationsTable } from "/opt/nodejs/utils"
import { gateway } from "/opt/nodejs/utils";

const TRANSLATIONS_TABLE_NAME = process.env.TRANSLATIONS_TABLE_NAME as string;
const TRANSLATIONS_PARTITION_KEY = process.env.TRANSLATIONS_PARTITION_KEY as string;
const TRANSLATIONS_SORT_KEY = process.env.TRANSLATIONS_SORT_KEY as string;

if (!TRANSLATIONS_TABLE_NAME) {
    throw new exceptions.MissingEnvironmentVariableException("TRANSLATIONS_TABLE_NAME");
}

if (!TRANSLATIONS_PARTITION_KEY) {
    throw new exceptions.MissingEnvironmentVariableException("TRANSLATIONS_PARTITION_KEY");
}

if (!TRANSLATIONS_SORT_KEY) {
    throw new exceptions.MissingEnvironmentVariableException("TRANSLATIONS_SORT_KEY");
}

const translationsTableClient = new translationsTable.TranslationsTable(
    TRANSLATIONS_TABLE_NAME,
    TRANSLATIONS_PARTITION_KEY,
    TRANSLATIONS_SORT_KEY
);

export const handler: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
    try {
        const translations = await translationsTableClient.getAllUserTranslations() as TranslationDBObject[];

        return gateway.createSuccessJsonResponse({ translations });

    } catch (error) {
        return gateway.createErrorJsonResponse("Error in getTranslations()");
    }
}