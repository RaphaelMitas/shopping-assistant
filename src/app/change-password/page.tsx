"use client";

import {
  ChangePasswordForm,
  type ChangePasswordValues,
} from "@/components/change-password-form";
import { Authenticated, AuthLoading, useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { updatePassword } from "../actions";
import { useState } from "react";

export default function ChangePasswordPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [error, setError] = useState<string | undefined>();
  if (!isLoading && !isAuthenticated) {
    redirect("/login?redirectTo=/change-password");
  }
  const handleSubmit = async (values: ChangePasswordValues) => {
    const result = await updatePassword(values);
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      redirect("/");
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <AuthLoading>Loading...</AuthLoading>
        <Authenticated>
          <ChangePasswordForm onSubmit={handleSubmit} submitError={error} />
        </Authenticated>
      </div>
    </main>
  );
}
