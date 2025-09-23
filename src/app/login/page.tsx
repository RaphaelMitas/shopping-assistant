"use client";

import { LoginForm, type LoginFormValues } from "@/components/login-form";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
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
        </Unauthenticated>
        <AuthLoading>Loading...</AuthLoading>
        <Authenticated>
          <Button onClick={() => authClient.signOut()}>Sign out</Button>
        </Authenticated>
      </div>
    </div>
  );
}
