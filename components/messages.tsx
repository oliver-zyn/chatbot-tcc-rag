import { Brain, User, Loader2, FileText } from "lucide-react";
import { ConfidenceBadge } from "@/components/confidence-badge";
import type { Message } from "@/lib/db/schema/messages";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function Messages({ messages, isLoading }: MessagesProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Brain className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Comece uma conversa</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Faça uma pergunta sobre seus documentos e receberei uma resposta contextualizada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          {message.role === "assistant" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
          )}

          <div className={cn("flex flex-col gap-2 max-w-[80%]")}>
            <div
              className={cn(
                "rounded-lg px-4 py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>

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
          </div>

          {message.role === "user" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 justify-start">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Pensando...</span>
          </div>
        </div>
      )}
    </div>
  );
}
