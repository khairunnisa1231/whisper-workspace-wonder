
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface BotImageSelectorProps {
  selectedImage: string | null;
  onSelectImage: (imageUrl: string | null) => void;
}

export function BotImageSelector({ selectedImage, onSelectImage }: BotImageSelectorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  // Fix: Change the useRef approach to use a regular ref
  const fileInputRef = useState<HTMLInputElement | null>(null);
  
  // Sample bot avatars
  const sampleAvatars = [
    {
      url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
      alt: "AI Assistant 1"
    },
    {
      url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
      alt: "AI Assistant 2"
    },
    {
      url: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
      alt: "AI Assistant 3" 
    },
    {
      url: "https://images.unsplash.com/photo-1501286353178-1ec881214838",
      alt: "AI Assistant 4"
    }
  ];
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image file size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    // In a real implementation, you would upload to a server
    // For now, we'll use a local URL
    const imageUrl = URL.createObjectURL(file);
    
    // Simulate network request
    setTimeout(() => {
      onSelectImage(imageUrl);
      setIsUploading(false);
      
      toast({
        title: "Image uploaded",
        description: "Bot avatar has been updated successfully"
      });
    }, 1000);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {selectedImage ? (
          <div className="relative w-16 h-16 rounded-full overflow-hidden border">
            <img 
              src={selectedImage} 
              alt="Current Bot Avatar" 
              className="w-full h-full object-cover"
              onError={() => {
                toast({
                  title: "Image Error",
                  description: "Failed to load image",
                  variant: "destructive"
                });
                onSelectImage(null);
              }}
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl font-semibold text-muted-foreground">AI</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {sampleAvatars.map((avatar, index) => (
          <Button
            key={index}
            variant="outline"
            className={cn("p-0 w-12 h-12 rounded-full overflow-hidden", 
              selectedImage === avatar.url && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => onSelectImage(avatar.url)}
          >
            <img 
              src={avatar.url} 
              alt={avatar.alt}
              className="w-full h-full object-cover" 
            />
          </Button>
        ))}
      </div>
      
      <div className="flex flex-col items-center gap-2 pt-2">
        <input
          type="file"
          id="botImageUpload"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          ref={(el) => fileInputRef[1](el)}
        />
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => document.getElementById('botImageUpload')?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <span>Uploading...</span>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              <span>Upload custom image</span>
            </>
          )}
        </Button>
        
        {selectedImage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectImage(null)}
          >
            Remove image
          </Button>
        )}
      </div>
    </div>
  );
}
