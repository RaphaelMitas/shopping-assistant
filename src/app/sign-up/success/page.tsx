import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckEmailDescription,
  GoToVerificationButton,
  LoginLink,
} from "./SuccessPageElements";
import { Suspense } from "react";
import { LoginLinkWithRedirect } from "@/components/utils/loginLinkWithRedirect";

export default function SignUpSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; redirect_to?: string }>;
}) {
  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <Suspense
              fallback={
                <CheckEmailDescription
                  searchParams={Promise.resolve({ email: "your email" })}
                />
              }
            >
              <CheckEmailDescription searchParams={searchParams} />
            </Suspense>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Didn&apos;t get the email? It may take a couple of minutes. You can
            also resend it from the verification page.
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Suspense
              fallback={
                <GoToVerificationButton
                  searchParams={Promise.resolve({ email: undefined })}
                />
              }
            >
              <GoToVerificationButton searchParams={searchParams} />
            </Suspense>
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
