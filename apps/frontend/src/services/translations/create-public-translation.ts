import { TranslationRequest, TranslationResponse, TranslateTextInput } from "@verbo/shared-types";

export const createPublicTranslation = async ({
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
        const response = await fetch(`https://api.verbotranslator.com/translations/public`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(translationRequest),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.log("public translation errorBody", errorBody);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const translationResponse: TranslationResponse = await response.json();
        console.log("public translations:", translationResponse);
        return translationResponse;

    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}