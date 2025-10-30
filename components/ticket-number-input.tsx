"use client";

import * as React from "react";
import { Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TicketNumberInputProps {
  ticketNumber: string | null;
  onTicketNumberChange: (ticketNumber: string | null) => void;
  disabled?: boolean;
}

export function TicketNumberInput({
  ticketNumber,
  onTicketNumberChange,
  disabled = false,
}: TicketNumberInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(ticketNumber || "");

  const handleApply = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onTicketNumberChange(trimmed);
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTicketNumberChange(null);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={ticketNumber ? "secondary" : "outline"}
                    size="sm"
                    disabled={disabled}
                    className={cn(
                      "h-8 gap-2 text-xs",
                      ticketNumber && "pr-1",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
            <Ticket className="h-3.5 w-3.5" />
            {ticketNumber ? (
              <>
                <span className="max-w-[100px] truncate">
                  Ticket #{ticketNumber}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 hover:bg-background/80"
                  onClick={handleClear}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                Buscar ticket
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4" align="start">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Número do Ticket</p>
              <p className="text-xs text-muted-foreground">
                Digite o número do ticket para buscar
              </p>
            </div>

            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ex: 588594"
              value={inputValue}
              onChange={(e) => {
                // Permite apenas números
                const value = e.target.value.replace(/\D/g, '');
                setInputValue(value);
              }}
              onKeyDown={handleKeyDown}
              autoFocus
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!inputValue.trim()}
                className="flex-1"
              >
                Aplicar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setInputValue("");
                  onTicketNumberChange(null);
                  setOpen(false);
                }}
              >
                Limpar
              </Button>
            </div>
          </div>
        </PopoverContent>
            </Popover>
            </span>
          </TooltipTrigger>
          {disabled && (
            <TooltipContent>
              <p>Desative o documento para buscar ticket</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
