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
import { TranslateTextInput } from "@verbo/shared-types";


type TranslationFormProps = {};

export default function TranslationForm(props: TranslationFormProps) {
  const [isLoading, setIsLoading] = useState(false);


  const form = useForm<TTranslateForm>({
    resolver: zodResolver(translateFormSchema),
    defaultValues: {
      inputText: "",
      inputLanguage: "",
      outputLanguage: "",
    },
  });

  const onSubmit = async (data: TTranslateForm) => {
    if (!data.inputText || !data.inputLanguage || !data.outputLanguage) {
      return;
    }

    try {

      console.log("data", data);
      setIsLoading(true);


      const translationPayload: TranslateTextInput = {
        inputLanguage: data.inputLanguage,
        outputLanguage: data.outputLanguage,
        inputText: data.inputText,
      };

      let user = null;
      let translation = null;

      try {
        user = await getCurrentUser();

        if (user) {
          translation = await translateText(translationPayload);
        } else {
          throw new Error("User not logged in");
        }
      } catch (error) {
        translation = await createPublicTranslation(translationPayload);
      }

      if (!translation) {
        throw new Error("Error in translation");
      }

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
        <div className="flex align-center">
          <FormField
            control={form.control}
            name="inputLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Language</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Input Language" />
                </FormControl>
                <FormMessage />
                <FormDescription className="sr-only">
                  The text to be translated
                </FormDescription>
              </FormItem>
            )}
          />

          <span className="mt-8 py-2 px-4">
            <ArrowLeftRight className="w-4 h-4" />
          </span>

          <FormField
            control={form.control}
            name="outputLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Language</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Output Language" />
                </FormControl>
                <FormMessage />
                <FormDescription className="sr-only">
                  The text to be translated
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

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
