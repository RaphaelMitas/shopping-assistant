"use client";

import { Trash2 } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain() {
  const threadList = useQuery(api.threads.getThreadList);
  const pathname = usePathname();
  const deleteThread = useMutation(
    api.threads.deleteThread,
  ).withOptimisticUpdate((state, mutation) => {
    const threadListState = state.getQuery(api.threads.getThreadList);
    state.setQuery(
      api.threads.getThreadList,
      {},
      threadListState?.filter((item) => item._id !== mutation.threadId),
    );
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarMenu>
        {threadList?.map((item) => (
          <SidebarMenuItem key={item._id}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={pathname === `/thread/${item._id}`}
            >
              <Link href={`/thread/${item._id}`}>
                {/* <DynamicIcon className="size-4" name={item.icon} /> */}
                <span>{item.title ?? "New Chat"}</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuAction
              onClick={async () => {
                await deleteThread({ threadId: item._id });
              }}
              showOnHover
              className="hover:text-destructive cursor-pointer"
            >
              <Trash2 />
            </SidebarMenuAction>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
