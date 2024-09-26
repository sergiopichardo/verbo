import { 
    APIGatewayProxyHandler, 
    APIGatewayProxyEvent, 
    APIGatewayProxyResult, 
} from "aws-lambda";

import { 
    TranslationDBObject
} from "@verbo/shared-types";

import { sendResponse } from "../utils";
import { getTranslations } from "../services";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent, 
  ): Promise<APIGatewayProxyResult> => {
    try {
        // if (!event.body) {
        //     throw new Error("No body provided");
        // }
        
        // const body = JSON.parse(event.body) as TranslationRequest;

        const tableName = process.env.TRANSLATIONS_TABLE_NAME as string;

        const translations = await getTranslations(tableName) as TranslationDBObject[];
        return sendResponse(200, { translations });

    } catch (error) {
        console.error('Error in getTranslations():', error);    

        return sendResponse(500, {  
            message: "Error in getTranslations()",
            error: error
        });
    }
}