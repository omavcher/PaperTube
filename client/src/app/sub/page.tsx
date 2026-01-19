"use client"
import { useState } from "react";
import SubscriptionDialog from "../../components/SubscriptionDialog";
import { Button } from "../../components/ui/button";
import { Lock } from "lucide-react";
import { LoaderX } from "@/components/LoaderX";

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
    <div>
      <LoaderX/>
    </div>
  );
}