"use client";

import { useCallback } from "react";
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

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export type ForgotPasswordValues = z.infer<typeof schema>;

export type ForgotPasswordFormProps = Omit<
  React.ComponentProps<"div">,
  "onSubmit"
> & {
  onSubmit?: (values: ForgotPasswordValues) => void | Promise<void>;
};

export function ForgotPasswordForm({
  className,
  onSubmit,
  ...props
}: ForgotPasswordFormProps) {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const handleSubmit = useCallback(
    async (values: ForgotPasswordValues) => {
      if (onSubmit) {
        await onSubmit(values);
      }
    },
    [onSubmit],
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email and well send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-6"
            >
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
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
