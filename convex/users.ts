import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { createAuth, authComponent } from "./auth";
import { sendEmailVerificationCode } from "./email";

export const updateUserPassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await createAuth(ctx).api.changePassword({
        body: {
          currentPassword: args.currentPassword,
          newPassword: args.newPassword,
        },
        headers: await authComponent.getHeaders(ctx),
      });
      return { success: "Password updated successfully" };
    } catch (error) {
      console.error(error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to update password",
      };
    }
  },
});

export const signUp = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await createAuth(ctx).api.signUpEmail({
        body: {
          name: args.name,
          email: args.email,
          password: args.password,
        },
      });
      return { success: "Signed up successfully" };
    } catch (error) {
      console.error(error);
      return {
        error: error instanceof Error ? error.message : "Failed to sign up",
      };
    }
  },
});

export const resetPassword = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await createAuth(ctx).api.forgetPassword({
      body: {
        email: args.email,
        redirectTo: `${process.env.SITE_URL}/`,
      },
    });
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await createAuth(ctx).api.signInEmail({
        body: {
          email: args.email,
          password: args.password,
        },
        headers: await authComponent.getHeaders(ctx),
      });
      return { success: "Signed in successfully", result };
    } catch (error) {
      console.error(error);
      return {
        error: error instanceof Error ? error.message : "Failed to sign in",
      };
    }
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.getAuthUser(ctx);
  },
});

export const sendVerifyEmail = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const result = await createAuth(ctx).api.sendVerificationEmail({
        body: {
          email: args.email,
          callbackURL: `${process.env.SITE_URL}/`,
        },
      });
      if (result.status === false) {
        return {
          error: "Failed to send verification email",
        };
      }
      return { success: "Email verification email sent successfully" };
    } catch (error) {
      console.error(error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send verification email",
      };
    }
  },
});

export const sendVerificationCode = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const actionAuth = createAuth(ctx);
    // Ensure a fresh verification URL is generated and stored via our auth hook
    try {
      await actionAuth.api.sendVerificationEmail({
        body: {
          email: args.email,
          callbackURL: `${process.env.SITE_URL}/`,
        },
      });
    } catch (e) {
      // non-fatal; we might already have a stored URL
      console.warn("sendVerificationEmail failed before OTP", e);
    }

    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    // Remove previous OTPs for this email
    const existingOtps = await ctx.db.query("emailOtps").collect();
    for (const otp of existingOtps) {
      if ((otp as any).email === args.email) {
        await ctx.db.delete((otp as any)._id);
      }
    }

    await ctx.db.insert("emailOtps", {
      email: args.email,
      code,
      attempts: 0,
      createdAt: now,
      expiresAt,
    });

    await sendEmailVerificationCode(ctx, { to: args.email, code });

    return { success: "Verification code sent" };
  },
});

export const verifyEmailCode = action({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    // Find OTP for email
    const otps = await ctx.db.query("emailOtps").collect();
    const otpDoc = otps
      .filter((d: any) => d.email === args.email)
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0] as
      | (Record<string, any> & { _id: any })
      | undefined;

    if (!otpDoc) {
      return { error: "No code found. Please request a new code." };
    }
    if (otpDoc.expiresAt < now) {
      await ctx.db.delete(otpDoc._id);
      return { error: "Code expired. Please request a new code." };
    }
    if (otpDoc.code !== args.code) {
      const attempts = (otpDoc.attempts ?? 0) + 1;
      await ctx.db.patch(otpDoc._id, { attempts });
      return { error: "Invalid code. Please try again." };
    }

    // Get stored verification URL for the email
    const verifs = await ctx.db.query("verificationUrls").collect();
    const match = verifs.find((d: any) => d.email === args.email) as
      | (Record<string, any> & { _id: any })
      | undefined;
    if (!match) {
      // Try generating one
      try {
        await createAuth(ctx).api.sendVerificationEmail({
          body: {
            email: args.email,
            callbackURL: `${process.env.SITE_URL}/`,
          },
        });
      } catch (e) {
        /* empty */
      }
    }

    const updated = match
      ? match
      : (await ctx.db.query("verificationUrls").collect()).find(
          (d: any) => d.email === args.email,
        );

    const verifyUrl = updated?.url;
    if (!verifyUrl) {
      return {
        error:
          "Unable to verify at this time. Please try resending a new code.",
      };
    }

    try {
      const res = await fetch(verifyUrl, { method: "GET" });
      if (!res.ok && res.status !== 302) {
        return { error: "Failed to complete verification. Try again." };
      }
    } catch (e) {
      return { error: "Verification request failed. Try again." };
    }

    // Cleanup used OTP
    await ctx.db.delete(otpDoc._id);
    return { success: "Email verified" };
  },
});

export const deleteUser = mutation({
  handler: async (ctx) => {
    try {
      const result = await createAuth(ctx).api.deleteUser({
        body: {
          callbackURL: `${process.env.SITE_URL}/`,
        },
        headers: await authComponent.getHeaders(ctx),
      });
      console.log("deleteUser", result);
      if (result.success === false) {
        return {
          error: result.message,
        };
      }
      return { success: result.message };
    } catch (error) {
      console.error(error);
      return {
        error: error instanceof Error ? error.message : "Failed to delete user",
      };
    }
  },
});
