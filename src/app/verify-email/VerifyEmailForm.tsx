"use client";

import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendVerifyEmail } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

type VerifyEmailFormProps = {
  searchParams: Promise<{ email?: string }>;
};

export function VerifyEmailForm({ searchParams }: VerifyEmailFormProps) {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const { email: initialEmail } = use(searchParams);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: initialEmail },
    mode: "onSubmit",
  });

  const onResend = async (values: FormValues) => {
    setStatus(undefined);
    setSubmitError(undefined);
    try {
      const result = await sendVerifyEmail({ email: values.email });
      if (result?.error) {
        setSubmitError(result.error);
      } else {
        setStatus("Verification email sent. Please check your inbox.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to send email";
      setSubmitError(message);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onResend)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {status ? (
          <p className="text-muted-foreground text-sm">{status}</p>
        ) : null}
        {submitError ? <FormMessage>{submitError}</FormMessage> : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Resend verification email"}
        </Button>
      </form>
    </Form>
  );
}
