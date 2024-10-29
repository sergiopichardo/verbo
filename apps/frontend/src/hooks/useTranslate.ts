"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTranslations } from "@/services/translations/get-translations.service";

export const useTranslate = () => {

    const queryClient = useQueryClient();
    const queryKey = ["translate"];

    const translateQuery = useQuery({
        queryKey: queryKey,
        queryFn: () => {
            console.log("translate query fn");
            return getTranslations();
        },
    })

    return {
        translations: !translateQuery.data ? [] : translateQuery.data,
        isLoading: translateQuery.status === "pending"
    }
}