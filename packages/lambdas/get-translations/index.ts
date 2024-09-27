import { 
    APIGatewayProxyHandler, 
    APIGatewayProxyResult, 
} from "aws-lambda";

import { 
    TranslationDBObject
} from "@verbo/shared-types";

import { translationService } from "/opt/nodejs/translation-services"
import { gateway } from "/opt/nodejs/utils"; 

export const handler: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
    try {

        const tableName = process.env.TRANSLATIONS_TABLE_NAME as string;

        const translations = await translationService.getTranslations(tableName) as TranslationDBObject[];

        return gateway.createSuccessJsonResponse({ translations });

    } catch (error) {
        return gateway.createErrorJsonResponse("Error in getTranslations()");   
    }
}