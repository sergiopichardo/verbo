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
    requestId: string;
}