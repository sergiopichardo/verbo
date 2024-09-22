import { APIGatewayEvent, Context } from "aws-lambda";

import {
  TranslateClient,
  TranslateTextCommand,
  TranslateTextCommandInput,
  TranslateTextCommandOutput,
} from "@aws-sdk/client-translate";

const translateClient = new TranslateClient({});

export const handler = async (event: APIGatewayEvent, context: Context) => {
  console.log(event);
  console.log(context);
  try {
    const now = new Date(Date.now()).toString();

    const inputParams: TranslateTextCommandInput = {
      SourceLanguageCode: "en",
      TargetLanguageCode: "fr",
      Text: "Hello from Lambda!",
    };

    const translateCommand = new TranslateTextCommand(inputParams);

    const result: TranslateTextCommandOutput = await translateClient.send(
      translateCommand
    );

    console.log(result);

    return {
      statusCode: 200,
      body: now,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};
