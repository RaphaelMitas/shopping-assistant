"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendVerifyEmail } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);

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
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>
              We sent a verification link to your email. Please verify to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onResend)} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input id="email" type="email" placeholder="m@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {status ? (
                  <p className="text-sm text-muted-foreground">{status}</p>
                ) : null}
                {submitError ? <FormMessage>{submitError}</FormMessage> : null}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Resend verification email"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <p className="text-center text-sm text-muted-foreground">
              Already verified? <a href="/login" className="underline underline-offset-4">Login</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

