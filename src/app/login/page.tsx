"use client";

import { LoginForm } from "@/components/login-form";
import { authClient } from "@/lib/auth-client";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Unauthenticated>
          <LoginForm />
        </Unauthenticated>
        <AuthLoading>Loading...</AuthLoading>
        <Authenticated>
          <Button onClick={() => authClient.signOut()}>Sign out</Button>
        </Authenticated>
      </div>
    </div>
  );
}
