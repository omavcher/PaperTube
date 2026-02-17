import AIDetectorClient from "@/components/tools/AIDetectorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Image Detector | Deepfake & Gen-AI Scanner",
  description: "Analyze images for AI generation signatures. Detect Midjourney, DALL-E, and Stable Diffusion artifacts with forensic precision. Free online verification.",
  keywords: ["ai detector", "deepfake scanner", "ai image checker", "midjourney detector", "stable diffusion scanner", "digital forensics"],
  openGraph: {
    title: "Neural Sentinel | AI Forensic Scanner",
    description: "Verify digital authenticity. Detect generative AI artifacts instantly.",
    type: "website",
  }
};

export default function Page() {
  return <AIDetectorClient />;
}