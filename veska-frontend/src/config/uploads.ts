import type { DocumentFileType } from "@/types/documents";

export const DEFAULT_MAX_UPLOAD_FILE_SIZE_MB = 25;

export const DEFAULT_MAX_UPLOAD_FILE_SIZE_BYTES =
  DEFAULT_MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024;

export type SupportedUploadFormat = {
  fileType: DocumentFileType;
  extension: `.${string}`;
  label: string;
  description: string;
};

export const SUPPORTED_UPLOAD_FORMATS: SupportedUploadFormat[] = [
  {
    fileType: "pdf",
    extension: ".pdf",
    label: "PDF",
    description: "Documento paginado",
  },
  {
    fileType: "docx",
    extension: ".docx",
    label: "DOCX",
    description: "Documento de Word",
  },
  {
    fileType: "txt",
    extension: ".txt",
    label: "TXT",
    description: "Archivo de texto",
  },
  {
    fileType: "xlsx",
    extension: ".xlsx",
    label: "XLSX",
    description: "Planilla de Excel",
  },
  {
    fileType: "csv",
    extension: ".csv",
    label: "CSV",
    description: "Tabla delimitada",
  },
];

export const UPLOAD_INPUT_ACCEPT = SUPPORTED_UPLOAD_FORMATS.map(
  (format) => format.extension,
).join(",");

export function getDocumentFileTypeFromFileName(
  fileName: string,
): DocumentFileType | null {
  const normalizedFileName = fileName.trim().toLocaleLowerCase("es-CL");

  const matchingFormat = SUPPORTED_UPLOAD_FORMATS.find((format) =>
    normalizedFileName.endsWith(format.extension),
  );

  return matchingFormat?.fileType ?? null;
}
