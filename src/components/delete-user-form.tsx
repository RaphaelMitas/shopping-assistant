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
import { LoaderCircle } from "lucide-react";

const schema = z.object({
  confirm: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => v === "DELETE", {
      message: 'Type "DELETE" to confirm',
    }),
});

export type DeleteUserValues = z.input<typeof schema>;

export type DeleteUserFormProps = Omit<
  React.ComponentProps<"div">,
  "onSubmit"
> & {
  onSubmit?: (values: DeleteUserValues) => void | Promise<void>;
  submitError?: string;
};

export function DeleteUserForm({
  className,
  onSubmit,
  submitError,
  ...props
}: DeleteUserFormProps) {
  const form = useForm<
    z.input<typeof schema>,
    unknown,
    z.output<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: { confirm: "" },
    mode: "onSubmit",
  });

  const handleSubmit = useCallback(
    async (values: DeleteUserValues) => {
      if (onSubmit) {
        await onSubmit(values);
        return;
      }
      ("Delete user confirmed");
    },
    [onSubmit],
  );

  const isConfirmed =
    (form.watch("confirm") ?? "").toString().trim().toUpperCase() === "DELETE";

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
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel htmlFor="confirm">
                      To confirm, type DELETE
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="confirm"
                        type="text"
                        value={field.value}
                        autoComplete="off"
                        placeholder="DELETE"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {submitError && <FormMessage>{submitError}</FormMessage>}
              <Button
                type="submit"
                className="w-full"
                variant="destructive"
                disabled={!isConfirmed || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
