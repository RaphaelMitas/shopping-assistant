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

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a verification link to {email || "your email"}. Verify your email to finish creating your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Didn&apos;t get the email? It may take a couple of minutes. You can also resend it from the verification page.
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link href={`/verify-email?email=${encodeURIComponent(email)}`}>
              <Button className="w-full">Go to verification</Button>
            </Link>
            <p className="text-center text-sm text-muted-foreground">
              Already verified? <a href="/login" className="underline underline-offset-4">Login</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

