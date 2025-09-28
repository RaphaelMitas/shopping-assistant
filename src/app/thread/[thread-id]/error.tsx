"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { redirect, useParams } from "next/navigation";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

const ThreadError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  const params = useParams<{ "thread-id": string }>();
  const threadId = params["thread-id"];
  const isThreadAvailable = useQuery(api.threads.isThreadAvailable, {
    threadId,
  });

  if (isThreadAvailable === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderCircle className="size-10 animate-spin" />
      </div>
    );
  }

  if (isThreadAvailable !== undefined && !isThreadAvailable) {
    return redirect("/thread");
  }

  return (
    <div className="flex h-full items-center justify-center px-4">
      <Card className="w-full max-w-3xl break-words">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>{error.message}</CardContent>
        <CardFooter>
          <Button onClick={reset}>Retry</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ThreadError;
