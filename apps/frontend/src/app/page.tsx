"use client"

import { useEffect, useState } from "react";
import { TranslationDBObject } from "@verbo/shared-types";

import TranslationForm from "@/components/translation-form";
import { TranslationsList } from "@/components/translations-list";
import { getTranslations } from "@/services/translations/get-translations.service";

export default function Home() {
  const [translations, setTranslations] = useState<TranslationDBObject[]>([]);

  const fetchTranslations = async () => {
    const data = await getTranslations();
    setTranslations(data);
  };

  useEffect(() => {
    getTranslations().then((data) => {
      setTranslations(data);
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold">Verbo</h1>

      <TranslationForm onTranslation={fetchTranslations} />

      <hr className="my-8 w-[200px]" />

      <TranslationsList translations={translations} />

    </div>
  );
}
