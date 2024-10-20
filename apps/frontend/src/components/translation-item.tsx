import { TranslationDBObject } from "@verbo/shared-types";
import { format, parseISO } from 'date-fns';

import { X } from "lucide-react";


interface TranslationItemProps {
    translation: TranslationDBObject;
    onDelete: (translationId: string) => void;
}

export const TranslationItem = ({ translation, onDelete }: TranslationItemProps) => {
    return (
        <div className="mt-8 p-4 border rounded-lg relative">
            <button
                className="absolute top-2 right-2 hover:bg-slate-100 rounded-full p-0.5 transition-colors text-slate-500"
                onClick={() => onDelete(translation.requestId)}
            >
                <X className="h-5 w-5" />
            </button>
            <p><span className="font-semibold">Input</span>: {translation.sourceText}</p>
            <p><span className="font-semibold">Output</span>: {translation.targetText}</p>
            <p className="text-sm text-gray-500 mt-2">
                Translated at: {format(parseISO(translation.timestamp), 'PPpp')}
            </p>
        </div>
    );
};
