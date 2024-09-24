"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { translateFormSchema, TTranslateForm } from "../schema/translateForm"


import { Button } from "@/components/ui/button"

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
import { Input } from "./ui/input"
import { translateText } from "@/services/translate-text.service"

export default function TranslationForm() {
    const form = useForm<TTranslateForm>({
        resolver: zodResolver(translateFormSchema),
        defaultValues: {
            inputText: "",
            inputLanguage: "",
            outputLanguage: "",
        }
    });

    const onSubmit = async (data: TTranslateForm) => {
        if (!data.inputText || !data.inputLanguage || !data.outputLanguage) {
            return;
        }

        const response = await translateText({
            inputText: data.inputText,
            inputLanguage: data.inputLanguage,
            outputLanguage: data.outputLanguage
        });

        console.log("response", response);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="inputText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Input Text</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Enter text to translate"
                                    rows={4}
                                />
                            </FormControl>
                            <FormMessage />
                            <FormDescription className="sr-only">The text to be translated</FormDescription>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="inputLanguage"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Input Language</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Input Language"
                                />
                            </FormControl>
                            <FormMessage />
                            <FormDescription className="sr-only">The text to be translated</FormDescription>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="outputLanguage"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Output Language</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Output Language"
                                />
                            </FormControl>
                            <FormMessage />
                            <FormDescription className="sr-only">The text to be translated</FormDescription>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="mt-4">Translate</Button>
            </form>
        </Form>
    );
}
