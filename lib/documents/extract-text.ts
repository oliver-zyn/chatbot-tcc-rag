export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;

  if (fileType === "text/plain") {
    return await extractTextFromTxt(file);
  }

  if (fileType === "application/pdf") {
    return await extractTextFromPdf(file);
  }

  if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return await extractTextFromDocx(file);
  }

  throw new Error("Tipo de arquivo não suportado");
}

async function extractTextFromTxt(file: File): Promise<string> {
  const text = await file.text();
  return text;
}

async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const pdfParse = require("pdf-parse/lib/pdf-parse.js");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error("PDF não contém texto extraível");
    }

    return data.text;
  } catch (error) {
    console.error("Erro ao extrair texto do PDF:", error);
    throw new Error("Falha ao extrair texto do PDF. Verifique se o arquivo não está corrompido.");
  }
}

async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const mammoth = (await import("mammoth")).default;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("DOCX não contém texto extraível");
    }

    return result.value;
  } catch (error) {
    console.error("Erro ao extrair texto do DOCX:", error);
    throw new Error("Falha ao extrair texto do DOCX. Verifique se o arquivo não está corrompido.");
  }
}
