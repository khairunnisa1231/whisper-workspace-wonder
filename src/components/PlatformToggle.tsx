
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { Smartphone, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Platform = "web" | "mobile";

export function PlatformToggle() {
  const [platform, setPlatform] = useState<Platform>(() => {
    const saved = localStorage.getItem("platform");
    return (saved as Platform) || "web";
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("platform", platform);
    document.documentElement.setAttribute("data-platform", platform);
  }, [platform]);

  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
    toast({
      title: `Switched to ${newPlatform} view`,
      description: `You are now viewing the ${newPlatform} version of the app.`,
      duration: 3000,
    });
  };

  return (
    <Menubar className="border-none bg-transparent">
      <MenubarMenu>
        <MenubarTrigger className="flex items-center gap-1 px-2">
          {platform === "web" ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
          <span className="hidden md:inline">{platform === "web" ? "Web" : "Mobile"}</span>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onClick={() => handlePlatformChange("web")}
            className={platform === "web" ? "bg-accent" : ""}
          >
            <Monitor className="mr-2 h-4 w-4" />
            Web
          </MenubarItem>
          <MenubarItem
            onClick={() => handlePlatformChange("mobile")}
            className={platform === "mobile" ? "bg-accent" : ""}
          >
            <Smartphone className="mr-2 h-4 w-4" />
            Mobile
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
