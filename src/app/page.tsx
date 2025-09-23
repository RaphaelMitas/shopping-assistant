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
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { searchWeb } from "./firecrawl-actions";

export default function HomePage() {
  const schema = z.object({
    query: z.string().min(3, "Please enter at least 3 characters"),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { query: "" },
    mode: "onSubmit",
  });

  const onSubmit = useCallback(async (values: FormValues) => {
    const result = await searchWeb(values.query.trim());
    console.log("Customer wants to buy:", values.query.trim());
    console.log("Result:", result);
  }, []);

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            What do you want to buy?
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Describe the product you’re looking for.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item or description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      id="buy-textarea"
                      placeholder="e.g., noise-cancelling headphones, budget under $200, over-ear, ANC"
                      aria-label="What do you want to buy?"
                      rows={6}
                      className="min-h-28"
                    />
                  </FormControl>
                  <FormDescription>
                    Add details like brand, budget, size, or features.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={
                  form.formState.isSubmitting || !form.formState.isValid
                }
              >
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
