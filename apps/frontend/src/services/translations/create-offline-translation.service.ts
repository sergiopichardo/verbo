import { IPublicTranslationInput, IPublicTranslationResult } from "@verbo/shared-types";

export const createOfflineTranslation = async ({
    sourceLanguage,
    targetLanguage,
    inputText,
    sourceLanguageCode,
    targetLanguageCode
}: IPublicTranslationInput): Promise<IPublicTranslationResult> => {


    const offlineTranslationInput: IPublicTranslationInput = {
        sourceLanguage,
        targetLanguage,
        inputText,
        sourceLanguageCode,
        targetLanguageCode
    };

    try {
        const response = await fetch(`https://api.verbotranslator.com/translations/public`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(offlineTranslationInput),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.log("public translation errorBody", errorBody);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const offlineTranslationResult: IPublicTranslationResult = await response.json();
        return offlineTranslationResult;

    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}