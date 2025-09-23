import "./polyfills";
import VerifyEmail from "./emails/verifyEmail";
import { render } from "@react-email/components";
import React from "react";
import ResetPasswordEmail from "./emails/resetPassword";
import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { type ActionCtx } from "./_generated/server";
import OtpEmail from "./emails/otp";

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
});

export const sendEmailVerification = async (
  ctx: ActionCtx,
  {
    to,
    url,
  }: {
    to: string;
    url: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from: "Shopping Assistant (noreply) <noreply@shopping-assistant.raphaelmitas.com>",
    to,
    subject: "Verify your email address",
    html: await render(React.createElement(VerifyEmail, { url })),
  });
};

export const sendResetPassword = async (
  ctx: ActionCtx,
  {
    to,
    url,
  }: {
    to: string;
    url: string;
  },
) => {
  await resend.sendEmail(ctx, {
    from: "Shopping Assistant (noreply) <noreply@shopping-assistant.raphaelmitas.com>",
    to,
    subject: "Reset your password",
    html: await render(React.createElement(ResetPasswordEmail, { url })),
  });
};

export const sendOtpEmail = async (
  ctx: ActionCtx,
  {
    to,
    otp,
    type,
  }: {
    to: string;
    otp: string;
    type: "sign-in" | "email-verification" | "forget-password";
  },
) => {
  const subject =
    type === "sign-in"
      ? `Your sign-in code: ${otp}`
      : type === "email-verification"
        ? `Verify your email code: ${otp}`
        : `Reset password code: ${otp}`;
  await resend.sendEmail(ctx, {
    from: "Shopping Assistant (noreply) <noreply@shopping-assistant.raphaelmitas.com>",
    to,
    subject,
    html: await render(
      React.createElement(OtpEmail, {
        otp,
        type,
      }),
    ),
  });
};
