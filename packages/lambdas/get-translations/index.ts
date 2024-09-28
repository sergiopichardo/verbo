import { 
    APIGatewayProxyHandler, 
    APIGatewayProxyResult, 
} from "aws-lambda";

import { 
    TranslationDBObject
} from "@verbo/shared-types";

import { translationTable } from "/opt/nodejs/utils"
import { gateway } from "/opt/nodejs/utils"; 

export const handler: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
    try {

        const tableName = process.env.TRANSLATIONS_TABLE_NAME as string;

        const translations = await translationTable.getTranslations(tableName) as TranslationDBObject[];

        return gateway.createSuccessJsonResponse({ translations });

    } catch (error) {
        return gateway.createErrorJsonResponse("Error in getTranslations()");   
    }
}