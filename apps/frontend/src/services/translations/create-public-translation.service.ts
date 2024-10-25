import { ITranslationRequest, ITranslationResponse, ITranslateTextInput } from "@verbo/shared-types";

export const createPublicTranslation = async ({
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
        const response = await fetch(`https://api.verbotranslator.com/translations/public`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ITranslationRequest),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.log("public translation errorBody", errorBody);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const ITranslationResponse: ITranslationResponse = await response.json();
        console.log("public translations:", ITranslationResponse);
        return ITranslationResponse;

    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}