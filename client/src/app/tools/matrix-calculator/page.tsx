import MatrixCalculatorClient from "@/components/tools/MatrixCalculatorClient"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matrix Calculator | Determinant, Inverse, Rank & More",
  description: "Free online matrix calculator for engineering and math students. Calculate determinant, inverse, rank, transpose, and perform matrix arithmetic instantly.",
  keywords: ["matrix calculator", "matrix determinant", "matrix inverse", "linear algebra tool", "matrix rank calculator", "matrix multiplication"],
  openGraph: {
    title: "Professional Matrix Laboratory | Neural Tools",
    description: "Solve complex matrix operations up to 5x5 instantly. Free, secure, and mobile-optimized.",
    type: "website",
  }
};

export default function Page() {
  return <MatrixCalculatorClient />;
}