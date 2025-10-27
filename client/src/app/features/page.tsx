"use client";
import React from "react";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { motion } from "motion/react";
import Footer from "@/components/Footer";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import FeatureMain from "@/components/FeatureMain";

function Page() {
  return (
    <div className="w-full">
      <BackgroundRippleEffect />

      <div>
        <p className="opacity-0 mt-4 text-center text-base text-neutral-400 max-w-2xl mx-auto">
          Discover how PaperTube turns your YouTube lectures into clean, clickable, and beautifully formatted notes — all powered by AI.
        </p>

        <motion.div className="relative mt-0 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0 sm:flex-row">
          <LayoutTextFlip
            text="Explore the Power of "
            words={["PaperTube", "AI Notes", "Smart Learning", "Instant PDFs"]}
          />
        </motion.div>

        <p className="mt-4 text-center text-base text-neutral-400 max-w-2xl mx-auto">
          Discover how PaperTube turns your YouTube lectures into clean, clickable, and beautifully formatted notes — all powered by AI.
        </p>
      </div>

      <FeatureMain/>

      {/* YouTube Video Section */}
      <div className="w-full py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-bold text-white mb-6"
            >
              See PaperTube in Action
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-neutral-400 max-w-2xl mx-auto"
            >
              Watch how easily you can transform any YouTube lecture into beautiful, 
              organized notes with just a few clicks.
            </motion.p>
          </div>

          {/* Video Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="glass-card rounded-3xl p-6 md:p-8 border border-white/5 backdrop-blur-2xl shadow-2xl"
          >
            {/* Responsive Video Wrapper */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 Aspect Ratio */}
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-xl"
                src="https://www.youtube.com/embed/nWF9zfVkFx4?si=ikPblYr2Cs9iSKac"
                title="PaperTube Demo - Transform YouTube Videos into Beautiful Notes"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>

            {/* Video Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 text-center"
            >
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
                How PaperTube Works
              </h3>
              <p className="text-neutral-400 text-base md:text-lg max-w-3xl mx-auto">
                In this demo, you'll see the complete process from pasting a YouTube link 
                to receiving a beautifully formatted PDF with timestamps, key highlights, 
                and AI-powered summaries.
              </p>
            </motion.div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center mt-12"
          >
            <p className="text-neutral-300 text-lg mb-6">
              Ready to transform your learning experience?
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/"
              className="bg-[#da3023] text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Try PaperTube Now
            </motion.a>
          </motion.div>
        </div>
      </div>

      <Footer/>

      <style jsx>{`
        .glass-card {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.05) 0%,
            rgba(255, 255, 255, 0.02) 100%);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .glass-card:hover {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.07) 0%,
            rgba(255, 255, 255, 0.03) 100%);
          border-color: rgba(255, 255, 255, 0.12);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}

export default Page;