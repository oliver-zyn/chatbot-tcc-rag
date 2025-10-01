import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number; // 0-100
}

export function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  const getConfidenceLevel = (score: number) => {
    if (score >= 80) {
      return {
        label: "Alta",
        color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: TrendingUp,
      };
    } else if (score >= 60) {
      return {
        label: "Média",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: Minus,
      };
    } else {
      return {
        label: "Baixa",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: TrendingDown,
      };
    }
  };

  const { label, color, icon: Icon } = getConfidenceLevel(score);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        color
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>
        Confiança: {score}% ({label})
      </span>
    </div>
  );
}
