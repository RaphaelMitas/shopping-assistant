import { Button } from "@/components/ui/button";
import Link from "next/link";
import { use } from "react";

export const RedirectToButton = ({
  searchParams,
}: {
  searchParams: Promise<{ redirect_to?: string }>;
}) => {
  const { redirect_to } = use(searchParams);
  console.log("redirect_to", redirect_to);
  return (
    <Button asChild>
      <Link href={redirect_to ?? "/"}>Continue</Link>
    </Button>
  );
};
