"use client";

import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { use } from "react";

export const CheckEmailDescription = ({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) => {
  const params = use(searchParams);
  return (
    <CardDescription>
      We sent a verification link to {params.email ?? "your email"}. Verify your
      email to finish creating your account.
    </CardDescription>
  );
};

export const GoToVerificationButton = ({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; redirect_to?: string }>;
}) => {
  const { email, redirect_to } = use(searchParams);
  if (!email) {
    return null;
  }

  return (
    <Link
      href={`/verify-email?email=${encodeURIComponent(email)}${
        redirect_to ? `&redirect_to=${encodeURIComponent(redirect_to)}` : ""
      }`}
    >
      <Button className="w-full">Go to verification</Button>
    </Link>
  );
};

export const LoginLink = ({
  searchParams,
}: {
  searchParams: Promise<{ redirect_to?: string }>;
}) => {
  const { redirect_to } = use(searchParams);
  return (
    <Link
      href={
        redirect_to
          ? `/login?redirect_to=${encodeURIComponent(redirect_to)}`
          : "/login"
      }
      className="underline underline-offset-4"
    >
      Login
    </Link>
  );
};
