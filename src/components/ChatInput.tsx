
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Loader2, SendHorizonal, FileUp, Mic, SmilePlus, LightbulbIcon } from "lucide-react";

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
  isProcessing?: boolean;
  recommendedPrompts?: string[];
}

export function ChatInput({ 
  onSendMessage, 
  onFileUpload,
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
  
  // Common emojis for quick access
  const commonEmojis = ["👍", "👎", "😊", "🙏", "🔥", "👀", "❤️", "🚀", "🎉", "🤔"];
  
  // Show suggestions when the input is empty
  useEffect(() => {
    setShowSuggestions(!message.trim());
  }, [message]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isProcessing) return;
    
    onSendMessage(message);
    setMessage("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };
  
  const handleEmojiClick = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
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
  
  const handlePromptSelect = (prompt: string) => {
    setMessage(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col border-t bg-background p-4 gap-2"
    >
      <div className="flex items-center gap-2 mb-1">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => fileInputRef.current?.click()}
          title="Upload file"
        >
          <FileUp className="h-4 w-4" />
        </Button>
        
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
              title="Suggested prompts"
            >
              <LightbulbIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Suggested prompts:</p>
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
        
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 mt-1">
            {recommendedPrompts.slice(0, 3).map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs truncate max-w-[200px]"
                onClick={() => handlePromptSelect(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
