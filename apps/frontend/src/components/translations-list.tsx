"use client"

import { TranslationDBObject } from "@verbo/shared-types";
import { Button } from "./ui/button";
import { useState } from "react";
import { getTranslations } from "@/services/translations/get-translations.service";
import { TranslationItem } from "./translation-item";
import { deleteTranslation } from "@/services/translations/delete-translation.service";

export const TranslationsList = () => {

    const [translations, setTranslations] = useState<TranslationDBObject[]>([]);

    const handleFetchTranslations = async () => {
        const data = await getTranslations();
        setTranslations(data);
    };

    const handleDeleteTranslation = async (translationId: string) => {
        await deleteTranslation({
            translationId: translationId,
        });

        setTranslations(translations.filter(translation => translation.requestId !== translationId));
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

            {translations.map((translation: TranslationDBObject) => (
                <TranslationItem
                    key={translation.requestId}
                    translation={translation}
                    onDelete={handleDeleteTranslation}
                />
            ))}
        </div>
    );
}