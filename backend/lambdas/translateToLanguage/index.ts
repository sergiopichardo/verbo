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
    throw new Error('Failed to translate text');
  }
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

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        text: translatedText,
        timestamp: new Date().toISOString(),
      }),
    };

  } catch (error: unknown) {
    console.log(error);

    return {
      statusCode: 500,
      body: JSON.stringify("Internal server error"),
    };
  }
};
