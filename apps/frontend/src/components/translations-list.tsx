"use client"

import { ITranslationResult } from "@verbo/shared-types";
import { Button } from "./ui/button";
import { useState } from "react";
import { getTranslations } from "@/services/translations/get-translations.service";
import { TranslationItem } from "./translation-item";
import { deleteTranslation } from "@/services/translations/delete-translation.service";

export const TranslationsList = () => {

    const [translations, setTempTranslations] = useState<ITranslationResult[]>([]);

    const handleFetchTranslations = async () => {
        const data = await getTranslations();
        setTempTranslations(data);
    };

    const handleDeleteTranslation = async (translationId: string) => {
        await deleteTranslation({
            translationId: translationId,
        });

        setTempTranslations(
            translations.filter(translation => translation.requestId !== translationId)
        );
    };

    if (translations.length === 0) {
        return (
            <div>
                <p>No translations yet</p>
                <Button onClick={handleFetchTranslations}>Fetch Translations</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-semibold">Translations</h2>
            <Button onClick={handleFetchTranslations}>Fetch Translations</Button>

            {translations.map((translation: ITranslationResult) => (
                <TranslationItem
                    key={translation.requestId}
                    translation={translation}
                    onDelete={handleDeleteTranslation}
                />
            ))}
        </div>
    );
}