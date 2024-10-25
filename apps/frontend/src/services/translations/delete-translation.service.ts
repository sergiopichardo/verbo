import { getJwtToken } from "@/lib/get-jwt-token";
import { DeleteITranslationRequest } from "@verbo/shared-types";

export const deleteTranslation = async ({
    translationId
}: DeleteITranslationRequest): Promise<void> => {

    try {
        const token = await getJwtToken();
        const response = await fetch(`https://api.verbotranslator.com/translations`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ translationId }),
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