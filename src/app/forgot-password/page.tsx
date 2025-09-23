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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
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
            <div className="flex flex-col gap-3">
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
              <Button
                className="w-full"
                disabled={sending || !email}
                onClick={async () => {
                  setError(undefined);
                  setStatus(undefined);
                  setSending(true);
                  try {
                    const { error: sendError } =
                      await authClient.forgetPassword.emailOtp({ email });
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

              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
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
              <Input
                id="new-password"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
              {status ? (
                <p className="text-muted-foreground text-sm">{status}</p>
              ) : null}
              {error ? <p className="text-destructive text-sm">{error}</p> : null}
              <Button
                className="w-full"
                disabled={resetting || !email || !otp || password.length < 8}
                onClick={async () => {
                  setError(undefined);
                  setResetting(true);
                  try {
                    const { error: resetError } = await authClient.emailOtp.resetPassword({
                      email,
                      otp,
                      password,
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
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
