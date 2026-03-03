import React from 'react';
import Link from 'next/link';
import { IconCode, IconSchool, IconMicroscope } from '@tabler/icons-react';

export default function UseCasesHome() {
  const cases = [
    {
      title: "Students",
      description: "Convert 3-hour YouTube lectures to PDF notes seamlessly.",
      icon: <IconSchool className="text-blue-500" size={32} />,
      link: "/use-cases/students",
      label: "Best AI YouTube to notes for engineering students"
    },
    {
      title: "Developers",
      description: "Summarize detailed coding tutorials into quick reference guides.",
      icon: <IconCode className="text-green-500" size={32} />,
      link: "/use-cases/developers",
      label: "Code faster with AI notes"
    },
    {
      title: "Researchers",
      description: "Summarize YouTube medical lectures into flashcards quickly.",
      icon: <IconMicroscope className="text-purple-500" size={32} />,
      link: "/use-cases/researchers",
      label: "Research efficiently"
    }
  ];

  return (
    <section className="w-full max-w-5xl mx-auto py-16 px-4 border-t border-white/10 mt-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Tailored for Your Workflow</h2>
        <p className="text-neutral-400">Discover how Paperxify enhances learning across domains.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cases.map((c, idx) => (
          <div key={idx} className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all flex flex-col items-center text-center">
            <div className="p-4 bg-black rounded-full mb-4">
              {c.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{c.title}</h3>
            <p className="text-sm text-neutral-400 mb-4">{c.description}</p>
            <p className="text-xs text-neutral-500 font-medium mb-6">{c.label}</p>
            <Link href={c.link} className="mt-auto px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-bold transition-colors">
              View Use Case
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
