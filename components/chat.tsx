"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Messages } from "@/components/messages";
import { PageHeader } from "@/components/page-header";
import { DocumentSelector } from "@/components/document-selector";
import { SimilarityControl } from "@/components/similarity-control";
import { TicketNumberInput } from "@/components/ticket-number-input";
import { findDocumentByTicketNumberAction } from "@/lib/actions/tickets";
import { sendMessage } from "@/lib/actions/messages";
import type { Message } from "@/lib/db/schema/messages";
import type { Document } from "@/lib/db/schema/documents";
import type { Vote } from "@/lib/db/schema/votes";
import { toast } from "sonner";

interface ChatProps {
  conversationId: string;
  initialMessages: Message[];
  conversationTitle: string;
  documents: Document[];
  initialVotes: Map<string, Vote>;
}

export function Chat({ conversationId, initialMessages, conversationTitle, documents, initialVotes }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.3);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 150;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    scrollToBottom("auto");
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(async (e: React.FormEvent, messageToSend?: string) => {
    e.preventDefault();

    const userMessage = messageToSend || input.trim();
    if (!userMessage || isLoading) return;

    if (!messageToSend) {
      setInput("");
    }
    setIsLoading(true);

    let documentIdToUse = selectedDocumentId;

    // Se um número de ticket foi especificado, busca o documento correspondente
    if (ticketNumber) {
      const result = await findDocumentByTicketNumberAction(ticketNumber);
      if (!result.success || !result.data) {
        toast.error(`Ticket #${ticketNumber} não encontrado`);
        setIsLoading(false);
        return;
      }
      documentIdToUse = result.data.id;
    }

    const selectedDocument = documents.find(doc => doc.id === documentIdToUse);

    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      role: "user",
      content: userMessage,
      sources: null,
      contextDocument: selectedDocument?.fileName || null,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const result = await sendMessage(
        conversationId,
        userMessage,
        documentIdToUse,
        similarityThreshold
      );

      if (result.success) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMessage.id),
          result.data.userMessage,
          result.data.assistantMessage,
        ]);
      } else {
        toast.error(result.error);
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, conversationId, selectedDocumentId, similarityThreshold, documents, ticketNumber]);

  const handleRegenerateLastMessage = useCallback(async () => {
    if (isLoading || messages.length < 2) return;

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");

    if (!lastUserMessage) return;

    setIsLoading(true);

    try {
      const result = await sendMessage(
        conversationId,
        lastUserMessage.content,
        selectedDocumentId,
        similarityThreshold
      );

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          result.data.userMessage,
          result.data.assistantMessage,
        ]);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Erro ao reenviar mensagem");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, conversationId, selectedDocumentId, similarityThreshold]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <>
      <PageHeader title={conversationTitle} />
      <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-background relative">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ overflowAnchor: "none" }}
        >
          <Messages
            messages={messages}
            isLoading={isLoading}
            onRegenerateLastMessage={handleRegenerateLastMessage}
            votesMap={initialVotes}
          />
          <div ref={messagesEndRef} className="h-6" />
        </div>

        {!isAtBottom && (
          <div className="absolute bottom-40 inset-x-0 flex justify-center z-10 pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              aria-label="Rolar para o final"
              className="rounded-full shadow-lg transition-all hover:shadow-xl pointer-events-auto"
              onClick={() => scrollToBottom("smooth")}
              type="button"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-3xl flex-col gap-3 border-t bg-background px-4 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <TicketNumberInput
              ticketNumber={ticketNumber}
              onTicketNumberChange={(ticket) => {
                setTicketNumber(ticket);
                // Se selecionar ticket, limpa documento
                if (ticket) {
                  setSelectedDocumentId(null);
                }
              }}
              disabled={!!selectedDocumentId}
            />
            <DocumentSelector
              documents={documents}
              selectedDocumentId={selectedDocumentId}
              onSelectDocument={(docId) => {
                setSelectedDocumentId(docId);
                // Se selecionar documento, limpa ticket
                if (docId) {
                  setTicketNumber(null);
                }
              }}
              disabled={!!ticketNumber}
            />
            <SimilarityControl
              value={similarityThreshold}
              onChange={setSimilarityThreshold}
            />
          </div>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                ticketNumber
                  ? `Faça uma pergunta sobre o ticket #${ticketNumber}...`
                  : selectedDocumentId
                  ? "Faça uma pergunta sobre este documento..."
                  : "Faça uma pergunta sobre seus documentos..."
              }
              className="min-h-[60px] max-h-[200px] resize-none flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-[60px] w-[60px] shrink-0"
              aria-label="Enviar mensagem"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
