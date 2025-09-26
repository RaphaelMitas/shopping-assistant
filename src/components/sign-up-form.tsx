"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signUp } from "@/app/actions";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export type SignUpFormProps = Omit<React.ComponentProps<"div">, "onSubmit">;

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect_to = searchParams.get("redirect_to");

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onSubmit",
  });

  const handleSubmit = async (values: SignUpFormValues): Promise<void> => {
    const result = await signUp(values);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(
      `/sign-up/success?email=${encodeURIComponent(values.email)}${
        redirect_to ? `&redirect_to=${encodeURIComponent(redirect_to)}` : ""
      }`,
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your email and password to sign up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="name"
                          type="text"
                          placeholder="John Doe"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <a
                          href="/forgot-password"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          id="password"
                          placeholder="********"
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormMessage>{error}</FormMessage>
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full">
                    Sign up
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account? {""}
                <a
                  href={
                    redirect_to
                      ? `/login?redirect_to=${encodeURIComponent(redirect_to)}`
                      : "/login"
                  }
                  className="underline underline-offset-4"
                >
                  Login
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
