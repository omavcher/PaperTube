"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle2, AlertCircle } from "lucide-react";
import Script from 'next/script';

export default function AdDialog({ open, onOpenChange, onAdComplete }) {
  const [countdown, setCountdown] = useState(30);
  const [adCompleted, setAdCompleted] = useState(false);
  const [adLoading, setAdLoading] = useState(true);
  const [adError, setAdError] = useState(false);
  const adContainerRef = useRef(null);
  const adInitialized = useRef(false);

  // Load Google AdSense script
  const loadAdSense = () => {
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8343501385468147";
    script.crossOrigin = "anonymous";
    script.onload = () => initializeAd();
    script.onerror = () => {
      console.error('Failed to load AdSense script');
      setAdError(true);
      setAdLoading(false);
    };
    document.head.appendChild(script);
  };

  // Initialize AdSense ad
  const initializeAd = () => {
    if (!window.adsbygoogle || !adContainerRef.current) {
      console.error('AdSense not loaded or container not found');
      setAdError(true);
      setAdLoading(false);
      return;
    }

    try {
      // Create the ad container
      const adContainer = adContainerRef.current;
      adContainer.innerHTML = `
        <ins class="adsbygoogle"
          style="display:block; text-align:center;"
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-8343501385468147"
          data-ad-slot="4924261839"
          data-full-width-responsive="true">
        </ins>
      `;

      // Push the ad
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      
      // Listen for ad load events
      const adElement = adContainer.querySelector('ins');
      if (adElement) {
        adElement.addEventListener('load', () => {
          console.log('Ad loaded successfully');
          setAdLoading(false);
          startCountdown();
        });
        
        adElement.addEventListener('error', () => {
          console.error('Ad failed to load');
          setAdError(true);
          setAdLoading(false);
        });
      } else {
        setAdError(true);
        setAdLoading(false);
      }
    } catch (error) {
      console.error('Error initializing ad:', error);
      setAdError(true);
      setAdLoading(false);
    }
  };

  // Start countdown timer
  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setAdCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  useEffect(() => {
    if (open && !adInitialized.current) {
      // Reset states
      setCountdown(30);
      setAdCompleted(false);
      setAdLoading(true);
      setAdError(false);
      
      // Load AdSense
      loadAdSense();
      adInitialized.current = true;
    } else if (!open) {
      // Reset for next time
      adInitialized.current = false;
    }
  }, [open]);

  const handleComplete = () => {
    // Record ad completion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ad_completed', {
        event_category: 'engagement',
        event_label: 'rewarded_ad'
      });
    }
    
    onAdComplete();
    onOpenChange(false);
  };

  const handleSkipAd = () => {
    // Record skip action
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ad_skipped', {
        event_category: 'engagement',
        event_label: 'rewarded_ad'
      });
    }
    
    // Still allow note generation but track this
    onAdComplete();
    onOpenChange(false);
  };

  // Render fallback ad content
  const renderFallbackAd = () => (
    <div className="h-48 bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex flex-col items-center justify-center rounded-lg border border-neutral-800">
      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Play className="w-8 h-8 text-white" />
      </div>
      <p className="text-lg font-semibold text-white">Support Our Service</p>
      <p className="text-sm text-neutral-400 mt-1">By watching this ad</p>
      <div className="mt-4 px-4 py-2 bg-blue-600/20 rounded-lg">
        <p className="text-xs text-blue-300">Ad not loaded? Please enable ads or try again.</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Google AdSense Script */}
      <Script
        id="adsense-init"
        strategy="lazyOnload"
        onError={() => setAdError(true)}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90vw] sm:max-w-md bg-neutral-900 border-neutral-700 text-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
              <Play className="w-5 h-5 text-blue-500" />
              Watch Ad to Generate Notes
            </DialogTitle>
            <DialogDescription className="text-center text-neutral-400">
              Support our service by watching this ad. Notes will be generated after completion.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 space-y-6">
            {/* Ad Container */}
            <div className="relative rounded-lg overflow-hidden border border-neutral-800">
              {adLoading ? (
                <div className="h-48 flex items-center justify-center bg-black">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">Loading ad content...</p>
                  </div>
                </div>
              ) : adError ? (
                <div className="relative">
                  {renderFallbackAd()}
                  <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                    30s
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    ref={adContainerRef}
                    className="min-h-[200px] bg-black"
                    id="ad-container"
                  />
                  
                  {/* Countdown Overlay */}
                  {!adCompleted && (
                    <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {countdown}s
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Status Message */}
            {adCompleted ? (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-500">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-lg font-semibold">Ad Completed!</span>
                </div>
                <p className="text-neutral-400 text-sm">
                  Thank you for supporting our service. Your note will now be generated.
                </p>
              </div>
            ) : adError ? (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-yellow-500">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Using Fallback Mode</span>
                </div>
                <p className="text-neutral-300 text-sm">
                  Please wait {countdown} seconds to continue.
                </p>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-neutral-300">
                  Please watch the ad to continue. {countdown} seconds remaining.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 bg-neutral-800 rounded-full flex-1 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-1000"
                      style={{ width: `${((30 - countdown) / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                {adError && (
                  <Button
                    onClick={handleSkipAd}
                    variant="outline"
                    className="flex-1 py-3 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                  >
                    Continue Anyway
                  </Button>
                )}
                
                <Button
                  onClick={handleComplete}
                  disabled={!adCompleted && !adError}
                  className={`flex-1 py-3 text-base font-medium ${
                    adCompleted || adError
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white' 
                      : 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {adError ? 'Generate Notes' : adCompleted ? 'Generate Notes Now' : 'Please wait...'}
                </Button>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-xs text-neutral-500">
                  Free users support our service by watching ads.
                  <a 
                    href="/pricing" 
                    className="text-blue-400 hover:text-blue-300 ml-1 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenChange(false);
                      // You can redirect to pricing page here
                    }}
                  >
                    Upgrade to Premium
                  </a> to remove ads.
                </p>
                <p className="text-[10px] text-neutral-600">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="text-neutral-500 hover:text-neutral-400">Terms</a> and{' '}
                  <a href="/privacy" className="text-neutral-500 hover:text-neutral-400">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}