import React from 'react';

export default function BlogPostLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-24 animate-pulse max-w-4xl mx-auto space-y-8 mt-20">
      <div className="h-8 bg-white/5 w-32 rounded-lg"></div>
      <div className="h-12 md:h-16 bg-white/5 w-full rounded-2xl mt-4"></div>
      <div className="h-8 bg-white/5 w-2/3 rounded-xl mt-2"></div>
      <div className="flex items-center gap-4 mt-6">
        <div className="h-12 w-12 bg-white/5 rounded-full"></div>
        <div className="h-6 bg-white/5 w-32 rounded-lg"></div>
      </div>
      <div className="h-64 md:h-96 bg-white/5 w-full rounded-[2rem] mt-8"></div>
      <div className="space-y-4 mt-8">
        <div className="h-6 bg-white/5 w-full rounded-lg"></div>
        <div className="h-6 bg-white/5 w-full rounded-lg"></div>
        <div className="h-6 bg-white/5 w-11/12 rounded-lg"></div>
        <div className="h-6 bg-white/5 w-10/12 rounded-lg"></div>
        <div className="h-6 bg-white/5 w-full rounded-lg"></div>
        <div className="h-6 bg-white/5 w-9/12 rounded-lg"></div>
      </div>
    </div>
  );
}
