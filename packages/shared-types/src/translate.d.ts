export type ITranslationRequest = {
    sourceLanguageCode: string;
    targetLanguageCode: string;
    sourceText: string;
}

export type ITranslationResponse = {
    timestamp: string;
    targetText: string;
}

export type ITranslationResult = ITranslationRequest & ITranslationResponse & {
    username?: string;
    requestId: string;
}

export type ITranslateTextInput = {
    inputLanguage: string;
    outputLanguage: string;
    inputText: string;
}

export type ITranslationResultList = ITranslationResult[];

export type DeleteITranslationRequest = {
    translationId: string;
}