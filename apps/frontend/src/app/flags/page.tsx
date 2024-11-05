import { CountryFlag } from "@/components/country-flag/country-flag";

export default function FlagsPage() {
    return (
        <div className="flex flex-col gap-4 pt-32">
            <h1 className="text-2xl font-bold">Flags</h1>
            <CountryFlag code="US" />
            <CountryFlag code="FR" />
        </div>
    )
}