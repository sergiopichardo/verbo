import TranslationForm from "@/components/translation-form";


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold">Verbo</h1>

      <TranslationForm />
    </div>
  );
}
