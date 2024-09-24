"use client"

import { useState } from "react";
import TranslationForm from "@/components/translation-form";
import { TranslationResponse } from "@verbo/shared-types";

export default function Home() {
  const [translationResult, setTranslationResult] = useState<TranslationResponse | null>(null);

  const handleTranslation = (result: TranslationResponse) => {
    setTranslationResult(result);
  };

  console.log("translationResult:", translationResult);

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold">Verbo</h1>

      <TranslationForm onTranslation={handleTranslation} />

      {translationResult && (
        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Translation Result:</h2>
          <p>{translationResult.targetText}</p>
          <p className="text-sm text-gray-500 mt-2">Translated at: {translationResult.timestamp}</p>
        </div>
      )}
    </div>
  );
}
