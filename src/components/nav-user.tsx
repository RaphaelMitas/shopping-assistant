"use client";

import {
  BadgeCheck,
  Bell,
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
            <UserAvatar user={undefined} />
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

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            disabled={!user}
          >
            <UserAvatar user={user} />
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
              <UserAvatar user={user} />
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/upgrade">
                <Sparkles />
                Upgrade to Pro
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              Notifications
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
  );
};

const UserAvatar = ({
  user,
}: {
  user: Pick<User, "name" | "image" | "email"> | undefined;
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
        <span className="truncate font-medium">{user?.name}</span>
        <span className="truncate text-xs">{user?.email}</span>
      </div>
    </>
  );
};
