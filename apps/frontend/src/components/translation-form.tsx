"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { translateFormSchema, TTranslateForm } from "../schema/translateForm.schema";

import { ArrowLeftRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "./ui/input";
import { translateText } from "@/services/translations/translate-text.service";
import toast from "react-hot-toast";
import { useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { createPublicTranslation } from "@/services/translations/create-public-translation.service";
import { ITranslateTextInput, ITranslationResponse, ITranslationResult } from "@verbo/shared-types";
import CountrySelect from "./language-dropdown";


type TranslationFormProps = {};

export default function TranslationForm(props: TranslationFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [translationResult, setTranslationResult] = useState<string>("");


    const form = useForm<TTranslateForm>({
        resolver: zodResolver(translateFormSchema),
        defaultValues: {
            inputText: "Hello, how are you?",
            inputLanguage: "en",
            outputLanguage: "es",
        },
    });

    const onSubmit = async (data: TTranslateForm) => {
        if (!data.inputText || !data.inputLanguage || !data.outputLanguage) {
            return;
        }

        try {

            console.log("data", data);
            setIsLoading(true);


            const translationInput: ITranslateTextInput = {
                inputLanguage: data.inputLanguage,
                outputLanguage: data.outputLanguage,
                inputText: data.inputText,
            };

            let user = null;
            let translation = null;

            try {
                user = await getCurrentUser();

                if (user) {
                    translation = await translateText(translationInput);
                } else {
                    throw new Error("User not logged in");
                }
            } catch (error) {
                translation = await createPublicTranslation(translationInput);
            }

            if (!translation) {
                throw new Error("Error in translation");
            }

            console.log("translation result:", translation);
            setTranslationResult(translation.targetText);

        } catch (error) {
            if (error instanceof Error) {
                console.error("Error in translation", error);
                toast.error(error.message, {
                    duration: 5000,
                });
            }
        } finally {
            setIsLoading(false);
            // form.reset({
            //   inputText: "",
            //   inputLanguage: "",
            //   outputLanguage: "",
            // });
        }

    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex items-center gap-4">
                    <FormField
                        control={form.control}
                        name="inputLanguage"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel className="sr-only">Input Language</FormLabel>
                                <FormControl>
                                    <CountrySelect
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <span className="flex h-9 items-center mt-2 justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background">
                        <ArrowLeftRight className="h-4 w-4 opacity-50" />
                    </span>

                    <FormField
                        control={form.control}
                        name="outputLanguage"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel className="sr-only">Output Language</FormLabel>
                                <FormControl>
                                    <CountrySelect
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="inputText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Input Text</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Enter text to translate"
                                    rows={4}
                                />
                            </FormControl>
                            <FormMessage />
                            <FormDescription className="sr-only">
                                The text to be translated
                            </FormDescription>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="mt-4" disabled={isLoading}>
                    {isLoading ? "Translating..." : "Translate"}
                </Button>
            </form>
        </Form>
    );
}
