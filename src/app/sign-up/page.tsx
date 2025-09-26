import { SignUpForm } from "@/components/sign-up-form";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
