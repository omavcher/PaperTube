import ImageConverterClient from "@/components/tools/ImageConverterClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Image Converter | Convert PNG, JPG, WEBP Online",
  description: "Convert images instantly in your browser. Supports PNG, JPG, and WEBP formats with custom quality settings. 100% free, secure, and local processing.",
  keywords: ["image converter", "png to jpg", "webp converter", "image compression", "free image tool", "local image processing"],
  openGraph: {
    title: "Polyform Image Converter | Neural Tools",
    description: "Transmute image formats instantly. Secure, client-side processing.",
    type: "website",
  }
};

export default function Page() {
  return <ImageConverterClient />;
}