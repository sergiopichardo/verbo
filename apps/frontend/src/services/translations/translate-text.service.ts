import { getJwtToken } from '../../lib/get-jwt-token';
import { ITranslationRequest, ITranslationResponse } from "@verbo/shared-types";

type ITranslateTextInput = {
    inputLanguage: string;
    outputLanguage: string;
    inputText: string;
}

export const translateText = async ({
    inputLanguage,
    outputLanguage,
    inputText
}: ITranslateTextInput): Promise<ITranslationResponse> => {

    const ITranslationRequest: ITranslationRequest = {
        sourceLanguageCode: inputLanguage,
        targetLanguageCode: outputLanguage,
        sourceText: inputText
    };

    try {
        const jwtToken = await getJwtToken();
        console.log("jwtToken from translateText():", jwtToken);

        const response = await fetch(`https://api.verbotranslator.com/translations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(ITranslationRequest),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error response:', errorBody);
            console.error('Error response status:', response);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const ITranslationResponse: ITranslationResponse = await response.json();
        return ITranslationResponse;

    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}