"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

export type StartChatProps = {
  onSubmit: (query: string) => Promise<void> | void;
  label?: string;
  description?: string;
  placeholder?: string;
  submitLabel?: string;
  initialQuery?: string;
  className?: string;
  textareaId?: string;
  autoFocus?: boolean;
  minChars?: number;
};

type FormValues = {
  query: string;
};

export function StartChat({
  onSubmit,
  label = "Item or description",
  description = "Add details like brand, budget, size, or features.",
  placeholder = "e.g., noise-cancelling headphones, budget under $200, over-ear, ANC",
  submitLabel = "Continue",
  initialQuery = "",
  className,
  textareaId = "buy-textarea",
  autoFocus = false,
  minChars = 3,
}: StartChatProps) {
  const schema = z.object({
    query: z
      .string()
      .min(minChars, `Please enter at least ${minChars} characters`),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { query: initialQuery },
    mode: "onSubmit",
  });

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      await onSubmit(values.query.trim());
    },
    [onSubmit],
  );

  return (
    <div className={cn("w-full", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    id={textareaId}
                    placeholder={placeholder}
                    aria-label={label}
                    rows={6}
                    className="min-h-28"
                    autoFocus={autoFocus}
                  />
                </FormControl>
                <FormDescription>{description}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="min-w-32"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
