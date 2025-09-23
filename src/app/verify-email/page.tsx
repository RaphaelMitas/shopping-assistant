"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function VerifyEmailPage() {
  const router = useRouter();
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
  const otpSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    otp: z.string().min(6, "Enter the 6-digit code").max(6),
  });
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: initialEmail, otp: "" },
    mode: "onSubmit",
  });
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
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "email-verification",
      });
      if (error) setSubmitError(error.message ?? "Failed to send code");
      else setStatus("Code sent. Please check your inbox.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to send email";
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
              <Button onClick={() => router.push(redirectTo)}>Continue</Button>
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
              Enter your email to receive a one-time code.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {isSubmitting ? "Sending..." : "Send code"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Form {...otpForm}>
              <form
                className="flex w-full flex-col gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitError(undefined);
                  const values = otpForm.getValues();
                  try {
                    const { error } = await authClient.emailOtp.verifyEmail({
                      email: form.getValues("email"),
                      otp: values.otp,
                    });
                    if (error) otpForm.setError("otp", { message: error.message ?? "Failed to verify" });
                    else router.push(redirectTo);
                  } catch (e) {
                    const message = e instanceof Error ? e.message : "Failed to verify";
                    otpForm.setError("otp", { message });
                  }
                }}
              >
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-time code</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} value={field.value ?? ""} onChange={field.onChange}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={otpForm.formState.isSubmitting || (otpForm.getValues("otp")?.length ?? 0) !== 6}>
                  Verify code
                </Button>
              </form>
            </Form>
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
