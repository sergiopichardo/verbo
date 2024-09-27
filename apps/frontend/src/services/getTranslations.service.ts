import backendOutputs from '../config/backendOutputs.json';
import { TranslationDBObject } from "@verbo/shared-types";

export const getTranslations = async (): Promise<TranslationDBObject[]> => {    
    try {
        const baseUrl = backendOutputs.VerboApiStack.restApiUrl;
        const response = await fetch(`${baseUrl}/translations`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error response:', errorBody);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }
        
        const data = await response.json();

        return data.translations;
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}