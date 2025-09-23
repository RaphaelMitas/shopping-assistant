"use client";

import { LoginForm, type LoginFormValues } from "@/components/login-form";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export default function Page() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
  const otpSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    otp: z.string().min(6, "Enter the 6-digit code").max(6),
  });
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: "", otp: "" },
    mode: "onSubmit",
  });
  const [otpStatus, setOtpStatus] = useState<string | undefined>(undefined);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSigningIn, setOtpSigningIn] = useState(false);
  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    setError(undefined);
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: redirectTo ?? "/",
      });
      if (result.data?.redirect) {
        router.push(result.data.url ?? "/");
      } else {
        if (result.error?.code === "EMAIL_NOT_VERIFIED") {
          const verifyUrl = `/verify-email?email=${encodeURIComponent(
            values.email,
          )}${redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ""}`;
          router.push(verifyUrl);
          return;
        }
        setError(result.error?.message ?? "Failed to sign in");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to sign in";
      setError(message);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Unauthenticated>
          <LoginForm onSubmit={handleSubmit} submitError={error} />
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sign in with email code</CardTitle>
                <CardDescription>
                  We&apos;ll send a one-time code to your email.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...otpForm}>
                  <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                    <FormField
                      control={otpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input id="otp-email" type="email" placeholder="m@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <div className="flex gap-2">
                    <Button
                      className="w-full"
                      disabled={otpSending || !otpForm.getValues("email")}
                      onClick={async () => {
                        setOtpStatus(undefined);
                        setError(undefined);
                        setOtpSending(true);
                        try {
                          const { error: sendError } =
                            await authClient.emailOtp.sendVerificationOtp({
                              email: otpForm.getValues("email"),
                              type: "sign-in",
                            });
                          if (sendError) {
                            setError(sendError.message ?? "Failed to send code");
                          } else {
                            setOtpStatus("Code sent. Check your inbox.");
                          }
                        } catch (e) {
                          const message =
                            e instanceof Error ? e.message : "Failed to send code";
                          setError(message);
                        } finally {
                          setOtpSending(false);
                        }
                      }}
                    >
                      {otpSending ? "Sending..." : "Send code"}
                    </Button>
                  </div>
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
                  {otpStatus ? (
                    <p className="text-muted-foreground text-sm">{otpStatus}</p>
                  ) : null}
                  {error ? <p className="text-destructive text-sm">{error}</p> : null}
                  <Button
                    className="w-full"
                    disabled={otpSigningIn || !otpForm.getValues("email") || (otpForm.getValues("otp")?.length ?? 0) !== 6}
                    onClick={async () => {
                      setError(undefined);
                      setOtpSigningIn(true);
                      try {
                        const result = await authClient.signIn.emailOtp({
                          email: otpForm.getValues("email"),
                          otp: otpForm.getValues("otp"),
                        });
                        if (result.error) {
                          setError(result.error.message ?? "Failed to sign in");
                        } else {
                          router.push(redirectTo ?? "/");
                        }
                      } catch (e) {
                        const message =
                          e instanceof Error ? e.message : "Failed to sign in";
                        setError(message);
                      } finally {
                        setOtpSigningIn(false);
                      }
                    }}
                  >
                    {otpSigningIn ? "Signing in..." : "Sign in with code"}
                  </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </Unauthenticated>
        <AuthLoading>Loading...</AuthLoading>
        <Authenticated>
          <Button onClick={() => authClient.signOut()}>Sign out</Button>
        </Authenticated>
      </div>
    </div>
  );
}
