"use client";

import { useEffect, useMemo, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendVerificationCode, verifyEmailCode } from "../actions";
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
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  code: z.string().min(6, "Enter the 6-digit code").max(8).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const initialEmail = useMemo(
    () => searchParams.get("email") ?? "",
    [searchParams],
  );
  const redirectTo = useMemo(
    () => searchParams.get("redirectTo") ?? "/",
    [searchParams],
  );
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const user = useQuery(api.users.getCurrentUser);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: initialEmail },
    mode: "onSubmit",
  });

  const onResend = async (values: FormValues) => {
    setStatus(undefined);
    setSubmitError(undefined);
    try {
      const result = await sendVerificationCode({ email: values.email });
      if (result?.error) {
        setSubmitError(result.error);
      } else {
        setStatus("Verification code sent. Please check your email.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to send code";
      setSubmitError(message);
    }
  };

  useEffect(() => {
    if (initialEmail) {
      // Fire and forget initial code send
      void sendVerificationCode({ email: initialEmail });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail]);

  const onVerify = async (values: FormValues) => {
    setStatus(undefined);
    setSubmitError(undefined);
    try {
      const code = values.code ?? "";
      const result = await verifyEmailCode({
        email: values.email,
        code,
      });
      if (result?.error) {
        setSubmitError(result.error);
      } else {
        setStatus("Email verified. You can continue.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to verify";
      setSubmitError(message);
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const isVerified = user?.emailVerified;

  if (isVerified) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Email verified</CardTitle>
              <CardDescription>
                Your email has been verified. You can now continue.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => redirect(redirectTo)}>Continue</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>
              Enter the code we emailed to you to verify your address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onVerify)}
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
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification code</FormLabel>
                      <FormControl>
                        <Input
                          id="code"
                          type="text"
                          inputMode="numeric"
                          placeholder="123456"
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => form.handleSubmit(onResend)()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Resend code"}
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              Already verified?{" "}
              <a
                href={
                  redirectTo
                    ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
                    : "/login"
                }
                className="underline underline-offset-4"
              >
                Login
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
