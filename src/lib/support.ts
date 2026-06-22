import { z } from "zod";

export const supportSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  email: z.string().email("Invalid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be under 5,000 characters"),
});

export type SupportFormValues = z.infer<typeof supportSchema>;
export type SupportFieldName = keyof SupportFormValues;

export interface SupportFieldError {
  field: SupportFieldName;
  message: string;
}

export interface SupportApiSuccess {
  success: true;
  message: string;
}

export interface SupportApiError {
  error: string;
  errors?: SupportFieldError[];
}

export type SupportApiResponse = SupportApiSuccess | SupportApiError;
