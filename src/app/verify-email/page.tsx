"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const [email, setEmail] = useState<string>(initialEmail);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const onResend = useCallback(async () => {
    setStatus(undefined);
    setError(undefined);
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const result = await sendVerifyEmail({ email });
      if (result?.error) {
        setError(result.error);
      } else {
        setStatus("Verification email sent. Please check your inbox.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to send email";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [email]);

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
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {status ? (
              <p className="text-sm text-muted-foreground">{status}</p>
            ) : null}
            {error ? <FormMessage>{error}</FormMessage> : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" onClick={onResend} disabled={loading}>
              {loading ? "Sending..." : "Resend verification email"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already verified? <a href="/login" className="underline underline-offset-4">Login</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

