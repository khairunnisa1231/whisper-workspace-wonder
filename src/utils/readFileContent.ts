import * as pdfjs from 'pdfjs-dist';

// Set the PDF.js worker location using the CDN approach instead of direct import
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

/**
 * Util: Reads file content as text if it's a supported type, or returns null.
 * Used for providing file context to Gemini AI prompts.
 */
export async function readFileContent(file: File): Promise<string | null> {
  try {
    console.log(`Reading content from file: ${file.name}, type: ${file.type}`);
    
    // Special handling for URL type files
    if (file.type === 'application/url' && 'url' in file) {
      console.log('Processing URL file:', (file as any).url);
      const url = (file as any).url;
      return await fetchUrlContent(url);
    }
    
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
    
    // Handle image files - provide descriptive information
    if (mime.startsWith("image/")) {
      return `[Image File: ${file.name}, Type: ${mime}]\nThis file contains an image that may have important visual information. Gemini can extract information like charts, diagrams, text in images, people or objects shown, scenes depicted, and other visual elements. Please ask specific questions about what you'd like to know about this image.`;
    }
    
    // If it's another type, skip or just mention name
    return `(File uploaded: ${file.name}, unsupported for content preview)`;
  } catch (error) {
    console.error(`Error reading file ${file.name}:`, error);
    return `(Error reading file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'})`;
  }
}

/**
 * Fetches content directly from a URL, with improved error handling and CORS handling
 */
export async function fetchUrlContent(url: string): Promise<string | null> {
  try {
    console.log(`Fetching content from URL: ${url}`);
    
    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!validUrl.protocol.startsWith('http')) {
        return `Invalid URL: ${url} - Only HTTP and HTTPS protocols are supported`;
      }
    } catch (e) {
      return `Invalid URL format: ${url}`;
    }
    
    // For external URLs that might have CORS issues, use the Gemini function to fetch content
    // This is needed because direct fetch from browser may fail due to CORS
    try {
      // Use the Supabase Edge Function for fetching external URLs
      // This avoids CORS issues by fetching server-side
      const response = await fetch('/api/gemini-faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Fetch and return only the raw content from this URL without any analysis: ${url}`,
          rawUrlFetch: true, // Flag to specify this is a raw URL fetch request
        }),
      });
      
      if (!response.ok) {
        console.log(`Server-side fetch failed with status: ${response.status}, trying direct fetch as fallback`);
        throw new Error('Server-side fetch failed');
      }
      
      const data = await response.json();
      
      if (data.answer && data.answer.length > 0) {
        console.log(`Successfully fetched content via server for ${url}, length: ${data.answer.length} chars`);
        return `Content from URL: ${url}\n\n${data.answer}`;
      }
      
      throw new Error('Empty response from server');
    } catch (serverFetchError) {
      console.log('Server fetch failed, attempting direct fetch:', serverFetchError);
      
      // Fallback to direct fetch (will work for CORS-enabled sites)
      console.log('Attempting direct fetch as fallback for:', url);
      const directResponse = await fetch(url, { 
        mode: 'cors',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GeminiAI/1.0; +https://lovable.dev)',
          'Accept': 'text/html,application/xhtml+xml,application/xml,text/plain,application/pdf,*/*'
        }
      });
      
      if (!directResponse.ok) {
        return `Failed to fetch content from ${url}: ${directResponse.status} ${directResponse.statusText}. 
        
This is likely due to CORS restrictions - the website doesn't allow direct access from web applications.

For Wikipedia or similar sites with CORS restrictions, you can:
1. Download the page content manually
2. Upload the file directly instead of using a URL
3. Try using the site's API if available (e.g., Wikipedia has an API)`;
      }
      
      // Handle text content (HTML, plain text, etc.)
      if (directResponse.headers.get('content-type')?.includes('text/') || 
          directResponse.headers.get('content-type')?.includes('application/json') || 
          directResponse.headers.get('content-type')?.includes('application/xml') || 
          directResponse.headers.get('content-type')?.includes('application/javascript')) {
        const text = await directResponse.text();
        let processedText = text;
        
        // For HTML content, try to extract only the main content to avoid noise
        if (directResponse.headers.get('content-type')?.includes('text/html')) {
          // Simple extraction of text with HTML markup removed
          processedText = text
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove styles
            .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '') // Remove header
            .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '') // Remove footer
            .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')         // Remove navigation
            .replace(/<[^>]+>/g, ' ')                                         // Remove remaining HTML tags
            .replace(/\s{2,}/g, ' ')                                          // Normalize whitespace
            .trim();
        }
        
        // Truncate if too large
        const maxLength = 50000;
        let result = `Document from URL: ${url}\nFilename: ${url.split('/').pop() || 'document'}\nType: ${directResponse.headers.get('content-type') || 'unknown'}\n\n`;
        
        if (processedText.length > maxLength) {
          result += processedText.substring(0, maxLength) + '\n\n[Content truncated due to size limitations...]';
          console.log(`Text content from ${url} truncated to ${maxLength} characters`);
        } else {
          result += processedText;
          console.log(`Extracted ${processedText.length} characters of text content from ${url}`);
        }
        
        return result;
      }
      
      // Handle PDF content
      if (directResponse.headers.get('content-type')?.includes('application/pdf')) {
        const arrayBuffer = await directResponse.arrayBuffer();
        try {
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          console.log(`PDF loaded from URL with ${pdf.numPages} pages`);
          
          let fullText = `PDF Document from URL: ${url}\nFilename: ${url.split('/').pop() || 'document'}\n\n`;
          // Process up to first 20 pages
          const maxPages = Math.min(pdf.numPages, 20);
          
          for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `Page ${i}:\n${pageText}\n\n`;
          }
          
          if (pdf.numPages > maxPages) {
            fullText += `[Note: Only showing first ${maxPages} of ${pdf.numPages} pages]\n`;
          }
          
          console.log(`Extracted ${fullText.length} characters from PDF URL`);
          return fullText;
        } catch (pdfError) {
          console.error(`Error extracting PDF content from URL: ${pdfError}`);
          return `Failed to extract content from PDF at ${url}: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`;
        }
      }
      
      // Handle image content
      if (directResponse.headers.get('content-type')?.startsWith('image/')) {
        return `[Image from URL: ${url}, Type: ${directResponse.headers.get('content-type') || 'unknown'}, URL: ${url}]\nThis URL contains an image that may have important visual information. Gemini can extract information like charts, diagrams, text in images, people or objects shown, scenes depicted, and other visual elements. Please ask specific questions about what you'd like to know about this image.`;
      }
      
      // For other content types
      return `Document from URL: ${url}\nType: ${directResponse.headers.get('content-type') || 'unknown'}\nFilename: ${url.split('/').pop() || 'document'}\n(Content preview unavailable for this type of document)`;
    }
  } catch (error) {
    console.error(`Error fetching URL ${url}:`, error);
    return `Error fetching URL ${url}: ${error instanceof Error ? error.message : 'Unknown error'}. 
    
This is likely due to CORS restrictions. For websites like Wikipedia that restrict direct access:
1. Download the page content manually to your device
2. Upload the saved file directly to the chat
3. Or try using the site's API if available`;
  }
}

