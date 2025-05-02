
/**
 * Util: Reads file content as text if it's a supported type, or returns null.
 * Used for providing file context to Gemini AI prompts.
 */
export async function readFileContent(file: File): Promise<string | null> {
  try {
    console.log(`Reading content from file: ${file.name}, type: ${file.type}`);
    
    // Handle text, pdf, markdown, code files
    const mime = file.type;
    if (mime.startsWith("text/") || 
        mime === "application/json" || 
        mime === "application/xml" || 
        mime === "application/javascript" ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.js') ||
        file.name.endsWith('.ts') ||
        file.name.endsWith('.tsx') ||
        file.name.endsWith('.jsx') ||
        file.name.endsWith('.css') ||
        file.name.endsWith('.html') ||
        file.name.endsWith('.csv')) {
      const text = await file.text();
      console.log(`Successfully read text content from ${file.name}, length: ${text.length} chars`);
      return text;
    }
    
    if (mime === "application/pdf") {
      // For PDFs we cannot read in the browser directly, so fallback to name only
      return `(PDF file uploaded: "${file.name}" - Content preview unavailable)`;
    }
    
    // If it's an image or other type, skip or just mention name
    return `(File uploaded: ${file.name}, unsupported for content preview)`;
  } catch (error) {
    console.error(`Error reading file ${file.name}:`, error);
    return `(Error reading file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'})`;
  }
}

/**
 * Gets the content of a file from a URL
 * Used for files that have been uploaded and have a URL
 */
export async function getFileContent(file: any): Promise<string | null> {
  try {
    if (!file.url) {
      console.error(`Missing URL for file ${file.name}`);
      return `(File content unavailable for ${file.name})`;
    }

    console.log(`Fetching content for file: ${file.name} from URL: ${file.url}`);
    const response = await fetch(file.url);
    
    if (!response.ok) {
      console.error(`Failed to fetch file ${file.name}: ${response.status} ${response.statusText}`);
      return `(Error fetching file ${file.name})`;
    }
    
    const blob = await response.blob();
    console.log(`Successfully fetched file ${file.name}, size: ${blob.size} bytes, type: ${blob.type}`);
    
    // For text files, extract and return content
    if (blob.type.startsWith("text/") || 
        blob.type === "application/json" || 
        blob.type === "application/xml" || 
        blob.type === "application/javascript" ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.js') ||
        file.name.endsWith('.ts') ||
        file.name.endsWith('.tsx') ||
        file.name.endsWith('.jsx') ||
        file.name.endsWith('.css') ||
        file.name.endsWith('.html') ||
        file.name.endsWith('.csv')) {
      const text = await blob.text();
      console.log(`Successfully extracted text from ${file.name}, length: ${text.length} chars`);
      return text;
    } 
    // For PDFs, just return file name and type
    else if (blob.type === "application/pdf") {
      return `PDF file: ${file.name} (Content preview unavailable in this format)`;
    }
    // For images, return a more descriptive message
    else if (blob.type.startsWith("image/")) {
      return `Image file: ${file.name} (${blob.type}) - ${blob.size} bytes`;
    }
    // For other types
    else {
      return `File: ${file.name} (${blob.type}) - ${blob.size} bytes`;
    }
  } catch (error) {
    console.error(`Error reading file ${file.name}:`, error);
    return `Error reading file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
