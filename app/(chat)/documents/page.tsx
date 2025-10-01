import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { getAllDocuments } from "@/lib/db/queries";
import { DocumentUpload } from "@/components/document-upload";
import { DocumentList } from "@/components/document-list";
import { PageHeader } from "@/components/page-header";

export default async function DocumentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const documents = await getAllDocuments();

  return (
    <>
      <PageHeader title="Documentos" />
      <div className="flex flex-col h-[calc(100vh-3.5rem)] p-6 gap-6">
        <p className="text-sm text-muted-foreground">
          Faça upload de documentos (TXT, PDF, DOCX) para consultar no chat
        </p>

        <DocumentUpload />

        <div className="flex-1 overflow-y-auto">
          <DocumentList documents={documents} currentUserId={session.user.id} />
        </div>
      </div>
    </>
  );
}
