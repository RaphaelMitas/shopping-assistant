import { getToken } from "@/lib/auth-server";
import StartThread from "./StartThread";
import { redirect } from "next/navigation";

export default async function ThreadPage() {
  const token = await getToken();

  if (!token) {
    return redirect(`/login?redirect_to=${encodeURIComponent("/thread")}`);
  }

  return <StartThread />;
}
