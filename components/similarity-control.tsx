"use client";

import * as React from "react";
import { Settings2, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface SimilarityControlProps {
  value: number;
  onChange: (value: number) => void;
}

const getSimilarityLabel = (value: number) => {
  if (value >= 0.7) return { label: "Muito Alta", color: "text-red-500" };
  if (value >= 0.5) return { label: "Alta", color: "text-orange-500" };
  if (value >= 0.3) return { label: "Média", color: "text-yellow-600" };
  if (value >= 0.1) return { label: "Baixa", color: "text-green-600" };
  return { label: "Muito Baixa", color: "text-blue-600" };
};

const getSimilarityDescription = (value: number) => {
  if (value >= 0.7)
    return "Apenas respostas muito precisas. Pode não encontrar resultados.";
  if (value >= 0.5)
    return "Respostas precisas e relevantes. Balanceado.";
  if (value >= 0.3)
    return "Respostas relevantes com alguma flexibilidade.";
  if (value >= 0.1)
    return "Respostas amplas, incluindo contexto relacionado.";
  return "Máxima abrangência, pode incluir conteúdo menos relevante.";
};

export function SimilarityControl({ value, onChange }: SimilarityControlProps) {
  const [open, setOpen] = React.useState(false);
  const { label, color } = getSimilarityLabel(value);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
            <Settings2 className="h-3.5 w-3.5" />
            Precisão: <span className={color}>{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px]" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">Precisão de Busca</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px]">
                        <p className="text-xs">
                          Controla o quão similar o conteúdo deve ser à sua pergunta.
                          Valores altos = mais precisão, valores baixos = mais abrangência.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant="secondary" className={`text-xs ${color}`}>
                  {(value * 100).toFixed(0)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {getSimilarityDescription(value)}
              </p>
            </div>

            <div className="space-y-3">
              <Slider
                value={[value]}
                onValueChange={([newValue]) => onChange(newValue)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />

              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Abrangente</span>
                <span>Equilibrado</span>
                <span>Preciso</span>
              </div>
            </div>

            <div className="pt-2 border-t space-y-2">
              <p className="text-xs font-medium">Valores Sugeridos:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs justify-start"
                  onClick={() => onChange(0.3)}
                >
                  <span className="text-yellow-600 mr-2">●</span>
                  Padrão (30%)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs justify-start"
                  onClick={() => onChange(0.5)}
                >
                  <span className="text-orange-500 mr-2">●</span>
                  Alta (50%)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs justify-start"
                  onClick={() => onChange(0.15)}
                >
                  <span className="text-green-600 mr-2">●</span>
                  Explorar (15%)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs justify-start"
                  onClick={() => onChange(0.7)}
                >
                  <span className="text-red-500 mr-2">●</span>
                  Exata (70%)
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
