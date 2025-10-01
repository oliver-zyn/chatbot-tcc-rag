import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { getConversationById, getMessagesByConversationId } from "@/lib/db/queries";
import { Chat } from "@/components/chat";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const conversation = await getConversationById(params.id);

  if (!conversation) {
    notFound();
  }

  // Verifica se a conversa pertence ao usuário
  if (conversation.userId !== session.user.id) {
    notFound();
  }

  const messages = await getMessagesByConversationId(params.id);

  return (
    <Chat
      conversationId={params.id}
      initialMessages={messages}
      conversationTitle={conversation.title}
    />
  );
}
