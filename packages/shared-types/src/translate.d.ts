export type TranslationRequest = {
    sourceLanguageCode: string;
    targetLanguageCode: string;
    sourceText: string;
}

export type TranslationResponse = {
    timestamp: string;
    targetText: string;
}

export type TranslationDBObject = TranslationRequest & TranslationResponse & {
    username?: string;
    requestId: string;
}

export type TranslateTextInput = {
    inputLanguage: string;
    outputLanguage: string;
    inputText: string;
}

export type DeleteTranslationRequest = {
    translationId: string;
    userId: string;
}