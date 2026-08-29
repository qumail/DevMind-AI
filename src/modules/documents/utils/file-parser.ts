import fs from "fs/promises";
import path from "path";
import { ParsedDocument } from "../documents.types";

const SUPPORTED_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".json",
  ".ts",
  ".js",
  ".tsx",
  ".jsx",
]);

export const isSupportedFile = (
  fileName: string
): boolean => {
  const extension = path.extname(fileName).toLowerCase();

  return SUPPORTED_EXTENSIONS.has(extension);
};

export const parseFile = async (
  filePath: string,
  fileName: string,
  mimeType: string
): Promise<ParsedDocument> => {
  const extension = path.extname(fileName).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(
      `Unsupported file type: ${extension}`
    );
  }

  const content = await fs.readFile(
    filePath,
    "utf-8"
  );

  return {
    content,

    metadata: {
      fileName,
      extension,
      mimeType,
    },
  };
};