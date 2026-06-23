import { redirect } from "next/navigation";

import { getUserId } from "@/server/auth";

export default async function Home() {
  const userId = await getUserId();
  redirect(userId ? "/calendar" : "/login");
}
