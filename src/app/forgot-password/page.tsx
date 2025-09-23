"use client";

import {
  ForgotPasswordForm,
  type ForgotPasswordValues,
} from "@/components/forgot-password-form";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function ForgotPasswordPage() {
  const schema = z.object({
    email: z.string().email("Please enter a valid email"),
    otp: z.string().min(6, "Enter the 6-digit code").max(6),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", otp: "", password: "" },
    mode: "onSubmit",
  });
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              Enter your email to receive a one-time code, then set a new
              password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
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
              <Button
                className="w-full"
                  disabled={sending || !form.getValues("email")}
                onClick={async () => {
                  setError(undefined);
                  setStatus(undefined);
                  setSending(true);
                  try {
                    const { error: sendError } =
                        await authClient.forgetPassword.emailOtp({ email: form.getValues("email") });
                    if (sendError) setError(sendError.message ?? "Failed to send code");
                    else setStatus("Code sent. Check your inbox.");
                  } catch (e) {
                    const message =
                      e instanceof Error ? e.message : "Failed to send code";
                    setError(message);
                  } finally {
                    setSending(false);
                  }
                }}
              >
                {sending ? "Sending..." : "Send code"}
              </Button>
              <FormField
                control={form.control}
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input id="new-password" type="password" placeholder="New password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {status ? (
                <p className="text-muted-foreground text-sm">{status}</p>
              ) : null}
              {error ? <p className="text-destructive text-sm">{error}</p> : null}
              <Button
                className="w-full"
                disabled={
                  resetting ||
                  !form.getValues("email") ||
                  (form.getValues("otp")?.length ?? 0) !== 6 ||
                  (form.getValues("password")?.length ?? 0) < 8
                }
                onClick={async () => {
                  setError(undefined);
                  setResetting(true);
                  try {
                    const { error: resetError } = await authClient.emailOtp.resetPassword({
                      email: form.getValues("email"),
                      otp: form.getValues("otp"),
                      password: form.getValues("password"),
                    });
                    if (resetError)
                      setError(resetError.message ?? "Failed to reset password");
                    else setStatus("Password reset. You can now sign in.");
                  } catch (e) {
                    const message =
                      e instanceof Error ? e.message : "Failed to reset password";
                    setError(message);
                  } finally {
                    setResetting(false);
                  }
                }}
              >
                {resetting ? "Resetting..." : "Reset password"}
              </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
