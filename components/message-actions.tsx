"use client";

import { useState, useEffect } from "react";
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { voteMessage, removeVote, getVote } from "@/lib/actions/votes";
import type { Vote } from "@/lib/db/schema/votes";

interface MessageActionsProps {
  messageId: string;
  content: string;
  role: "user" | "assistant";
  onRegenerate?: () => void;
}

export function MessageActions({
  messageId,
  content,
  role,
  onRegenerate,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<Vote | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Load vote on mount
  useEffect(() => {
    async function loadVote() {
      const result = await getVote(messageId);
      if (result.success && result.data) {
        setVote(result.data);
      }
    }
    if (role === "assistant") {
      loadVote();
    }
  }, [messageId, role]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Mensagem copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar mensagem");
    }
  };

  const handleVote = async (isUpvoted: boolean) => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      // If clicking the same vote, remove it
      if (vote && vote.isUpvoted === isUpvoted) {
        const result = await removeVote(messageId);
        if (result.success) {
          setVote(null);
          toast.success("Voto removido");
        }
      } else {
        // Otherwise, create or update vote
        const result = await voteMessage(messageId, isUpvoted);
        if (result.success) {
          setVote({ ...vote, isUpvoted, messageId } as Vote);
          toast.success(isUpvoted ? "Resposta útil!" : "Feedback registrado");
        }
      }
    } catch (error) {
      toast.error("Erro ao votar");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? "Copiado!" : "Copiar"}</p>
          </TooltipContent>
        </Tooltip>

        {role === "assistant" && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleVote(true)}
                  disabled={isVoting}
                >
                  <ThumbsUp
                    className={`h-3.5 w-3.5 ${
                      vote?.isUpvoted ? "fill-blue-600 text-blue-600" : ""
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Resposta útil</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleVote(false)}
                  disabled={isVoting}
                >
                  <ThumbsDown
                    className={`h-3.5 w-3.5 ${
                      vote?.isUpvoted === false
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Resposta não útil</p>
              </TooltipContent>
            </Tooltip>

            {onRegenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onRegenerate}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reenviar</p>
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
