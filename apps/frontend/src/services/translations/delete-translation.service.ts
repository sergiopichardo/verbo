import { DeleteTranslationRequest } from "@verbo/shared-types";

export const deleteTranslation = async ({
    translationId,
    userId
}: DeleteTranslationRequest): Promise<void> => {

    const translationRequest = {
        translationId: translationId,
        userId: userId
    }

    try {
        const response = await fetch(`https://api.verbotranslator.com/translations`, {
            method: 'DELETE',
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

    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}