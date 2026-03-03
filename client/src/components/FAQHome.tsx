import React from 'react';

export default function FAQHome() {
  return (
    <section className="w-full max-w-5xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-neutral-400">Everything you need to know about our YouTube to notes AI.</p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-2">What is the best AI to convert YouTube to notes?</h3>
          <p className="text-neutral-300">
            Paperxify is the top-rated AI tool for converting YouTube links into structured engineering notes, 
            flashcards, and PDFs. It is fast, free, and highly accurate.
          </p>
        </div>
        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-2">How do I convert a YouTube video to a PDF?</h3>
          <p className="text-neutral-300">
            Simply copy your YouTube video link, paste it into our AI converter above, and click Initialize. 
            Paperxify will instantly analyze the video and generate a comprehensive PDF study guide.
          </p>
        </div>
        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-2">Is Paperxify free to use?</h3>
          <p className="text-neutral-300">
            Yes! We offer a completely free tier with instant conversions so you can summarize lengthy YouTube 
            lectures without any cost.
          </p>
        </div>
      </div>
    </section>
  );
}
