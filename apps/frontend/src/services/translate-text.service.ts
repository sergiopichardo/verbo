import backendOutputs from "../config/backend-outputs.json";

type TranslateTextInput = {
    inputLanguage: string;
    outputLanguage: string;
    inputText: string;
  }
  
export const translateText = async ({ 
    inputLanguage, 
    outputLanguage, 
    inputText 
}: TranslateTextInput) => {

    try {
        const response = await fetch(`${backendOutputs.VerboStack.restApiUrl}translate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                sourceLanguageCode: inputLanguage, 
                targetLanguageCode: outputLanguage, 
                text: inputText 
            }),
        });
        return response.json();
        
    } catch (error) {
        throw error;
    }
  }