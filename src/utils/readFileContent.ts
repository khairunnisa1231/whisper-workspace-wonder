
/**
 * Util: Reads file content as text if it's a supported type, or returns null.
 * Used for providing file context to Gemini AI prompts.
 */
export async function readFileContent(file: File): Promise<string | null> {
  // Handle only text, pdf, or markdown files for now
  const mime = file.type;
  if (mime.startsWith("text/") || mime === "application/json" || mime === "application/xml" || mime === "application/javascript") {
    return await file.text();
  }
  if (mime === "application/pdf") {
    // For PDFs we cannot read in the browser directly, so fallback to name only
    return `(PDF file uploaded: "${file.name}" - Content preview unavailable)`;
  }
  if (mime === "text/markdown" || file.name.endsWith('.md')) {
    return await file.text();
  }
  // If it's an image or other type, skip or just mention name
  return `(File uploaded: ${file.name}, unsupported for content preview)`;
}
