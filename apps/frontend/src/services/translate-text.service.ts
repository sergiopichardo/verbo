import backendOutputs from "../config/backend-outputs.json";
import { TranslationRequest, TranslationResponse } from "@verbo/shared-types";

type TranslateTextInput = {
    inputLanguage: string;
    outputLanguage: string;
    inputText: string;
}

export const translateText = async ({ 
    inputLanguage, 
    outputLanguage, 
    inputText 
}: TranslateTextInput): Promise<TranslationResponse> => {

    const translationRequest: TranslationRequest = {
        sourceLanguageCode: inputLanguage,
        targetLanguageCode: outputLanguage,
        sourceText: inputText
    };

    try {
        const response = await fetch(`${backendOutputs.VerboStack.restApiUrl}translate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(translationRequest),
        });

        const translationResponse: TranslationResponse = await response.json();

        return translationResponse;
        
    } catch (error) {
        console.error("Error in translateText():", error);
        throw error;
    }
  }