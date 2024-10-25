import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";

import {
    ITranslationRequest,
    ITranslationResponse,
} from "@verbo/shared-types";

import {
    gateway,
    exceptions,
    translationClient,
} from '/opt/nodejs/utils';

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

        if (!event.body) {
            throw new exceptions.MissingRequestBodyException();
        }

        const body = JSON.parse(event.body) as ITranslationRequest;

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

        const ITranslationResponse: ITranslationResponse = {
            timestamp: new Date().toISOString(),
            targetText: translatedText,
        };

        // NOTE: we don't save the translation to the table because it's a public endpoint, we simply return the translation
        return gateway.createSuccessJsonResponse(ITranslationResponse);

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
