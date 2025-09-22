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
  confirm: z.boolean().refine((v) => v === true, {
    message: "You must confirm to proceed",
  }),
});

export type DeleteUserValues = z.infer<typeof schema>;

export type DeleteUserFormProps = Omit<
  React.ComponentProps<"div">,
  "onSubmit"
> & {
  onSubmit?: (values: DeleteUserValues) => void | Promise<void>;
};

export function DeleteUserForm({
  className,
  onSubmit,
  ...props
}: DeleteUserFormProps) {
  const form = useForm<DeleteUserValues>({
    resolver: zodResolver(schema),
    defaultValues: { confirm: false },
    mode: "onSubmit",
  });

  const handleSubmit = useCallback(
    async (values: DeleteUserValues) => {
      if (onSubmit) {
        await onSubmit(values);
        return;
      }
      console.log("Delete user confirmed");
    },
    [onSubmit],
  );

  const isConfirmed = form.watch("confirm");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Delete your account</CardTitle>
          <CardDescription>
            This action is permanent and cannot be undone.
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
                name="confirm"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3">
                    <FormControl>
                      <Input
                        id="confirm"
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel htmlFor="confirm">
                        I understand this will permanently delete my account and
                        data.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                variant="destructive"
                disabled={!isConfirmed}
              >
                Delete account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
