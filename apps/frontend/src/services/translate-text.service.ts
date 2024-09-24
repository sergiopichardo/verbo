import backendOutputs from '../config/backendOutputs.json';

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

    const baseUrl = backendOutputs.VerboApiStack.restApiUrl

    try {
        const response = await fetch(`${baseUrl}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify(translationRequest),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error response:', errorBody);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const translationResponse: TranslationResponse = await response.json();
        return translationResponse;
        
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}