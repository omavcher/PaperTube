import React from 'react';

export default function BlogLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-24 space-y-12 animate-pulse mt-20">
      <div className="h-16 bg-white/5 w-2/3 md:w-1/3 rounded-2xl mx-auto md:mx-0"></div>
      <div className="h-[300px] md:h-[450px] bg-white/5 w-full rounded-[2rem]"></div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 h-96 bg-white/5 rounded-2xl"></div>
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 rounded-2xl"></div>
          <div className="h-64 bg-white/5 rounded-2xl"></div>
          <div className="h-64 bg-white/5 rounded-2xl"></div>
          <div className="h-64 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
