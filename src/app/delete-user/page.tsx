"use client";

import {
  DeleteUserForm,
  type DeleteUserValues,
} from "@/components/delete-user-form";
import { deleteUser, signIn } from "../actions";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { LoginForm, type LoginFormValues } from "@/components/login-form";
import { useState } from "react";
import { api } from "convex/_generated/api";

export default function DeleteUserPage() {
  const user = useQuery(api.users.getCurrentUser);

  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const handleLoginSubmit = async (values: LoginFormValues): Promise<void> => {
    setLoginError(undefined);
    const result = await signIn(values);
    console.log(result);
    if (result.error) {
      setLoginError(result.error);
    }
  };

  const handleSubmit = async (_values: DeleteUserValues) => {
    const result = await deleteUser();
    console.log(result);
  };

  console.log("user", user);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Unauthenticated>
          <LoginForm onSubmit={handleLoginSubmit} submitError={loginError} />
        </Unauthenticated>
        <Authenticated>
          <DeleteUserForm onSubmit={handleSubmit} />
        </Authenticated>
      </div>
    </main>
  );
}
