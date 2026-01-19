import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "YT2PDF",
  description: "Convert YouTube videos to PDF notes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}