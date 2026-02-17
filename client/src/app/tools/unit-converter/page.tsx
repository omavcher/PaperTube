import UnitConverterClient from "@/components/tools/UnitConverterClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Universal Unit Converter | Length, Weight, Currency & More",
  description: "Free online unit converter with 100+ units across 8 categories. Real-time currency exchange rates, smart formatting, and instant conversion for engineering and daily use.",
  keywords: ["unit converter", "currency converter", "metric to imperial", "length converter", "weight converter", "temperature converter", "engineering calculator"],
  openGraph: {
    title: "Universal Unit Lab | Neural Tools",
    description: "Convert anything instantly. Live currency rates and scientific precision.",
    type: "website",
  }
};

export default function Page() {
  return <UnitConverterClient />;
}