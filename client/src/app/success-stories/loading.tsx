import React from 'react';

export default function SuccessStoryLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-24 space-y-12 animate-pulse mt-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="h-12 md:h-16 bg-white/5 w-64 rounded-2xl"></div>
        <div className="h-12 bg-white/5 w-40 rounded-xl w-full md:w-40"></div>
      </div>
      <div className="h-[400px] md:h-[550px] bg-white/5 w-full rounded-[2.5rem]"></div>
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div className="h-8 bg-white/5 w-48 rounded-lg"></div>
        <div className="h-10 bg-white/5 w-32 rounded-lg"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="h-64 bg-white/5 rounded-2xl"></div>
        <div className="h-64 bg-white/5 rounded-2xl"></div>
        <div className="h-64 bg-white/5 rounded-2xl"></div>
        <div className="h-64 bg-white/5 rounded-2xl"></div>
      </div>
    </div>
  );
}
