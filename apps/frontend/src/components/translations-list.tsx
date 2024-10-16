"use client"

import { TranslationDBObject } from "@verbo/shared-types";
import { format, parseISO } from 'date-fns';
import { Button } from "./ui/button";
import { useState } from "react";
import { getTranslations } from "@/services/translations/get-translations.service";

export const TranslationsList = () => {

    const [translations, setTranslations] = useState<TranslationDBObject[]>([]);

    const handleFetchTranslations = async () => {
        const data = await getTranslations();
        setTranslations(data);
    };

    // if (translations.length === 0) {
    //     return <div>No translations yet</div>;
    // }

    return (
        <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-semibold">Translations</h2>
            <Button onClick={handleFetchTranslations}>Fetch Translations</Button>

            {translations.map((translation: TranslationDBObject) => (
                <div key={translation.requestId} className="mt-8 p-4 border rounded-lg">
                    <p><span className="font-semibold">Input</span>: {translation.sourceText}</p>
                    <p><span className="font-semibold">Output</span>: {translation.targetText}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Translated at:{format(parseISO(translation.timestamp), 'PPpp')}
                    </p>
                </div>
            ))}
        </div>
    );
}