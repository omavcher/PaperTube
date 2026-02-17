import QRCodeGeneratorClient from "@/components/tools/QRCodeGeneratorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free QR Code Generator | Create Custom QR Codes Online",
  description: "Generate free, customizable QR codes for URLs, text, WiFi, email, and more. Add logos, colors, and download high-quality PNGs instantly. No registration required.",
  keywords: ["qr code generator", "create qr code", "free qr code", "custom qr code", "wifi qr code", "url to qr", "qr code with logo"],
  openGraph: {
    title: "QR Forge | Neural Tools",
    description: "Create custom, high-quality QR codes instantly. Free and secure.",
    type: "website",
  }
};

export default function Page() {
  return <QRCodeGeneratorClient />;
}