"use client"

import { useEffect, useState } from "react";
import { TranslationDBObject } from "@verbo/shared-types";

import TranslationForm from "@/components/translation-form";
import { TranslationsList } from "@/components/translations-list";

import { getTranslations } from "@/services/getTranslations.service";

export default function Home() {
  const [translations, setTranslations] = useState<TranslationDBObject[]>([]);

  const fetchTranslations = async () => {
    const data = await getTranslations();
    setTranslations(data);
  };

  const handleTranslation = async () => {
    await fetchTranslations();
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold">Verbo</h1>

      <TranslationForm onTranslation={handleTranslation} />

      <hr className="my-8 w-[200px]" />

      <TranslationsList translations={translations} />

    </div>
  );
}
