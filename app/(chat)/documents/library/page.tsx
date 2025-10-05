import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { getAllDocuments } from "@/lib/db/queries";
import { PageHeader } from "@/components/page-header";
import { DocumentGrid } from "@/components/document-grid";

export default async function LibraryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const documents = await getAllDocuments();

  return (
    <>
      <PageHeader title="Biblioteca de Documentos" />
      <div className="flex flex-col h-[calc(100vh-3.5rem)] p-6 gap-6">
        <div className="flex-1 overflow-y-auto">
          <DocumentGrid documents={documents} currentUserId={session.user.id} />
        </div>
      </div>
    </>
  );
}
