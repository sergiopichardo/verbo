export type ITranslation = {
    id: string;
    inputText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    sourceLanguageCode: string;
    targetLanguageCode: string;
    timestamp: string;
    isBookmarked: boolean;
}

/**
 * Public Translations
 */
export type IPublicTranslationInput = Pick<
    ITranslation,
    "inputText"
    | "sourceLanguage"
    | "targetLanguage"
    | "sourceLanguageCode"
    | "targetLanguageCode"
>;

export type IPublicTranslationResult = Pick<
    ITranslation,
    "id"
    | "inputText"
    | "translatedText"
    | "sourceLanguage"
    | "targetLanguage"
    | "isBookmarked"
    | "timestamp"
>;

/**
 * Authenticated Translations
 */
export type IAuthenticatedTranslationInput = Pick<
    ITranslation,
    "inputText"
    | "sourceLanguage"
    | "targetLanguage"
    | "sourceLanguageCode"
    | "targetLanguageCode"
> & {
    userId: string;
};

export type IAuthenticatedTranslationResult = void;