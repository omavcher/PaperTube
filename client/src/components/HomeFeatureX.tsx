"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { motion } from "framer-motion";
import { 
  Youtube, 
  FileText, 
  Sparkles, 
  Globe2, 
  Zap, 
  Play 
} from "lucide-react";

export function HomeFeatureX() {
  const features = [
    {
      title: "Instant Video Conversion",
      description:
        "Paste a YouTube link and watch our Neural Engine turn long lectures into crisp, structured notes in seconds.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r border-white/10",
    },
    {
      title: "Smart PDF Formatting",
      description:
        "Auto-generated timestamps, highlighted keywords, and revision-ready layouts.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-white/10",
    },
    {
      title: "YouTube Intelligence",
      description:
        "AI detects chapters, extracts key concepts, and filters out the noise automatically.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r border-white/10",
    },
    {
      title: "Global Knowledge Base",
      description:
        "Join a network of students learning smarter. Organize, share, and conquer your syllabus.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none border-white/10",
    },
  ];
  
  return (
    <div className="relative z-20 max-w-7xl mx-auto py-20 lg:py-40 bg-black font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* --- Ambient Background --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="px-8 relative z-10">
        
        {/* Badge */}
        <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                <Sparkles size={12} className="text-white" />
                <span>Core Capabilities</span>
            </div>
        </div>

        <h4 className="text-4xl lg:text-6xl lg:leading-tight max-w-5xl mx-auto text-center font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
          Smarter Notes, <br />
          <span className="text-white">Architected by AI.</span>
        </h4>

        <p className="text-sm lg:text-lg max-w-2xl my-6 mx-auto text-neutral-400 text-center font-light leading-relaxed">
          PaperTube transforms raw video data into colorful, timestamped knowledge nodes. 
          Clean, readable, and designed for high-retention learning.
        </p>
      </div>

      <div className="relative px-4 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 border rounded-[2rem] border-white/10 bg-neutral-900/20 backdrop-blur-sm overflow-hidden">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full mt-4">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-6 sm:p-10 relative overflow-hidden group`, className)}>
      {children}
      {/* Subtle Hover Glow */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <h3 className="max-w-5xl mx-auto text-left tracking-tight text-white text-2xl font-bold mb-2">
      {children}
    </h3>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left",
        "text-neutral-400 font-normal leading-relaxed"
      )}
    >
      {children}
    </p>
  );
};

// --- Skeletons ---

const SkeletonOne = () => {
  return (
    <div className="relative flex py-4 px-2 gap-10 h-full">
      <div className="w-full p-4 mx-auto shadow-2xl group h-full bg-neutral-900/50 rounded-2xl border border-white/5 overflow-hidden relative">
        
        {/* Browser Header Mockup */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2 z-10">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
        </div>

        <div className="flex flex-1 w-full h-full flex-col mt-6 relative">
             {/* Gradient Overlay for Fade */}
             <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent z-10" />
             
             <img
                src="/pro/home_papertu1.avif" // Ensure this path is correct
                alt="AI Note Generation"
                className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-500"
             />
        </div>
      </div>
    </div>
  );
};

const SkeletonThree = () => {
  return (
    <div className="relative flex gap-10 h-full group/image pt-4">
      <div className="w-full mx-auto bg-transparent group h-full relative overflow-hidden rounded-xl border border-white/5">
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl group-hover/image:scale-110 transition-transform duration-300">
                <Youtube className="w-8 h-8 text-white fill-white" />
            </div>
        </div>
        
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        <img
          src="https://assets.aceternity.com/fireship.jpg"
          alt="YouTube Analysis"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover/image:scale-105"
        />
      </div>
    </div>
  );
};

const SkeletonTwo = () => {
  const images = [
    "/pro/home_papertu2.avif",
    "/pro/home_papertu3.avif",
    "/pro/home_papertu4.avif",
    "/pro/home_papertu5.avif",
  ];

  const imageVariants = {
    whileHover: { scale: 1.05, rotate: 0, zIndex: 20 },
    initial: (i: number) => ({
        rotate: i % 2 === 0 ? -5 : 5,
        scale: 1,
        zIndex: 10
    })
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center h-full overflow-hidden min-h-[200px]">
      <div className="flex flex-row -ml-16 items-center">
        {images.slice(0,3).map((image, idx) => (
          <motion.div
            variants={imageVariants}
            initial="initial"
            custom={idx}
            whileHover="whileHover"
            key={"img-" + idx}
            className="relative -mr-10 rounded-xl border border-white/10 p-1 bg-neutral-900 shadow-2xl shrink-0 cursor-pointer"
          >
            <div className="w-24 h-32 md:w-32 md:h-40 overflow-hidden rounded-lg bg-black">
                <img
                src={image}
                alt="PDF Note"
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-80 flex flex-col items-center relative bg-transparent mt-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
      <Globe className="absolute top-10 md:top-4 opacity-80 mix-blend-screen" />
    </div>
  );
};

const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let globe: any = null;

    if (!canvasRef.current) return;

    globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.1],     // Darker base
      markerColor: [1, 1, 1],         // White markers
      glowColor: [0.2, 0.2, 0.2],     // Subtle glow
      opacity: 0.8,
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [28.6139, 77.2090], size: 0.05 }, // New Delhi
        { location: [19.0760, 72.8777], size: 0.05 }, // Mumbai
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.003; // Slower rotation
      },
    });

    return () => {
      if (globe) {
        globe.destroy();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={cn(className, "w-full h-full")}
    />
  );
};