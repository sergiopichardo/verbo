import { 
  APIGatewayProxyEvent, 
  APIGatewayProxyHandler, 
  APIGatewayProxyResult, 
} from "aws-lambda";

import {
  TranslateClient,
  TranslateTextCommand,
  TranslateTextCommandInput,
  TranslateTextCommandOutput,
} from "@aws-sdk/client-translate";

import { 
  TranslationRequest, 
  TranslationResponse 
} from "@verbo/shared-types";

const translateClient = new TranslateClient({});

const translateText = async (sourceLanguageCode: string, targetLanguageCode: string, text: string): Promise<string> => {
  try {
    const inputParams: TranslateTextCommandInput = {
      SourceLanguageCode: sourceLanguageCode,
      TargetLanguageCode: targetLanguageCode,
      Text: text,
    };

    const translateCommand = new TranslateTextCommand(inputParams);
    const result: TranslateTextCommandOutput = await translateClient.send(translateCommand);

    if (!result.TranslatedText) {
      throw new Error("Unable to translate text");
    }
    
    return result.TranslatedText;
  } catch (error) {
    console.error('Error in translateText():', error);
    throw error;
  }
};

const sendResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify(body),
  };
};

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent, 
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      throw new Error("No body provided");
    }

    const body = JSON.parse(event.body) as TranslationRequest;
    
    if (!body.sourceLanguageCode || !body.targetLanguageCode || !body.sourceText) {
      throw new Error("Missing required properties in the request body");
    }
    
    const { sourceLanguageCode, targetLanguageCode, sourceText } = body;

    const translatedText = await translateText(sourceLanguageCode, targetLanguageCode, sourceText);

    const translationResponse: TranslationResponse = {
      timestamp: new Date().toISOString(),
      targetText: translatedText,
    };

    return sendResponse(200, translationResponse);

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "UnsupportedLanguagePairException") {
        return sendResponse(400, {
          errorMessage: "Unsupported language pair",
        });
      }
    } 
    
    return sendResponse(500, {
      message: "Unknown error",
      error: error,
    });
  }
};
