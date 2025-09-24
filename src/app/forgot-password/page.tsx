"use client";

import {
  ForgotPasswordForm,
  type ForgotPasswordValues,
} from "@/components/forgot-password-form";
import { resetPassword } from "../actions";

export default function ForgotPasswordPage() {
  const handleSubmit = async (values: ForgotPasswordValues) => {
    await resetPassword(values);
  };
  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
