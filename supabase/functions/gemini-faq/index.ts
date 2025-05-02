
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = "gemini-1.5-flash"; // Using the Gemini model that has multimodal capabilities

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
    const { 
      prompt, 
      includeFileContent, 
      includesImageAnalysis,
      fileContext, 
      isSuggestionRequest, 
      cacheKey, 
      refreshSuggestions 
    } = await req.json();

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

    // Log request type for debugging
    console.log("Request type:", isSuggestionRequest ? "Suggestions" : "Regular query");
    console.log("Includes image analysis:", includesImageAnalysis ? "Yes" : "No");
    if (cacheKey) {
      console.log("Cache key:", cacheKey);
    }
    if (refreshSuggestions) {
      console.log("Force refresh suggestions requested");
    }
    
    // Prepare a better prompt that instructs Gemini based on the request type
    let fullPrompt;
    if (includeFileContent) {
      // Check if file content contains PDF content or just placeholder text
      const hasPDFContent = fileContext && fileContext.includes("PDF File:") && 
        !fileContext.includes("Content preview unavailable") &&
        fileContext.length > 100;

      // Check if file content contains image analysis request
      const hasImageContent = includesImageAnalysis && 
        fileContext && fileContext.includes("[Image File:") && 
        fileContext.includes("URL:");

      if (isSuggestionRequest) {
        fullPrompt = `${prompt}
        
Please return ONLY a numbered list of 3 to 6 relevant, diverse and specific questions with no preamble or explanation.
These questions should be different from each other and explore different aspects of the topic.
Each question should be clear and concise.
Example format:
1. First question here?
2. Second question here?`;
      } else {
        if (hasImageContent) {
          // Enhanced prompt for image analysis
          fullPrompt = `I have the following image file that I want you to analyze and use to answer my question:
          
${fileContext}

My question is: ${prompt}

Please analyze the image carefully and answer my question. If the image contains charts, diagrams, text, or other visual information, please describe and analyze them in detail. If the image shows people, objects, or scenes, describe what's visible that's relevant to my question.`;
        } else {
          // Enhanced prompt for file analysis, especially for PDFs
          fullPrompt = `I have the following file content that I want you to analyze and use to answer my question:
          
File content:
${fileContext}

${hasPDFContent ? "Note: This is text extracted from a PDF document. There might be some formatting issues or missing elements." : ""}

My question is: ${prompt}

Please analyze the file content provided above and answer my question based only on the information in this file. If the file content doesn't contain enough relevant information to answer my question completely, please let me know what's missing.`;
        }
      }
    } else {
      if (isSuggestionRequest) {
        fullPrompt = `${prompt}
        
Please return ONLY a numbered list of 3 to 6 relevant, diverse and specific questions with no preamble or explanation.
These questions should be different from each other and explore different aspects of the topic.
Each question should be clear and concise.
Example format:
1. First question here?
2. Second question here?`;
      } else {
        fullPrompt = prompt;
      }
    }

    console.log("Sending prompt to Gemini API:", fullPrompt.substring(0, 100) + "...");

    // Prepare the API request for Gemini
    const apiBody: any = {
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }]
        }
      ],
      generationConfig: {
        temperature: isSuggestionRequest ? 0.85 : 0.5, // Higher temperature for more varied suggestions
        topK: 40,
        topP: 0.95,
        maxOutputTokens: isSuggestionRequest ? 350 : 4096, // Increased for better suggestions
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
    };

    // If we're dealing with an image, we need to extract the URL and add it to the request
    if (includesImageAnalysis) {
      // Extract the image URL from the file context
      const imageUrlMatch = fileContext.match(/URL: (https?:\/\/[^\s\]]+)/);
      if (imageUrlMatch && imageUrlMatch[1]) {
        const imageUrl = imageUrlMatch[1];
        console.log("Extracted image URL for analysis:", imageUrl);
        
        // Add the image URL to the request as an inline data URI
        apiBody.contents[0].parts = [
          { text: fullPrompt },
          { inlineData: { mimeType: "image/jpeg", data: imageUrl } }
        ];
      } else {
        console.log("Failed to extract image URL from context");
      }
    }

    // Make request to Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiBody),
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

    // For suggestions, ensure we're returning a properly formatted list
    let formattedAnswer = answer;
    if (isSuggestionRequest) {
      // Extract numbered lines if they exist
      const lines = answer.split('\n').filter(line => line.trim().length > 0);
      const numberedLines = lines.filter(line => /^\d+\./.test(line.trim()));
      
      if (numberedLines.length >= 3) {
        formattedAnswer = numberedLines.slice(0, 6).join('\n');
      } else if (lines.length >= 3) {
        // If no numbered lines but we have text, try to format it
        formattedAnswer = lines.slice(0, 6).map((line, index) => `${index + 1}. ${line.replace(/^\d+\.\s*/, '')}`).join('\n');
      } else {
        // Fallback to default suggestions
        formattedAnswer = "1. Can you explain this document in simple terms?\n2. What are the main points covered?\n3. How can I apply this information?\n4. Are there any limitations to consider?\n5. What related topics should I explore next?";
      }
      
      console.log("Returning suggestions:", formattedAnswer.substring(0, 100) + (formattedAnswer.length > 100 ? "..." : ""));
    }

    return new Response(
      JSON.stringify({ answer: formattedAnswer }),
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
