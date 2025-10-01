import { Brain } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function HomePage() {
  return (
    <>
      <PageHeader />
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="size-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Bem-vindo ao Synapse</h1>
            <p className="text-muted-foreground max-w-md">
              Selecione uma conversa na barra lateral ou crie uma nova para começar a fazer perguntas sobre seus documentos.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
