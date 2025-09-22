import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { createAuth, authComponent } from "./auth";

export const updateUserPassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await createAuth(ctx).api.changePassword({
      body: {
        currentPassword: args.currentPassword,
        newPassword: args.newPassword,
      },
      headers: await authComponent.getHeaders(ctx),
    });
  },
});

export const signUp = mutation({
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
        headers: await authComponent.getHeaders(ctx),
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
