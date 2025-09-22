import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { createAuth, authComponent } from "./auth";

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
