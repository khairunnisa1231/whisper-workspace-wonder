
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Loader2, SendHorizonal, FileUp, Mic, SmilePlus, LightbulbIcon, Link } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Add proper TypeScript interface for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

// Create a global interface to avoid TypeScript errors
interface Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: (event: Event) => void;
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (file: File) => void;
  onUrlUpload?: (url: string) => void;
  isProcessing?: boolean;
  recommendedPrompts?: string[];
}

export function ChatInput({ 
  onSendMessage, 
  onFileUpload,
  onUrlUpload,
  isProcessing = false,
  recommendedPrompts = [
    "Explain the concept of...",
    "Summarize this document for me.",
    "Generate a list of ideas for...",
    "How can I improve my...",
    "Compare and contrast...",
    "Create a plan for...",
    "What's your opinion on...",
    "Help me debug this code..."
  ]
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  // Upload dialog state
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [isUrlUploading, setIsUrlUploading] = useState(false);
  
  // Common emojis for quick access
  const commonEmojis = useMemo(() => ["👍", "👎", "😊", "🙏", "🔥", "👀", "❤️", "🚀", "🎉", "🤔"], []);
  
  // Memoize the displayed prompts to prevent unnecessary re-renders
  const displayedPrompts = useMemo(() => 
    recommendedPrompts?.slice(0, 4) || [], 
    [recommendedPrompts]
  );

  // Show suggestions when the input is empty
  useEffect(() => {
    setShowSuggestions(!message.trim());
  }, [message]);
  
  useEffect(() => {
    // Log when recommended prompts change to help debug
    console.log("Recommended prompts updated:", recommendedPrompts);
  }, [recommendedPrompts]);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isProcessing) return;
    
    // Call parent, clear after message will be rendered in parent now
    onSendMessage(message);
    // Clear the input after sending the message
    setMessage(""); 
    // Always show suggestions after sending a message
    setShowSuggestions(true);
  }, [message, isProcessing, onSendMessage]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }, [handleSubmit]);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      // Reset the input
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded.`,
      });
    }
  }, [onFileUpload, toast]);
  
  const handleUrlUpload = useCallback(async () => {
    if (!uploadUrl.trim() || !onUrlUpload) return;
    
    setIsUrlUploading(true);
    try {
      await onUrlUpload(uploadUrl.trim());
      
      toast({
        title: "URL added",
        description: "The document URL has been successfully added.",
      });
      
      setUploadUrl("");
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error("Error uploading URL:", error);
      toast({
        title: "Upload failed",
        description: "Failed to add the URL. Please check if it's valid and try again.",
        variant: "destructive"
      });
    } finally {
      setIsUrlUploading(false);
    }
  }, [uploadUrl, onUrlUpload, toast]);
  
  const handleEmojiClick = useCallback((emoji: string) => {
    setMessage((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  const handlePromptSelect = useCallback((prompt: string) => {
    setMessage(prompt);
    setShowSuggestions(false); // Hide suggestions after selecting one
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  const handleMicToggle = async () => {
    if (!isRecording) {
      try {
        // Fixed speech recognition implementation
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          
          recognition.lang = 'en-US';
          recognition.interimResults = false;
          
          recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setMessage((prev) => prev + transcript);
            setIsRecording(false);
          };
          
          recognition.onerror = () => {
            toast({
              title: "Speech recognition failed",
              description: "Please try again or type your message",
              variant: "destructive"
            });
            setIsRecording(false);
          };
          
          recognition.onend = () => {
            setIsRecording(false);
          };
          
          setIsRecording(true);
          recognition.start();
        } else {
          toast({
            title: "Speech recognition not supported",
            description: "Your browser does not support speech recognition",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Microphone access required",
          description: "Please allow microphone access to use voice input",
          variant: "destructive"
        });
        setIsRecording(false);
      }
    } else {
      setIsRecording(false);
      // Stop recognition if it's active
      if ((window as any).speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (onFileUpload && acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
      toast({
        title: "File uploaded",
        description: `${acceptedFiles[0].name} has been uploaded.`,
      });
    }
  }, [onFileUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    noClick: true,
    noKeyboard: true
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col border-t bg-background p-4 gap-2"
      {...getRootProps()}
    >
      {isDragActive && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-primary rounded-lg z-50">
          <p className="text-lg font-medium">Drop file to upload</p>
        </div>
      )}
      
      {showSuggestions && displayedPrompts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {displayedPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="px-3 py-1 h-auto text-sm rounded-full bg-primary/10 hover:bg-primary/20 border-none" 
              onClick={() => handlePromptSelect(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-1">
        <input {...getInputProps()} />
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              title="Upload document"
            >
              <FileUp className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-4 w-4 mr-2" />
                Upload file
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Link className="h-4 w-4 mr-2" />
                Add URL link
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              title="Add emoji"
            >
              <SmilePlus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-5 gap-2">
              {commonEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <Button
          type="button"
          variant={isRecording ? "default" : "ghost"}
          size="icon"
          className={`h-8 w-8 rounded-full ${isRecording ? "bg-red-500 text-white" : ""}`}
          onClick={handleMicToggle}
          title={isRecording ? "Stop recording" : "Start voice input"}
        >
          <Mic className="h-4 w-4" />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              title="More suggestions"
            >
              <LightbulbIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">More suggestions:</p>
              {recommendedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto py-2 px-3 justify-start text-left text-sm"
                  onClick={() => handlePromptSelect(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type your message here..."
            className="min-h-[60px] resize-none pr-[60px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            onFocus={() => setShowSuggestions(false)}
            onBlur={() => setShowSuggestions(!message.trim())}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 bottom-2 h-10 w-10"
            disabled={!message.trim() || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* URL upload dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Enter document URL
              </label>
              <Input
                id="url"
                placeholder="https://example.com/document.pdf"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, text files, and web pages
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUrlUpload}
              disabled={isUrlUploading || !uploadUrl.trim()}
            >
              {isUrlUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add URL"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
