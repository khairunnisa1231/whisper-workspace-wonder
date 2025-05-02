
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = "gemini-1.5-flash";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, includeFileContent, fileContext } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt in request body" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determine if this is a suggestion generation request
    const isSuggestionsRequest = prompt.includes("Generate follow-up questions");
    
    // Prepare a better prompt that instructs Gemini based on the request type
    let fullPrompt;
    if (includeFileContent) {
      // Check if file content contains PDF content or just placeholder text
      const hasPDFContent = fileContext && fileContext.includes("PDF File:") && 
        !fileContext.includes("Content preview unavailable") &&
        fileContext.length > 100;

      if (isSuggestionsRequest) {
        fullPrompt = prompt;
      } else {
        // Enhanced prompt for file analysis, especially for PDFs
        fullPrompt = `I have the following file content that I want you to analyze and use to answer my question:
        
File content:
${fileContext}

${hasPDFContent ? "Note: This is text extracted from a PDF document. There might be some formatting issues or missing elements." : ""}

My question is: ${prompt}

Please analyze the file content provided above and answer my question based only on the information in this file. If the file content doesn't contain enough relevant information to answer my question completely, please let me know what's missing.`;
      }
    } else {
      fullPrompt = prompt;
    }

    console.log("Sending prompt to Gemini API:", fullPrompt.substring(0, 100) + "...");

    // Make request to Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }]
          }
        ],
        generationConfig: {
          temperature: isSuggestionsRequest ? 0.9 : 0.7, // Higher temperature for more creative suggestions
          topK: 40,
          topP: 0.95,
          maxOutputTokens: isSuggestionsRequest ? 1024 : 4096, // Shorter for suggestions
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    const data = await response.json();
    console.log("Gemini API response status:", response.status);
    
    if (!response.ok) {
      console.error("Gemini API error:", data);
      return new Response(
        JSON.stringify({ 
          error: data.error?.message || "Error from Gemini API",
          details: data
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I'm sorry, I couldn't generate an answer at this time. Please try again later.";

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in gemini-faq function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
