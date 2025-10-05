"use client";

import { User, FileText, Brain } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { MessageActions } from "@/components/message-actions";
import type { Message } from "@/lib/db/schema/messages";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MessagesProps {
  messages: Message[];
  isLoading: boolean;
  onRegenerateLastMessage?: () => void;
}

const ThinkingText = () => {
  return (
    <motion.span
      animate={{ backgroundPosition: ["100% 50%", "-100% 50%"] }}
      className="text-transparent"
      style={{
        background:
          "linear-gradient(90deg, hsl(var(--muted-foreground)) 0%, hsl(var(--muted-foreground)) 35%, hsl(var(--foreground)) 50%, hsl(var(--muted-foreground)) 65%, hsl(var(--muted-foreground)) 100%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      Pensando...
    </motion.span>
  );
};

export function Messages({ messages, isLoading, onRegenerateLastMessage }: MessagesProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full text-center px-4"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Comece uma conversa</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Faça uma pergunta sobre seus documentos e receba uma resposta contextualizada com base no conteúdo carregado.
        </p>
      </motion.div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-3xl space-y-4 md:space-y-6"
      role="log"
      aria-live="polite"
      aria-label="Histórico de mensagens"
    >
      {messages.map((message, index) => {
        const isLastAssistantMessage =
          message.role === "assistant" &&
          index === messages.length - 1;

        return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className={cn(
            "group flex gap-2 md:gap-3",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          {message.role === "assistant" && (
            <div className="-mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
              <Brain className="h-4 w-4 text-primary" />
            </div>
          )}

          <div className={cn(
            "flex flex-col gap-2",
            message.role === "user" ? "max-w-[calc(100%-2.5rem)] sm:max-w-[80%]" : "w-full"
          )}>
            <div
              className={cn(
                "rounded-2xl",
                message.role === "user"
                  ? "bg-[#006cff] text-white w-fit ml-auto break-words px-3 py-2 md:px-4 md:py-3"
                  : "bg-transparent px-0 py-0"
              )}
            >
              {message.role === "user" ? (
                <>
                  <p className="whitespace-pre-wrap break-words text-sm md:text-base">
                    {message.content}
                  </p>
                </>
              ) : (
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                    p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 last:mb-0 list-disc pl-6 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 last:mb-0 list-decimal pl-6 space-y-2">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>,
                    code: ({ className, children }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                      ) : (
                        <code className={cn("block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono", className)}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => <pre className="mb-4 last:mb-0 overflow-x-auto">{children}</pre>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic my-4">{children}</blockquote>
                    ),
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    a: ({ href, children }) => (
                      <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {message.role === "user" && message.contextDocument && (
              <div className="flex justify-end">
                <Badge variant="outline" className="text-xs gap-1 bg-white/10 border-white/20 text-white">
                  <FileText className="h-3 w-3" />
                  Contexto: {message.contextDocument}
                </Badge>
              </div>
            )}

            {message.role === "assistant" && (
              <div className="flex flex-col gap-2">
                {message.sources && message.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {message.sources.map((source, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs gap-1">
                        <FileText className="h-3 w-3" />
                        {source}
                      </Badge>
                    ))}
                  </div>
                )}
                {message.confidenceScore !== null && (
                  <ConfidenceBadge score={message.confidenceScore} />
                )}
              </div>
            )}

            <MessageActions
              messageId={message.id}
              content={message.content}
              role={message.role}
              onRegenerate={
                isLastAssistantMessage && onRegenerateLastMessage
                  ? onRegenerateLastMessage
                  : undefined
              }
            />
          </div>

          {message.role === "user" && (
            <div className="-mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#006cff]">
              <User className="h-4 w-4 text-white" />
            </div>
          )}
        </motion.div>
      );
      })}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 md:gap-3 justify-start"
        >
          <div className="-mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ThinkingText />
          </div>
        </motion.div>
      )}
    </div>
  );
}
