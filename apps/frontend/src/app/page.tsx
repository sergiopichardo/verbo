"use client"

import TranslationForm from "@/components/translation-form";
import { TranslationsList } from "@/components/translations-list";

export default function Home() {

  return (
    <div className="flex min-h-screen flex-col items-center p-24">

      <TranslationForm />

      <hr className="my-8 w-[200px]" />

      <TranslationsList />

    </div>
  );
}
