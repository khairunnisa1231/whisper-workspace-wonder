
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export type ChatLayoutStyle = 'standard' | 'compact' | 'bubble';

interface SettingsContextType {
  chatStyle: ChatLayoutStyle;
  botImageUrl: string | null;
  setChatStyle: (style: ChatLayoutStyle) => void;
  setBotImageUrl: (url: string | null) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [chatStyle, setChatStyle] = useState<ChatLayoutStyle>('standard');
  const [botImageUrl, setBotImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load settings from local storage or database
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      
      // First try to load from localStorage for immediate feedback
      const savedChatStyle = localStorage.getItem('chatStyle');
      const savedBotImage = localStorage.getItem('botImageUrl');
      
      if (savedChatStyle) {
        setChatStyle(savedChatStyle as ChatLayoutStyle);
      }
      
      if (savedBotImage) {
        setBotImageUrl(savedBotImage);
      }
      
      // Then try to load from database
      const fetchSettings = async () => {
        try {
          const { data, error } = await supabase
            .from('user_settings')
            .select('chat_style, bot_image_url')
            .eq('user_id', user.id)
            .single();
            
          if (!error && data) {
            if (data.chat_style) {
              setChatStyle(data.chat_style as ChatLayoutStyle);
              localStorage.setItem('chatStyle', data.chat_style);
            }
            
            if (data.bot_image_url) {
              setBotImageUrl(data.bot_image_url);
              localStorage.setItem('botImageUrl', data.bot_image_url);
            }
          }
        } catch (err) {
          console.error('Error loading settings:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSettings();
    }
  }, [user]);

  // Save settings whenever they change
  const saveSettings = async (style: ChatLayoutStyle, imageUrl: string | null) => {
    // Save to localStorage for immediate feedback
    localStorage.setItem('chatStyle', style);
    if (imageUrl) localStorage.setItem('botImageUrl', imageUrl);
    else localStorage.removeItem('botImageUrl');
    
    // Save to database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            chat_style: style,
            bot_image_url: imageUrl,
            updated_at: new Date()
          }, { onConflict: 'user_id' });
          
        if (error) console.error('Error saving settings:', error);
      } catch (err) {
        console.error('Error saving settings:', err);
      }
    }
  };

  const handleSetChatStyle = (style: ChatLayoutStyle) => {
    setChatStyle(style);
    saveSettings(style, botImageUrl);
  };
  
  const handleSetBotImageUrl = (url: string | null) => {
    setBotImageUrl(url);
    saveSettings(chatStyle, url);
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        chatStyle,
        botImageUrl,
        setChatStyle: handleSetChatStyle,
        setBotImageUrl: handleSetBotImageUrl,
        isLoading
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
