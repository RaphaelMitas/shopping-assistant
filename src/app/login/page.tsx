"use client";

import { LoginForm, type LoginFormValues } from "@/components/login-form";
import { signIn } from "../actions";
import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";

export default function Page() {
  const [error, setError] = useState<string | undefined>(undefined);
  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    setError(undefined);
    const result = await signIn(values);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Unauthenticated>
          <LoginForm onSubmit={handleSubmit} submitError={error} />
        </Unauthenticated>
        <Authenticated>
          <div>Logged in</div>
        </Authenticated>
      </div>
    </div>
  );
}
