// client/src/components/MapboxGlobalMap.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Globe } from "lucide-react";

interface UserMapPoint {
  name: string;
  email: string;
  picture?: string;
  membership?: {
    isActive: boolean;
  };
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface MapboxGlobalMapProps {
  users?: UserMapPoint[];
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapboxGlobalMap({ users = [] }: MapboxGlobalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Mapbox CDN scripts dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if mapboxgl is already available globally
    if ((window as any).mapboxgl) {
      setSdkReady(true);
      return;
    }

    const stylesheetId = "mapbox-css";
    const scriptId = "mapbox-js";

    // 1. Inject Stylesheet
    if (!document.getElementById(stylesheetId)) {
      const link = document.createElement("link");
      link.id = stylesheetId;
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.css";
      document.head.appendChild(link);
    }

    // 2. Inject JS SDK
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.js";
      script.async = true;
      script.onload = () => setSdkReady(true);
      script.onerror = () => setError("Failed to load Mapbox SDK.");
      document.body.appendChild(script);
    } else {
      // Script is already injecting, poll till mapboxgl is ready
      const checkInterval = setInterval(() => {
        if ((window as any).mapboxgl) {
          clearInterval(checkInterval);
          setSdkReady(true);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Initialize Map and Render Markers
  useEffect(() => {
    if (!sdkReady || !mapContainerRef.current) return;

    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      // Create Map instance
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [0, 20], // Centered globally
        zoom: 1.5,
        projection: "globe", // Cool spherical projection!
      });

      mapRef.current = map;

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      // Add cool atmosphere effect
      map.on("style.load", () => {
        map.setFog({
          color: "rgb(12, 12, 12)",
          "high-color": "rgb(36, 12, 60)",
          "space-color": "rgb(0, 0, 0)",
          "horizon-blend": 0.02,
        });
      });

      // Map rotation effect when idle
      let userInteracted = false;
      const spinMap = () => {
        if (userInteracted) return;
        const zoom = map.getZoom();
        if (zoom < 4) {
          const center = map.getCenter();
          center.lng += 0.15;
          map.easeTo({ center, duration: 1000, easing: (t: any) => t });
        }
      };

      map.on("mousedown", () => { userInteracted = true; });
      map.on("dragstart", () => { userInteracted = true; });
      map.on("zoomstart", () => { userInteracted = true; });

      // Run rotation loop
      map.on("moveend", () => {
        setTimeout(spinMap, 1200);
      });
      spinMap();

      // Clear map instance on unmount
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (e: any) {
      setError(`Failed to initialize Map: ${e.message}`);
    }
  }, [sdkReady]);

  // Update Markers when users prop changes
  useEffect(() => {
    if (!sdkReady || !mapRef.current) return;
    const mapboxgl = (window as any).mapboxgl;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Filter users with valid coordinates
    const validUsers = users.filter(
      u => u.location && u.location.latitude && u.location.longitude
    );

    validUsers.forEach(user => {
      const lat = user.location?.latitude!;
      const lon = user.location?.longitude!;
      const isPaid = user.membership?.isActive;

      // 1. Create custom HTML Marker element
      const markerEl = document.createElement("div");
      markerEl.className = "custom-marker";
      markerEl.style.width = "12px";
      markerEl.style.height = "12px";
      markerEl.style.borderRadius = "50%";
      markerEl.style.cursor = "pointer";

      // Color scheme: Paid users glow purple/rose; Free users glow cyan/blue
      const primaryColor = isPaid ? "#d946ef" : "#38bdf8"; // neon magenta vs neon sky blue
      const shadowColor = isPaid ? "rgba(217, 70, 239, 0.4)" : "rgba(56, 189, 248, 0.4)";

      markerEl.style.backgroundColor = primaryColor;
      markerEl.style.boxShadow = `0 0 10px ${primaryColor}, 0 0 20px ${shadowColor}`;

      // Inject custom styling for pulse ring
      const styleSheet = document.createElement("style");
      styleSheet.innerText = `
        .custom-marker {
          position: relative;
        }
        .custom-marker::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border-radius: 50%;
          box-shadow: 0 0 12px ${primaryColor};
          animation: pulse-ring 2.2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 1; }
          80%, 100% { transform: scale(3.8); opacity: 0; }
        }
      `;
      markerEl.appendChild(styleSheet);

      // 2. Setup popup details
      const popupHTML = `
        <div style="padding: 4px; font-family: sans-serif; display: flex; flex-direction: column; gap: 8px; max-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${user.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}" 
                 style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; background: #262626; border: 1px solid #404040;" />
            <div style="min-width: 0;">
              <div style="font-weight: 700; color: #fff; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.name}</div>
              <div style="color: #a3a3a3; font-size: 9px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.email}</div>
            </div>
          </div>
          <div style="border-top: 1px solid #262626; padding-top: 6px; display: flex; flex-direction: column; gap: 3px;">
            <div style="font-size: 9px; color: #737373;">
              Location: <strong style="color: #d4d4d4;">${user.location?.city || "Unknown"}, ${user.location?.country || ""}</strong>
            </div>
            <div style="font-size: 9px; display: flex; align-items: center; gap: 4px; font-weight: 600; color: ${isPaid ? "#d946ef" : "#a3a3a3"};">
              <span>${isPaid ? "👑 Pro Scholar Plan" : "⚡ Free Learner"}</span>
            </div>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 15,
        closeButton: false,
        className: "mapbox-premium-popup"
      }).setHTML(popupHTML);

      // 3. Mount marker to map
      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([lon, lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [users, sdkReady]);

  if (error) {
    return (
      <div className="h-96 w-full rounded-2xl border border-red-500/10 bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-xs font-mono text-red-400 mb-2">Map Telemetry Offline</p>
        <p className="text-[10px] text-neutral-500 max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Dynamic Popups Styled Overrides Injection */}
      <style>{`
        .mapboxgl-popup-content {
          background: #0a0a0a !important;
          color: #fff !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 12px !important;
          padding: 10px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6) !important;
        }
        .mapboxgl-popup-anchor-top .mapboxgl-popup-tip { border-bottom-color: rgba(255, 255, 255, 0.08) !important; }
        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip { border-top-color: rgba(255, 255, 255, 0.08) !important; }
        .mapboxgl-popup-anchor-left .mapboxgl-popup-tip { border-right-color: rgba(255, 255, 255, 0.08) !important; }
        .mapboxgl-popup-anchor-right .mapboxgl-popup-tip { border-left-color: rgba(255, 255, 255, 0.08) !important; }
      `}</style>

      {/* Header Info Ribbon */}
      <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
            <Globe size={12} className="text-red-500 animate-spin" style={{ animationDuration: "10s" }} />
            Global Student Operations Map
          </h3>
          <p className="text-[9px] font-mono text-neutral-500 mt-0.5">Real-time geolocated registrations of platform learners</p>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#d946ef] shadow-[0_0_8px_#d946ef]" />
            <span>Pro Scholar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
            <span>Free Learner</span>
          </div>
        </div>
      </div>

      <div className="relative h-96 w-full rounded-xl overflow-hidden border border-neutral-900">
        {!sdkReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 gap-3">
            <Loader2 className="h-7 w-7 text-red-500 animate-spin" />
            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Rendering Globe Deck...</p>
          </div>
        )}
        <div ref={mapContainerRef} className="h-full w-full bg-black" />
      </div>
    </div>
  );
}
