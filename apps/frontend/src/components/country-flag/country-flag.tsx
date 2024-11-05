"use client";

import { CSSProperties } from "react";
import "./css/flag-icons.css";

export interface CountryFlagProps {
    code: string;
    size?: 'sm' | 'md' | 'lg';
    squared?: boolean;
    className?: string;
    style?: CSSProperties;
}

const sizeMap = {
    sm: '1em',
    md: '1.5em',
    lg: '2em'
};

export function CountryFlag({
    code,
    size = 'sm',
    squared = false,
    className = '',
    style = {}
}: CountryFlagProps) {
    const flagClass = `fi fi-${code.toLowerCase()} ${squared ? 'fis' : ''} ${className}`.trim();

    return (
        <span
            className={flagClass}
            style={{
                display: 'inline-block',
                fontSize: sizeMap[size],
                ...style
            }}
            role="img"
            aria-label={`Flag of ${code}`}
        />
    );
}