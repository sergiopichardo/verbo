import { TranslationDBObject } from "@verbo/shared-types";
import { getJwtToken } from "../../lib/get-jwt-token";



export const getTranslations = async (): Promise<TranslationDBObject[]> => {
    try {
        const jwtToken = await getJwtToken();
        console.log("jwtToken from getTranslations():", jwtToken);

        const response = await fetch(`https://api.verbotranslator.com/translations`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error response:', errorBody);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const data = await response.json();

        const translations = data.translations as TranslationDBObject[];

        console.log("translations", translations);

        return translations.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}