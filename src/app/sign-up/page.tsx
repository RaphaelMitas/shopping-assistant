"use client";

import { SignUpForm, type SignUpFormValues } from "@/components/sign-up-form";
import { signUp } from "../actions";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const handleSubmit = async (values: SignUpFormValues): Promise<void> => {
    const result = await signUp(values);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(
      `/sign-up/success?email=${encodeURIComponent(values.email)}${
        redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ""
      }`,
    );
  };

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <SignUpForm onSubmit={handleSubmit} submitError={error} />
      </div>
    </div>
  );
}
