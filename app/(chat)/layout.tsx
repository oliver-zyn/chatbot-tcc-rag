import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { getConversationsByUserId } from "@/lib/db/queries";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebarWrapper } from "@/components/app-sidebar-wrapper";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const conversations = await getConversationsByUserId(session.user.id);

  return (
    <SidebarProvider>
      <div className="flex h-full w-full">
        <AppSidebarWrapper
          user={{
            name: session.user.name || "Usuário",
            email: session.user.email || "",
          }}
          conversations={conversations}
        />
        <main className="flex-1 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
