import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
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

console.log({
    TRANSLATIONS_TABLE_NAME,
    TRANSLATIONS_PARTITION_KEY,
    TRANSLATIONS_SORT_KEY
});

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

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {

        const claims = event.requestContext.authorizer?.claims;
        console.log('claims:', claims);

        if (!claims) {
            throw new Error("User is not authenticated");
        }

        const username = claims['cognito:username'];

        if (!username) {
            throw new Error("Username does not exist");
        }

        console.log("USERNAME:", username);

        const translations = await translationsTableClient.queryTranslationsByUsername(username) as TranslationDBObject[];

        console.log("TEMP translations:", translations);

        return gateway.createSuccessJsonResponse({ translations });

    } catch (error) {
        return gateway.createErrorJsonResponse("Error in queryTranslationsByUsername()");
    }
}
