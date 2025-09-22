"use client";

import { SignUpForm, type SignUpFormValues } from "@/components/sign-up-form";
import { signUp } from "../actions";
import { useState } from "react";

export default function SignUpPage() {
  const [error, setError] = useState<string | undefined>();
  const handleSubmit = async (values: SignUpFormValues): Promise<void> => {
    const result = await signUp(values);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <SignUpForm onSubmit={handleSubmit} submitError={error} />
      </div>
    </main>
  );
}
