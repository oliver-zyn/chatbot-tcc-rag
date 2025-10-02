import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryLoading() {
  return (
    <>
      <PageHeader title="Biblioteca de Documentos" />
      <div className="flex flex-col h-[calc(100vh-3.5rem)] p-6 gap-6">
        <Skeleton className="h-5 w-96" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </>
  );
}
