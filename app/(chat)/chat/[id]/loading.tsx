import { Skeleton } from "@/components/ui/skeleton";
import { Brain } from "lucide-react";

export default function ChatLoading() {
  return (
    <div className="flex h-screen flex-col">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4">
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto w-full max-w-3xl space-y-4 md:space-y-6">
          <div className="group flex gap-2 md:gap-3 justify-start">
            <div className="-mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[85%]" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>

          <div className="group flex gap-2 md:gap-3 justify-end">
            <div className="flex flex-col gap-2 max-w-[calc(100%-2.5rem)] sm:max-w-[80%]">
              <div className="rounded-2xl bg-muted w-fit ml-auto px-3 py-2 md:px-4 md:py-3">
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="-mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#006cff]">
              <div className="h-4 w-4" />
            </div>
          </div>

          <div className="group flex gap-2 md:gap-3 justify-start">
            <div className="-mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-[92%]" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-background p-4">
        <div className="mx-auto w-full max-w-3xl">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
