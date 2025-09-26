import { use } from "react";
import Link from "next/link";

export const LoginLinkWithRedirect = ({
  searchParams,
}: {
  searchParams: Promise<{ redirect_to?: string }>;
}) => {
  const { redirect_to } = use(searchParams);
  return (
    <Link
      href={
        redirect_to
          ? `/login?redirect_to=${encodeURIComponent(redirect_to)}`
          : "/login"
      }
      className="underline underline-offset-4"
    >
      Login
    </Link>
  );
};
