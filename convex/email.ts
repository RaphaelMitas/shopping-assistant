import "./polyfills";
import VerifyEmail from "./emails/verifyEmail";
import { render } from "@react-email/components";
import React from "react";
import ResetPasswordEmail from "./emails/resetPassword";
import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { type ActionCtx } from "./_generated/server";

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
