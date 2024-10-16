import { fetchAuthSession } from 'aws-amplify/auth';

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

        const session = await fetchAuthSession();
        const jwtToken = session?.tokens?.idToken?.toString();
        console.log("jwtToken from translateText():", jwtToken);

        const response = await fetch(`https://api.verbotranslator.com/translations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(translationRequest),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error response:', errorBody);
            console.error('Error response status:', response);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const translationResponse: TranslationResponse = await response.json();
        return translationResponse;

    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}