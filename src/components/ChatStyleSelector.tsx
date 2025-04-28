
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type ChatLayoutStyle = 'standard' | 'compact' | 'bubble';

interface ChatStyleSelectorProps {
  currentStyle: ChatLayoutStyle;
  onChange: (style: ChatLayoutStyle) => void;
}

export function ChatStyleSelector({ currentStyle, onChange }: ChatStyleSelectorProps) {
  const { toast } = useToast();

  const handleStyleChange = (style: ChatLayoutStyle) => {
    onChange(style);
    toast({
      title: "Chat style updated",
      description: `Chat style has been changed to ${style}.`,
    });
  };

  const styleLabels: Record<ChatLayoutStyle, string> = {
    standard: "Standard (Left & Right)",
    compact: "Compact (All Right)",
    bubble: "Bubble (All Right with Bubbles)"
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Chat Style</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {(Object.keys(styleLabels) as ChatLayoutStyle[]).map(style => (
          <DropdownMenuItem 
            key={style}
            onClick={() => handleStyleChange(style)}
            className={currentStyle === style ? "bg-secondary text-secondary-foreground" : ""}
          >
            {styleLabels[style]}
            {currentStyle === style && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
