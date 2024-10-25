import { TranslateClient, TranslateTextCommand, TranslateTextCommandOutput } from "@aws-sdk/client-translate";
import { ITranslationRequest } from "@verbo/shared-types";

export async function translate({
    sourceLanguageCode,
    targetLanguageCode,
    sourceText
}: ITranslationRequest): Promise<string> {
    const translationClient = new TranslateClient();

    const translationParams = {
        Text: sourceText,
        SourceLanguageCode: sourceLanguageCode,
        TargetLanguageCode: targetLanguageCode,
    }

    const command = new TranslateTextCommand(translationParams);

    try {
        const response: TranslateTextCommandOutput = await translationClient.send(command);

        if (!response.TranslatedText) {
            throw new Error("Translation failed: No translated text returned");
        }

        return response.TranslatedText;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Translation failed");
    }
}

