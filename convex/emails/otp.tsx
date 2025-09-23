import { Heading, Text } from "@react-email/components";
import React from "react";
import { BaseEmail, styles } from "./components/BaseEmail";

interface OtpEmailProps {
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
  brandName?: string;
  brandTagline?: string;
  brandLogoUrl?: string;
}

export default function OtpEmail({
  otp,
  type,
  brandName,
  brandTagline,
  brandLogoUrl,
}: OtpEmailProps) {
  const title =
    type === "sign-in"
      ? "Your sign-in code"
      : type === "email-verification"
        ? "Verify your email code"
        : "Reset password code";
  const helpText =
    type === "sign-in"
      ? "Use this code to sign in."
      : type === "email-verification"
        ? "Use this code to verify your email address."
        : "Use this code to reset your password.";

  return (
    <BaseEmail
      previewText={`${title}: ${otp}`}
      brandName={brandName}
      brandTagline={brandTagline}
      brandLogoUrl={brandLogoUrl}
    >
      <Heading style={styles.h1}>{title}</Heading>
      <div style={styles.code}>{otp}</div>
      <Text style={styles.text}>{helpText}</Text>
      <Text style={{ ...styles.text, color: "#ababab" }}>
        If you didn&apos;t request this, you can safely ignore this email.
      </Text>
    </BaseEmail>
  );
}

