"use client";

import {
  DeleteUserForm,
  type DeleteUserValues,
} from "@/components/delete-user-form";
import { deleteUser } from "../actions";
import { Authenticated, AuthLoading, useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function DeleteUserPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [error, setError] = useState<string | undefined>();
  if (!isLoading && !isAuthenticated) {
    redirect("/login?redirectTo=/delete-user");
  }

  const handleSubmit = async (_values: DeleteUserValues) => {
    const result = await deleteUser();
    if (result.error) {
      setError(result.error);
    } else {
      await authClient.signOut();
      redirect("/");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <AuthLoading>Loading...</AuthLoading>
        <Authenticated>
          <DeleteUserForm onSubmit={handleSubmit} submitError={error} />
        </Authenticated>
      </div>
    </main>
  );
}
