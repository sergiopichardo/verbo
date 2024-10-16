import { TranslationDBObject } from "@verbo/shared-types";

export const getTranslations = async (): Promise<TranslationDBObject[]> => {
    try {
        const response = await fetch(`https://api.verbotranslator.com/translations`, {
            method: 'GET'
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error response:', errorBody);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const data = await response.json();

        const translations = data.translations as TranslationDBObject[];

        return translations.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}