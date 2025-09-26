"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignUpSuccessPage() {
  const searchParams = useSearchParams();
  const email = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const redirectTo = useMemo(
    () => searchParams.get("redirectTo") ?? "",
    [searchParams],
  );

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a 6-digit verification code to {email || "your email"}.
              Enter it to finish creating your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Didn&apos;t get the email? It may take a couple of minutes. You can
            resend a code from the verification page.
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link
              href={`/verify-email?email=${encodeURIComponent(email)}${
                redirectTo
                  ? `&redirectTo=${encodeURIComponent(redirectTo)}`
                  : ""
              }`}
            >
              <Button className="w-full">Go to verification</Button>
            </Link>
            <p className="text-muted-foreground text-center text-sm">
              Already verified?{" "}
              <a
                href={
                  redirectTo
                    ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
                    : "/login"
                }
                className="underline underline-offset-4"
              >
                Login
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
