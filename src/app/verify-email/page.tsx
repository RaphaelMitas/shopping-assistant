"use client";

import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { VerifyEmailForm } from "./VerifyEmailForm";
import { LoginLinkWithRedirect } from "@/components/utils/loginLinkWithRedirect";
import { RedirectToButton } from "./RedirectToButton";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; redirect_to?: string }>;
}) {
  const user = useQuery(api.users.getCurrentUser);
  const isVerified = user?.emailVerified;

  if (isVerified) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Email verified</CardTitle>
              <CardDescription>
                Your email has been verified. You can now continue.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Suspense fallback={<div>Loading...</div>}>
                <RedirectToButton searchParams={searchParams} />
              </Suspense>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>
              We sent a verification link to your email. Please verify to
              continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <VerifyEmailForm
                  searchParams={Promise.resolve({ email: undefined })}
                />
              }
            >
              <VerifyEmailForm searchParams={searchParams} />
            </Suspense>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <p className="text-muted-foreground text-center text-sm">
              Already verified?{" "}
              <Suspense
                fallback={
                  <LoginLinkWithRedirect
                    searchParams={Promise.resolve({ redirect_to: undefined })}
                  />
                }
              >
                <LoginLinkWithRedirect searchParams={searchParams} />
              </Suspense>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
