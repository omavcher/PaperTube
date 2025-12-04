"use client"
import { useState } from "react";
import SubscriptionDialog from "../../components/SubscriptionDialog";
import { Button } from "../../components/ui/button";
import { Lock } from "lucide-react";

export default function VideoDashboard() {
  const [showPaywall, setShowPaywall] = useState(false);

  const handlePremiumFeature = () => {
    // Logic: Check if user is premium
    const isPremium = false; 

    if (!isPremium) {
      setShowPaywall(true); // <--- Triggers the responsive dialog
    } else {
      console.log("Feature Access Granted");
    }
  };

  return (
    <div className="p-10 bg-gray-50">
      <h1>Your Dashboard</h1>
      
      {/* 1. Trigger via state */}
      <Button onClick={handlePremiumFeature} className="bg-black text-white gap-2">
        <Lock className="w-4 h-4" /> Generate Deep Dive Report
      </Button>

      {/* 2. Or wrap a button directly (Upsell Button) */}
      <div className="mt-4">
        <SubscriptionDialog 
            trigger={<Button variant="destructive">Upgrade Plan</Button>} 
        />
      </div>

      {/* The Actual Dialog Component controlled by state */}
      <SubscriptionDialog 
        open={showPaywall} 
        onOpenChange={setShowPaywall} 
      />
    </div>
  );
}