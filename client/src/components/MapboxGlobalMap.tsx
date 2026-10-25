// client/src/components/MapboxGlobalMap.tsx
"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Loader2,
  Globe,
  MapPin,
  Maximize2,
  Minimize2,
  Compass,
  Search,
  X,
  Crosshair,
  RotateCcw,
  Navigation
} from "lucide-react";

export interface UserMapPoint {
  _id?: string;
  name: string;
  email: string;
  picture?: string;
  membership?: {
    isActive: boolean;
    planId?: string;
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

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Supported Mapbox Tile Styles
const MAP_STYLES = [
  { id: "dark", label: "Dark Matrix", uri: "mapbox://styles/mapbox/dark-v11", icon: "🌙" },
  { id: "satellite", label: "Satellite Hybrid", uri: "mapbox://styles/mapbox/satellite-streets-v12", icon: "🛰️" },
  { id: "navigation", label: "Night Nav", uri: "mapbox://styles/mapbox/navigation-night-v1", icon: "🧭" },
  { id: "streets", label: "Light Streets", uri: "mapbox://styles/mapbox/streets-v12", icon: "☀️" },
];

export default function MapboxGlobalMap({ users = [] }: MapboxGlobalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const popupsRef = useRef<any[]>([]);

  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<string>("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [is3DPitched, setIs3DPitched] = useState(false);

  // Filter and normalize users with valid coordinates
  const validUsers = useMemo(() => {
    return users
      .filter((u) => {
        if (!u.location) return false;
        const lat = Number(u.location.latitude);
        const lng = Number(u.location.longitude);
        return (
          !isNaN(lat) &&
          !isNaN(lng) &&
          u.location.latitude !== null &&
          u.location.longitude !== null &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        );
      })
      .map((u) => ({
        ...u,
        location: {
          ...u.location,
          latitude: Number(u.location!.latitude),
          longitude: Number(u.location!.longitude),
        },
      }));
  }, [users]);

  // Aggregate users by country for quick filter chips
  const countryStats = useMemo(() => {
    const counts: Record<string, { count: number; lat: number; lng: number }> = {};
    validUsers.forEach((u) => {
      const country = u.location?.country?.trim() || "Unknown";
      if (!counts[country]) {
        counts[country] = { count: 0, lat: u.location.latitude, lng: u.location.longitude };
      }
      counts[country].count += 1;
    });

    return Object.entries(counts)
      .map(([country, info]) => ({ country, ...info }))
      .sort((a, b) => b.count - a.count);
  }, [validUsers]);

  // Filtered users according to search & country selection
  const displayedUsers = useMemo(() => {
    return validUsers.filter((u) => {
      const matchCountry = selectedCountry === "ALL" || (u.location?.country || "Unknown") === selectedCountry;
      if (!matchCountry) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const city = (u.location?.city || "").toLowerCase();
      const country = (u.location?.country || "").toLowerCase();

      return name.includes(q) || email.includes(q) || city.includes(q) || country.includes(q);
    });
  }, [validUsers, selectedCountry, searchQuery]);

  // Pro vs Free ratio calculation
  const proCount = useMemo(() => validUsers.filter((u) => u.membership?.isActive).length, [validUsers]);
  const freeCount = validUsers.length - proCount;

  // 1. Inject Mapbox GL SDK & CSS Dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).mapboxgl) {
      setSdkReady(true);
      return;
    }

    const stylesheetId = "mapbox-gl-css";
    const scriptId = "mapbox-gl-js";

    if (!document.getElementById(stylesheetId)) {
      const link = document.createElement("link");
      link.id = stylesheetId;
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.js";
      script.async = true;
      script.onload = () => setSdkReady(true);
      script.onerror = () => setError("Failed to load Mapbox GL JS engine.");
      document.body.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if ((window as any).mapboxgl) {
          clearInterval(interval);
          setSdkReady(true);
        }
      }, 80);
      return () => clearInterval(interval);
    }
  }, []);

  // 2. Initialize the Flat 2D World Map (Mercator projection)
  useEffect(() => {
    if (!sdkReady || !mapContainerRef.current) return;
    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      // Create Flat Map instance
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [20, 20], // Centered comfortably on Europe/Africa/Asia/Americas
        zoom: 1.8,
        minZoom: 1.2,
        maxZoom: 18,
        projection: "mercator", // Flat 2D world map so all continents and exact locations are directly visible
        attributionControl: false,
      });

      mapRef.current = map;

      // Add navigation controls (Zoom + / -, Compass Reset)
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }), "top-right");

      // Add scale control (miles / kilometers metric)
      const scale = new mapboxgl.ScaleControl({ maxWidth: 120, unit: "metric" });
      map.addControl(scale, "bottom-right");

      // Track cursor coordinates for real-time telemetry readout
      map.on("mousemove", (e: any) => {
        setCursorCoords({
          lat: Number(e.lngLat.lat.toFixed(4)),
          lng: Number(e.lngLat.lng.toFixed(4)),
          zoom: Number(map.getZoom().toFixed(1)),
        });
      });

      // Fit bounds to all users initially if we have valid locations
      map.on("load", () => {
        if (validUsers.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          validUsers.forEach((u) => {
            bounds.extend([u.location!.longitude, u.location!.latitude]);
          });
          map.fitBounds(bounds, { padding: 60, maxZoom: 5, duration: 1500 });
        }
      });

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (e: any) {
      console.error("Mapbox init failed:", e);
      setError(`Failed to initialize Map: ${e?.message || "Unknown error"}`);
    }
  }, [sdkReady]);

  // 3. Render High-Precision Markers & Popups
  useEffect(() => {
    if (!sdkReady || !mapRef.current) return;
    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    // Clear previous markers & popups
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    popupsRef.current.forEach((p) => p.remove());
    popupsRef.current = [];

    displayedUsers.forEach((user) => {
      const lat = user.location!.latitude;
      const lon = user.location!.longitude;
      const isPaid = Boolean(user.membership?.isActive);

      // Create interactive DOM pin element
      const el = document.createElement("div");
      el.className = "group relative cursor-pointer select-none";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";

      const pinColor = isPaid ? "#d946ef" : "#06b6d4"; // Fuchsia Pro vs Cyan Free
      const glowColor = isPaid ? "rgba(217, 70, 239, 0.5)" : "rgba(6, 182, 212, 0.5)";

      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <!-- Outer Pulsing Halo -->
          <div style="
            position: absolute;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: ${glowColor};
            animation: pulse-beacon 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
          "></div>
          
          <!-- Inner Core Pin -->
          <div style="
            position: relative;
            z-index: 2;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: ${pinColor};
            border: 2px solid #ffffff;
            box-shadow: 0 0 14px ${pinColor}, 0 2px 8px rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          ">
            ${isPaid ? '<span style="font-size:7px; color:#fff; font-weight:900;">★</span>' : ""}
          </div>
        </div>
      `;

      // Custom popover tooltip on marker click
      const formatCoord = (deg: number, isLat: boolean) => {
        const dir = isLat ? (deg >= 0 ? "N" : "S") : (deg >= 0 ? "E" : "W");
        return `${Math.abs(deg).toFixed(4)}° ${dir}`;
      };

      const popupContent = document.createElement("div");
      popupContent.className = "mapbox-rich-card";
      popupContent.innerHTML = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 220px; max-width: 260px; padding: 2px;">
          <!-- Header: User Identity -->
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <img 
              src="${user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}" 
              style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${pinColor}; background: #171717;"
            />
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 700; color: #ffffff; font-size: 13px; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${user.name}
              </div>
              <div style="color: #94a3b8; font-size: 10px; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${user.email}
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div style="height: 1px; background: rgba(255, 255, 255, 0.1); margin: 6px 0;"></div>

          <!-- Exact Location Details -->
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: #64748b; font-size: 10px; text-transform: uppercase; font-family: monospace;">Location</span>
              <span style="color: #e2e8f0; font-weight: 600;">
                ${user.location?.city ? user.location.city + ", " : ""}${user.location?.country || "Earth"}
              </span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: #64748b; font-size: 10px; text-transform: uppercase; font-family: monospace;">GPS Coordinates</span>
              <span style="color: #38bdf8; font-size: 10px; font-family: monospace; font-weight: 600;">
                ${formatCoord(lat, true)}, ${formatCoord(lon, false)}
              </span>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 3px;">
              <span style="color: #64748b; font-size: 10px; text-transform: uppercase; font-family: monospace;">Status</span>
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: ${pinColor}; background: ${glowColor}; padding: 2px 7px; border-radius: 9999px;">
                ${isPaid ? "👑 PRO SCHOLAR" : "⚡ FREE LEARNER"}
              </span>
            </div>
          </div>

          <!-- Zoom Action Button -->
          <button id="zoom-user-btn-${Math.random().toString(36).substring(2, 7)}" style="
            margin-top: 10px;
            width: 100%;
            padding: 6px 10px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #ffffff;
            font-size: 10px;
            font-weight: 600;
            font-family: monospace;
            cursor: pointer;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s ease;
          ">
            <span>🔍 Zoom In to Exact Location</span>
          </button>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 18,
        closeButton: true,
        closeOnClick: true,
        className: "mapbox-telemetry-popup",
        maxWidth: "320px",
      }).setDOMContent(popupContent);

      // Handle Zoom in button click inside popup
      popup.on("open", () => {
        const btn = popupContent.querySelector("button");
        if (btn) {
          btn.onclick = () => {
            mapRef.current?.flyTo({
              center: [lon, lat],
              zoom: 13.5, // Street/city high-precision view
              speed: 1.4,
              curve: 1.2,
              essential: true,
            });
          };
        }
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([lon, lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
      popupsRef.current.push(popup);
    });
  }, [displayedUsers, sdkReady, currentStyle]);

  // Style change handler
  const handleStyleChange = useCallback((styleUri: string, styleId: string) => {
    if (!mapRef.current) return;
    setCurrentStyle(styleId);
    mapRef.current.setStyle(styleUri);
  }, []);

  // Fly to country
  const handleSelectCountry = useCallback(
    (country: string, lat?: number, lng?: number) => {
      setSelectedCountry(country);
      if (!mapRef.current) return;

      if (country === "ALL") {
        if (validUsers.length > 0) {
          const mapboxgl = (window as any).mapboxgl;
          const bounds = new mapboxgl.LngLatBounds();
          validUsers.forEach((u) => {
            bounds.extend([u.location!.longitude, u.location!.latitude]);
          });
          mapRef.current.fitBounds(bounds, { padding: 50, duration: 1200 });
        } else {
          mapRef.current.flyTo({ center: [20, 20], zoom: 1.8, duration: 1200 });
        }
        return;
      }

      if (typeof lat === "number" && typeof lng === "number") {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 4.8,
          speed: 1.2,
          curve: 1.3,
          essential: true,
        });
      }
    },
    [validUsers]
  );

  // Reset to full world view
  const handleResetWorld = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [20, 20],
      zoom: 1.8,
      pitch: 0,
      bearing: 0,
      duration: 1200,
    });
    setSelectedCountry("ALL");
    setSearchQuery("");
    setIs3DPitched(false);
  }, []);

  // Toggle 3D Tilt
  const handleToggle3D = useCallback(() => {
    if (!mapRef.current) return;
    const targetPitch = is3DPitched ? 0 : 50;
    mapRef.current.easeTo({ pitch: targetPitch, duration: 800 });
    setIs3DPitched(!is3DPitched);
  }, [is3DPitched]);

  // Focus on specific user from search dropdown
  const handleFocusUser = useCallback((user: UserMapPoint) => {
    if (!mapRef.current || !user.location?.latitude || !user.location?.longitude) return;
    mapRef.current.flyTo({
      center: [user.location.longitude, user.location.latitude],
      zoom: 11,
      speed: 1.4,
      essential: true,
    });
    setSearchQuery("");
  }, []);

  return (
    <div
      className={`relative w-full rounded-2xl border border-white/[0.08] bg-[#08090e] shadow-2xl backdrop-blur-xl transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen w-screen" : "p-4 md:p-5"
      }`}
    >
      {/* Global CSS for Mapbox Popups & Animations */}
      <style>{`
        @keyframes pulse-beacon {
          0% { transform: scale(0.6); opacity: 0.9; }
          70%, 100% { transform: scale(3.2); opacity: 0; }
        }
        .mapboxgl-popup {
          z-index: 30;
        }
        .mapboxgl-popup-content {
          background: #0d0e15 !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 14px !important;
          padding: 12px !important;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.4) !important;
          backdrop-filter: blur(12px) !important;
        }
        .mapboxgl-popup-close-button {
          color: #94a3b8 !important;
          font-size: 16px !important;
          padding: 6px 8px !important;
          line-height: 1 !important;
          outline: none !important;
        }
        .mapboxgl-popup-close-button:hover {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 6px !important;
        }
        .mapboxgl-popup-anchor-top .mapboxgl-popup-tip { border-bottom-color: #0d0e15 !important; }
        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip { border-top-color: #0d0e15 !important; }
        .mapboxgl-popup-anchor-left .mapboxgl-popup-tip { border-right-color: #0d0e15 !important; }
        .mapboxgl-popup-anchor-right .mapboxgl-popup-tip { border-left-color: #0d0e15 !important; }
        .mapboxgl-ctrl-group {
          background: #0d0e15 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 10px !important;
          overflow: hidden !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6) !important;
        }
        .mapboxgl-ctrl-group button {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          background-color: transparent !important;
        }
        .mapboxgl-ctrl-group button:last-child {
          border-bottom: none !important;
        }
        .mapboxgl-ctrl-group button span {
          filter: invert(1) brightness(1.2);
        }
        .mapboxgl-ctrl-scale {
          background: rgba(13, 14, 21, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          color: #94a3b8 !important;
          font-family: monospace !important;
          font-size: 9px !important;
          border-radius: 4px !important;
          padding: 2px 6px !important;
        }
      `}</style>

      {/* ── TOP CONTROL DECK: TITLE & MISSION STATS ──────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        {/* Title and Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500/20 to-purple-500/20 border border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Globe className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs md:text-sm font-bold tracking-wider uppercase text-white font-mono flex items-center gap-1.5">
                Global Operations Telemetry
              </h3>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE MAPBOX
              </span>
            </div>
            <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
              High-precision geolocated registrations across {countryStats.length} active nations
            </p>
          </div>
        </div>

        {/* Global Key Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Total Geocoded Users */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono">
            <MapPin size={12} className="text-cyan-400" />
            <span className="text-neutral-400">Learners Mapped:</span>
            <span className="text-white font-bold">{validUsers.length}</span>
          </div>

          {/* Pro Scholar Ratio */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/25 text-[11px] font-mono text-fuchsia-300">
            <span className="h-2 w-2 rounded-full bg-[#d946ef] shadow-[0_0_8px_#d946ef]" />
            <span className="font-bold">{proCount}</span> Pro
          </div>

          {/* Free Learner Ratio */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-[11px] font-mono text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]" />
            <span className="font-bold">{freeCount}</span> Free
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: SEARCH, QUICK COUNTRY JUMP & MAP ENGINE MODES ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-3">
        {/* Search Input with Autocomplete */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search learner, city or country..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/50 font-mono transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}

          {/* Search Results Dropdown Preview */}
          {searchQuery.trim().length > 0 && displayedUsers.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-48 overflow-y-auto rounded-xl border border-white/[0.12] bg-[#0d0e15] shadow-2xl p-1 backdrop-blur-xl">
              {displayedUsers.slice(0, 6).map((u, i) => (
                <button
                  key={i}
                  onClick={() => handleFocusUser(u)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] flex items-center justify-between gap-2 text-xs transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{u.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate font-mono">
                      {u.location?.city ? `${u.location.city}, ` : ""}{u.location?.country}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      u.membership?.isActive ? "bg-fuchsia-500/20 text-fuchsia-400" : "bg-cyan-500/20 text-cyan-400"
                    }`}
                  >
                    {u.membership?.isActive ? "Pro" : "Free"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls: Style Selector, 3D Tilt, Reset View, Fullscreen */}
        <div className="flex items-center gap-1.5">
          {/* Mapbox Layer Style Selector */}
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-0.5">
            {MAP_STYLES.map((st) => (
              <button
                key={st.id}
                onClick={() => handleStyleChange(st.uri, st.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-medium flex items-center gap-1 transition-all ${
                  currentStyle === st.id
                    ? "bg-red-500/20 text-white border border-red-500/30 shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                }`}
                title={st.label}
              >
                <span>{st.icon}</span>
                <span className="hidden sm:inline">{st.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* 3D Isometric Pitch Toggle */}
          <button
            onClick={handleToggle3D}
            className={`p-2 rounded-xl border text-[11px] font-mono transition-all flex items-center gap-1 ${
              is3DPitched
                ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                : "bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
            }`}
            title="Toggle 2D Flat / 3D Isometric Pitch"
          >
            <Compass size={13} className={is3DPitched ? "rotate-45 text-purple-400" : ""} />
            <span className="hidden md:inline">{is3DPitched ? "3D Pitch" : "2D Flat"}</span>
          </button>

          {/* Reset World Extent View */}
          <button
            onClick={handleResetWorld}
            className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06] text-[11px] font-mono transition-all flex items-center gap-1"
            title="Reset to Full World View"
          >
            <RotateCcw size={13} />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06] text-[11px] transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen World View"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* ── QUICK COUNTRY JUMP CHIPS (Derived from Real Telemetry) ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar text-[11px] font-mono">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500 mr-1 flex items-center gap-1 shrink-0">
          <Navigation size={10} className="text-red-400" />
          Jump To:
        </span>

        {/* Global Reset Chip */}
        <button
          onClick={() => handleSelectCountry("ALL")}
          className={`shrink-0 px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
            selectedCountry === "ALL"
              ? "bg-white text-black font-bold border-white shadow-md"
              : "bg-white/[0.03] border-white/[0.08] text-neutral-300 hover:bg-white/[0.08]"
          }`}
        >
          <span>🌍</span>
          <span>Global All</span>
          <span className="text-[9px] opacity-75">({validUsers.length})</span>
        </button>

        {/* Top Active Countries */}
        {countryStats.slice(0, 9).map((c) => (
          <button
            key={c.country}
            onClick={() => handleSelectCountry(c.country, c.lat, c.lng)}
            className={`shrink-0 px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
              selectedCountry === c.country
                ? "bg-red-500 text-white font-bold border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                : "bg-white/[0.03] border-white/[0.08] text-neutral-300 hover:bg-white/[0.08]"
            }`}
          >
            <span>{c.country === "India" ? "🇮🇳" : c.country === "United States" ? "🇺🇸" : c.country === "Australia" ? "🇦🇺" : c.country === "United Kingdom" ? "🇬🇧" : c.country === "Japan" ? "🇯🇵" : c.country === "France" ? "🇫🇷" : "📍"}</span>
            <span>{c.country}</span>
            <span className="text-[9px] opacity-75">({c.count})</span>
          </button>
        ))}
      </div>

      {/* ── MAP CANVAS CONTAINER ─────────────────────────────────── */}
      <div
        className={`relative w-full rounded-xl overflow-hidden border border-white/[0.08] bg-[#050608] ${
          isFullscreen ? "h-[calc(100vh-140px)]" : "h-[460px] md:h-[520px]"
        }`}
      >
        {/* Loading Overlay */}
        {!sdkReady && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 gap-3 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              Initializing High-Resolution World Engine...
            </p>
          </div>
        )}

        {/* Error Fallback Notice */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 z-20 p-6 text-center">
            <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-2">
              <Globe size={18} />
            </div>
            <p className="text-xs font-mono font-bold text-red-400 mb-1">Mapbox Vector Telemetry Offline</p>
            <p className="text-[11px] font-mono text-neutral-500 max-w-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono text-white transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Mapbox Canvas Mount Point */}
        <div ref={mapContainerRef} className="h-full w-full bg-[#050608]" />

        {/* Real-time Cursor Telemetry Readout Ribbon */}
        {cursorCoords && (
          <div className="absolute bottom-2.5 left-2.5 z-10 hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0d0e15]/90 border border-white/[0.1] text-[9px] font-mono text-neutral-400 backdrop-blur-md shadow-lg pointer-events-none">
            <Crosshair size={10} className="text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span>
              LAT: <strong className="text-white">{cursorCoords.lat}°</strong>
            </span>
            <span className="text-white/20">|</span>
            <span>
              LNG: <strong className="text-white">{cursorCoords.lng}°</strong>
            </span>
            <span className="text-white/20">|</span>
            <span>
              ZOOM: <strong className="text-cyan-400">{cursorCoords.zoom}x</strong>
            </span>
            <span className="text-white/20">|</span>
            <span>
              PITCH: <strong className="text-purple-400">{is3DPitched ? "50°" : "0° (Flat)"}</strong>
            </span>
          </div>
        )}

        {/* Filter Indicator Floating Chip */}
        {displayedUsers.length !== validUsers.length && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-[10px] font-mono text-red-300 backdrop-blur-md shadow-lg">
            <span>Filtered: Showing {displayedUsers.length} of {validUsers.length}</span>
            <button
              onClick={() => {
                setSelectedCountry("ALL");
                setSearchQuery("");
              }}
              className="hover:text-white underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER TELEMETRY HUD: MISSION STATUS SUMMARY ─────────── */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-neutral-500 pt-2 border-t border-white/[0.04]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Mapbox GL Mercator 2D Projection</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Click any marker to inspect student coordinates</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span>
            Telemetry Sync: <strong className="text-neutral-300">Authoritative</strong>
          </span>
          <span className="text-white/20">•</span>
          <span>
            Active Nodes: <strong className="text-emerald-400">{validUsers.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
