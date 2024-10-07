import { z } from "zod"

export const translateFormSchema = z.object({
  inputLanguage: z.string().min(2).max(50),
  outputLanguage: z.string().min(2).max(50),
  inputText: z.string().min(2).max(50),
})

export type TTranslateForm = z.infer<typeof translateFormSchema>;

export default translateFormSchema;