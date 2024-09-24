import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Context } from "aws-lambda";

import {
  TranslateClient,
  TranslateTextCommand,
  TranslateTextCommandInput,
  TranslateTextCommandOutput,
} from "@aws-sdk/client-translate";

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
    
    return result.TranslatedText || '';
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

    const body = JSON.parse(event.body);
    
    const { sourceLanguageCode, targetLanguageCode, text } = body;

    const translatedText = await translateText(sourceLanguageCode, targetLanguageCode, text);

    console.log({ translatedText });

    return sendResponse(200, {
      text: translatedText,
      timestamp: new Date().toISOString(),
    });


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
