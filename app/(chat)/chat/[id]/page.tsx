import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { getConversationById, getMessagesByConversationId, getAllDocuments, getVotesByMessageIds } from "@/lib/db/queries";
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

  if (conversation.userId !== session.user.id) {
    notFound();
  }

  const messages = await getMessagesByConversationId(params.id);
  const documents = await getAllDocuments();

  // Busca todos os votos de uma vez
  const messageIds = messages.map(m => m.id);
  const votes = await getVotesByMessageIds(messageIds, session.user.id);

  // Cria um mapa de votos por messageId para acesso rápido
  const votesMap = new Map(votes.map(v => [v.messageId, v]));

  return (
    <Chat
      conversationId={params.id}
      initialMessages={messages}
      conversationTitle={conversation.title}
      documents={documents}
      initialVotes={votesMap}
    />
  );
}
