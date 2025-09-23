import { Heading, Text } from "@react-email/components";
import React from "react";
import { BaseEmail, styles } from "./components/BaseEmail";

interface VerifyEmailOtpProps {
  code: string;
  brandName?: string;
  brandTagline?: string;
  brandLogoUrl?: string;
}

export default function VerifyEmailOtp({
  code,
  brandName,
  brandTagline,
  brandLogoUrl,
}: VerifyEmailOtpProps) {
  return (
    <BaseEmail
      previewText="Your verification code"
      brandName={brandName}
      brandTagline={brandTagline}
      brandLogoUrl={brandLogoUrl}
    >
      <Heading style={styles.h1}>Verify your email</Heading>
      <Text style={styles.text}>Use this code to verify your email:</Text>
      <div
        style={{
          fontSize: 32,
          letterSpacing: 4,
          fontWeight: 700,
          margin: "12px 0 20px",
          textAlign: "center",
        }}
      >
        {code}
      </div>
      <Text style={styles.text}>This code expires in 10 minutes.</Text>
      <Text style={{ ...styles.text, color: "#ababab", marginTop: 14 }}>
        If you didn&apos;t create an account, you can safely ignore this email.
      </Text>
    </BaseEmail>
  );
}

