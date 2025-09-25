"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogIn,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { api } from "convex/_generated/api";
import { Skeleton } from "./ui/skeleton";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import type { User } from "better-auth";
import { useCustomer } from "autumn-js/react";
import { type CustomerProduct } from "autumn-js";
import { Progress } from "./ui/progress";

export function NavUser() {
  return (
    <SidebarMenu>
      <Unauthenticated>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/login">
                <LogIn />
                Login
              </Link>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </Unauthenticated>
      <AuthLoading>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <UserAvatar user={undefined} activeProduct={undefined} />
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </AuthLoading>
      <Authenticated>
        <NavUserAuthenticated />
      </Authenticated>
    </SidebarMenu>
  );
}

const NavUserAuthenticated = () => {
  const user = useQuery(api.users.getCurrentUser);
  const { isMobile } = useSidebar();
  const { customer, check } = useCustomer();
  const { data: aiTokens } = check({ featureId: "ai_tokens" });

  const activeProduct = customer?.products.find(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    (product) => product.status === "active",
  );

  return (
    <>
      {aiTokens.usage !== undefined && aiTokens.included_usage !== undefined ? (
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="flex flex-col gap-2">
            AI Tokens used: {aiTokens.usage}/{aiTokens.included_usage}
            <Progress
              value={(aiTokens.usage / aiTokens.included_usage) * 100}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ) : null}
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={!user}
            >
              <UserAvatar user={user} activeProduct={activeProduct} />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar user={user} activeProduct={activeProduct} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {activeProduct?.id === "premium" ? null : (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing">
                      <Sparkles />
                      Upgrade to Premium
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/account">
                  <BadgeCheck />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pricing">
                  <CreditCard />
                  Billing
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => authClient.signOut()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </>
  );
};

const UserAvatar = ({
  user,
  activeProduct: premiumProduct,
}: {
  user: Pick<User, "name" | "image" | "email"> | undefined;
  activeProduct: CustomerProduct | undefined;
}) => {
  const shortName = user?.name?.substring(0, 2).toUpperCase();
  if (!user) {
    return (
      <>
        <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
        <div className="flex w-full flex-col gap-1">
          <Skeleton className="h-3 w-full rounded-lg" />
          <Skeleton className="h-2 w-full rounded-lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={user?.image ?? undefined} alt={user?.name} />
        <AvatarFallback className="rounded-lg">{shortName}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium">{user?.name}</span>
          {premiumProduct ? (
            <span className="text-muted-foreground shrink-0 text-xs">
              {premiumProduct.name}
            </span>
          ) : null}
        </div>
        <span className="truncate text-xs">{user?.email}</span>
      </div>
    </>
  );
};
