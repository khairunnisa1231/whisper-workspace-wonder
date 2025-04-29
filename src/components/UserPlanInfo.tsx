
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreditCard, MessageCircle, Gauge } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface UserPlanInfoProps {
  className?: string;
}

export function UserPlanInfo({ className }: UserPlanInfoProps) {
  const { user } = useAuth();
  
  // Hardcoded data for now, in a real app we would fetch this from the backend
  const planData = {
    name: "Basic",
    promptsUsed: 125,
    promptsTotal: 500,
    promptsPercent: 25,
    documentsUsed: 2,
    documentsTotal: 10,
    active: true,
    nextBillingDate: "May 29, 2025",
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="h-1.5 bg-secondary w-full" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-secondary/10 p-2 rounded-full mr-3">
              <CreditCard className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <h3 className="font-medium">{user?.name || "User"}</h3>
              <p className="text-xs text-muted-foreground">{planData.name} Plan</p>
            </div>
          </div>
          {planData.active && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">
              Active
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-sm">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Prompts</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {planData.promptsUsed}/{planData.promptsTotal}
              </span>
            </div>
            <Progress value={planData.promptsPercent} className="h-1.5" />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <div>Next billing date: {planData.nextBillingDate}</div>
            <a href="#" className="text-secondary hover:underline">Upgrade</a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
