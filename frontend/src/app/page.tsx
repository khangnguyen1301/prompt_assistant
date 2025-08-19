import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ChatLayout } from "@/components/chat/chat-layout";

export default async function Home() {
  const { userId } = auth();

  // If user is not authenticated, redirect to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="h-screen">
      <ChatLayout />
    </main>
  );
}
