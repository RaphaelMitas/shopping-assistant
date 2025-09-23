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

export default function Page() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
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
                <div className="flex flex-col gap-3">
                  <Input
                    id="otp-email"
                    type="email"
                    placeholder="m@example.com"
                    value={otpEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOtpEmail(e.target.value)
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      className="w-full"
                      disabled={otpSending || !otpEmail}
                      onClick={async () => {
                        setOtpStatus(undefined);
                        setError(undefined);
                        setOtpSending(true);
                        try {
                          const { error: sendError } =
                            await authClient.emailOtp.sendVerificationOtp({
                              email: otpEmail,
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
                  <Input
                    id="otp"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOtpCode(e.target.value)
                    }
                  />
                  {otpStatus ? (
                    <p className="text-muted-foreground text-sm">{otpStatus}</p>
                  ) : null}
                  {error ? <p className="text-destructive text-sm">{error}</p> : null}
                  <Button
                    className="w-full"
                    disabled={otpSigningIn || !otpEmail || !otpCode}
                    onClick={async () => {
                      setError(undefined);
                      setOtpSigningIn(true);
                      try {
                        const result = await authClient.signIn.emailOtp({
                          email: otpEmail,
                          otp: otpCode,
                        });
                        if (result.data?.redirect) {
                          router.push(result.data.url ?? redirectTo ?? "/");
                        } else {
                          setError(result.error?.message ?? "Failed to sign in");
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
                </div>
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
