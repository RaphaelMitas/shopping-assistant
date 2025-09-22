"use server";

import { fetchAction, fetchMutation } from "convex/nextjs";
import { api } from "convex/_generated/api";
import { getToken } from "../lib/auth-server";

// Authenticated mutation via server function
export async function updatePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  const token = await getToken();
  return await fetchMutation(
    api.users.updateUserPassword,
    { currentPassword, newPassword },
    { token },
  );
}

export async function signUp({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const token = await getToken();
  return await fetchAction(
    api.users.signUp,
    { name, email, password },
    { token },
  );
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const token = await getToken();
  const result = await fetchMutation(
    api.users.signIn,
    { email, password },
    { token },
  );
  return result;
}

export async function resetPassword({ email }: { email: string }) {
  const token = await getToken();
  return await fetchAction(api.users.resetPassword, { email }, { token });
}

export async function sendVerifyEmail({ email }: { email: string }) {
  const token = await getToken();
  return await fetchAction(api.users.sendVerifyEmail, { email }, { token });
}

export async function deleteUser() {
  const token = await getToken();
  return await fetchMutation(api.users.deleteUser, {}, { token });
}
