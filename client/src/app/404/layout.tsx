// src/app/404/layout.tsx
export default function NotFoundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="min-h-screen bg-black text-white">
      {children}
    </section>
  );
}