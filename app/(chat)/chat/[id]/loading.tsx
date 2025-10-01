import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4">
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-16 w-64 rounded-lg" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-24 w-80 rounded-lg" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
      </div>

      <div className="border-t p-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