/**
 * Gets the content of a file from a URL
 * Used for files that have been uploaded and have a URL
 */
export async function getFileContent(file: any): Promise<string | null> {
  try {
    // Special handling for URL type files
    if (file.type === 'application/url' && file.url) {
      console.log(`Getting content from URL file: ${file.name}, URL: ${file.url}`);
      return await fetchUrlContent(file.url);
    }
    
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
    // For PDFs, extract content using pdf.js
    else if (blob.type === "application/pdf") {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        
        console.log(`PDF loaded with ${pdf.numPages} pages`);
        
        let fullText = `PDF File: ${file.name}\n\n`;
        // Process up to first 20 pages (to avoid very large files)
        const maxPages = Math.min(pdf.numPages, 20);
        
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += `Page ${i}:\n${pageText}\n\n`;
        }
        
        if (pdf.numPages > maxPages) {
          fullText += `[Note: Only showing first ${maxPages} of ${pdf.numPages} pages]\n`;
        }
        
        console.log(`Extracted ${fullText.length} characters from PDF`);
        return fullText;
      } catch (pdfError) {
        console.error('Error extracting text from PDF:', pdfError);
        return `(PDF file: ${file.name} - Failed to extract content: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'})`;
      }
    }
    // For images, return the image URL and descriptive information
    else if (blob.type.startsWith("image/")) {
      return `[Image File: ${file.name}, Type: ${blob.type}, URL: ${file.url}]\nThis file contains an image that may have important visual information. Gemini can extract information like charts, diagrams, text in images, people or objects shown, scenes depicted, and other visual elements. Please ask specific questions about what you'd like to know about this image.`;
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

// For debugging purposes, export a simplified test function for URL content
export async function testUrlFetch(url: string): Promise<string> {
  try {
    const content = await fetchUrlContent(url);
    return content || 'No content could be fetched';
  } catch (error) {
    console.error('Test URL fetch error:', error);
    return `Error testing URL fetch: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
