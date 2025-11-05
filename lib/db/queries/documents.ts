import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "../index";
import { type Document, documents } from "../schema/documents";
import { embeddings } from "../schema/embeddings";

export async function getDocumentsByUserId(userId: string): Promise<Document[]> {
  try {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));
  } catch (error) {
    console.error("Failed to get documents:", error);
    throw new Error("Failed to get documents");
  }
}

export async function getAllDocuments(): Promise<Document[]> {
  try {
    return await db
      .select()
      .from(documents)
      .orderBy(desc(documents.createdAt));
  } catch (error) {
    console.error("Failed to get all documents:", error);
    throw new Error("Failed to get all documents");
  }
}

export async function getRecentDocuments(limit: number = 10): Promise<Document[]> {
  try {
    return await db
      .select()
      .from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Failed to get recent documents:", error);
    throw new Error("Failed to get recent documents");
  }
}

export async function getDocumentById(id: string): Promise<Document | null> {
  try {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document || null;
  } catch (error) {
    console.error("Failed to get document:", error);
    throw new Error("Failed to get document");
  }
}

export async function createDocument(
  userId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  content: string
): Promise<Document> {
  try {
    const [document] = await db
      .insert(documents)
      .values({
        userId,
        fileName,
        fileType,
        fileSize,
        content,
        status: "completed",
      })
      .returning();
    return document;
  } catch (error) {
    console.error("Failed to create document:", error);
    throw new Error("Failed to create document");
  }
}

export async function deleteDocument(id: string) {
  try {
    await db.delete(documents).where(eq(documents.id, id));
  } catch (error) {
    console.error("Failed to delete document:", error);
    throw new Error("Failed to delete document");
  }
}

export async function updateDocumentStatus(id: string, status: string) {
  try {
    await db
      .update(documents)
      .set({ status, updatedAt: new Date() })
      .where(eq(documents.id, id));
  } catch (error) {
    console.error("Failed to update document status:", error);
    throw new Error("Failed to update document status");
  }
}

export async function getEmbeddingsByDocumentId(documentId: string) {
  try {
    return await db
      .select({
        id: embeddings.id,
        content: embeddings.content,
      })
      .from(embeddings)
      .where(eq(embeddings.documentId, documentId));
  } catch (error) {
    console.error("Failed to get embeddings:", error);
    throw new Error("Failed to get embeddings");
  }
}
