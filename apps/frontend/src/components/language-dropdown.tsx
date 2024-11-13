import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CountryFlag } from '@/components/country-flag/country-flag';

interface LanguageSelectProps {
    onValueChange: (value: string) => void;
    value: string;
    defaultValue?: string;
}

const LanguageSelect = ({ onValueChange, value, defaultValue = 'en' }: LanguageSelectProps) => {
    const languages = [
        { name: 'English', code: 'en' },
        { name: 'Afrikaans', code: 'af' },
        { name: 'Albanian', code: 'sq' },
        { name: 'Amharic', code: 'am' },
        { name: 'Arabic', code: 'ar' },
        { name: 'Armenian', code: 'hy' },
        { name: 'Azerbaijani', code: 'az' },
        { name: 'Bengali', code: 'bn' },
        { name: 'Bosnian', code: 'bs' },
        { name: 'Bulgarian', code: 'bg' },
        { name: 'Catalan', code: 'ca' },
        { name: 'Chinese (Simplified)', code: 'zh' },
        { name: 'Chinese (Traditional)', code: 'zh-TW' },
        { name: 'Croatian', code: 'hr' },
        { name: 'Czech', code: 'cs' },
        { name: 'Danish', code: 'da' },
        { name: 'Dari', code: 'fa-AF' },
        { name: 'Dutch', code: 'nl' },
        { name: 'Estonian', code: 'et' },
        { name: 'Farsi (Persian)', code: 'fa' },
        { name: 'Filipino, Tagalog', code: 'tl' },
        { name: 'Finnish', code: 'fi' },
        { name: 'French', code: 'fr' },
        { name: 'French (Canada)', code: 'fr-CA' },
        { name: 'Georgian', code: 'ka' },
        { name: 'German', code: 'de' },
        { name: 'Greek', code: 'el' },
        { name: 'Gujarati', code: 'gu' },
        { name: 'Haitian Creole', code: 'ht' },
        { name: 'Hausa', code: 'ha' },
        { name: 'Hebrew', code: 'he' },
        { name: 'Hindi', code: 'hi' },
        { name: 'Hungarian', code: 'hu' },
        { name: 'Icelandic', code: 'is' },
        { name: 'Indonesian', code: 'id' },
        { name: 'Irish', code: 'ga' },
        { name: 'Italian', code: 'it' },
        { name: 'Japanese', code: 'ja' },
        { name: 'Kannada', code: 'kn' },
        { name: 'Kazakh', code: 'kk' },
        { name: 'Korean', code: 'ko' },
        { name: 'Latvian', code: 'lv' },
        { name: 'Lithuanian', code: 'lt' },
        { name: 'Macedonian', code: 'mk' },
        { name: 'Malay', code: 'ms' },
        { name: 'Malayalam', code: 'ml' },
        { name: 'Maltese', code: 'mt' },
        { name: 'Marathi', code: 'mr' },
        { name: 'Mongolian', code: 'mn' },
        { name: 'Norwegian (Bokmål)', code: 'no' },
        { name: 'Pashto', code: 'ps' },
        { name: 'Polish', code: 'pl' },
        { name: 'Portuguese (Brazil)', code: 'pt' },
        { name: 'Portuguese (Portugal)', code: 'pt-PT' },
        { name: 'Punjabi', code: 'pa' },
        { name: 'Romanian', code: 'ro' },
        { name: 'Russian', code: 'ru' },
        { name: 'Serbian', code: 'sr' },
        { name: 'Sinhala', code: 'si' },
        { name: 'Slovak', code: 'sk' },
        { name: 'Slovenian', code: 'sl' },
        { name: 'Somali', code: 'so' },
        { name: 'Spanish', code: 'es' },
        { name: 'Spanish (Mexico)', code: 'es-MX' },
        { name: 'Swahili', code: 'sw' },
        { name: 'Swedish', code: 'sv' },
        { name: 'Tamil', code: 'ta' },
        { name: 'Telugu', code: 'te' },
        { name: 'Thai', code: 'th' },
        { name: 'Turkish', code: 'tr' },
        { name: 'Ukrainian', code: 'uk' },
        { name: 'Urdu', code: 'ur' },
        { name: 'Uzbek', code: 'uz' },
        { name: 'Vietnamese', code: 'vi' },
        { name: 'Welsh', code: 'cy' },
    ];

    const languageToFlag: { [key: string]: string } = {
        'af': 'ZA',
        'sq': 'AL',
        'am': 'ET',
        'ar': 'SA',
        'hy': 'AM',
        'az': 'AZ',
        'bn': 'BD',
        'bs': 'BA',
        'bg': 'BG',
        'ca': 'ES',
        'zh': 'CN',
        'zh-TW': 'TW',
        'hr': 'HR',
        'cs': 'CZ',
        'da': 'DK',
        'fa-AF': 'AF',
        'nl': 'NL',
        'en': 'US',
        'et': 'EE',
        'fa': 'IR',
        'tl': 'PH',
        'fi': 'FI',
        'fr': 'FR',
        'fr-CA': 'CA',
        'ka': 'GE',
        'de': 'DE',
        'el': 'GR',
        'gu': 'IN',
        'ht': 'HT',
        'ha': 'NG',
        'he': 'IL',
        'hi': 'IN',
        'hu': 'HU',
        'is': 'IS',
        'id': 'ID',
        'ga': 'IE',
        'it': 'IT',
        'ja': 'JP',
        'kn': 'IN',
        'kk': 'KZ',
        'ko': 'KR',
        'lv': 'LV',
        'lt': 'LT',
        'mk': 'MK',
        'ms': 'MY',
        'ml': 'IN',
        'mt': 'MT',
        'mr': 'IN',
        'mn': 'MN',
        'no': 'NO',
        'ps': 'AF',
        'pl': 'PL',
        'pt': 'BR',
        'pt-PT': 'PT',
        'pa': 'IN',
        'ro': 'RO',
        'ru': 'RU',
        'sr': 'RS',
        'si': 'LK',
        'sk': 'SK',
        'sl': 'SI',
        'so': 'SO',
        'es': 'ES',
        'es-MX': 'MX',
        'sw': 'TZ',
        'sv': 'SE',
        'ta': 'IN',
        'te': 'IN',
        'th': 'TH',
        'tr': 'TR',
        'uk': 'UA',
        'ur': 'PK',
        'uz': 'UZ',
        'vi': 'VN',
        'cy': 'GB'
    };

    return (
        <div className="w-[280px]">
            <Select value={value || defaultValue} onValueChange={onValueChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map((language) => (
                        <SelectItem
                            key={language.code}
                            value={language.code}
                            className="flex items-center gap-2"
                        >
                            <span className="flex items-center gap-2">
                                <CountryFlag
                                    code={languageToFlag[language.code]}
                                    size="sm"
                                />
                                <span>
                                    {language.name}
                                </span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default LanguageSelect;