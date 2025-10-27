// components/HomeFeedback.tsx
"use client";
import { useScroll, useTransform } from "motion/react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { GoogleGeminiEffect } from "./ui/google-gemini-effect";
import { FeedbackDialog } from "./FeedbackDialog";

interface FeedbackData {
  quote: string;
  name: string;
  profileName: string;
  profilePicture?: string;
  location?: string;
  time?: string;
}

function HomeFeedback() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  const handleFeedbackSuccess = (feedback: FeedbackData) => {
    console.log("Feedback submitted:", feedback);
    // You can handle the feedback data here (send to API, etc.)
  };

  return (
<div className="relative w-full min-h-[40vh] xs:min-h-[50vh] sm:min-h-[60vh] md:min-h-[75vh] lg:min-h-screen overflow-hidden">      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center text-center px-4 py-16 md:py-24"
        ref={ref}
      >
        <GoogleGeminiEffect
          pathLengths={[
            pathLengthFirst,
            pathLengthSecond,
            pathLengthThird,
            pathLengthFourth,
            pathLengthFifth,
          ]}
          title="Loved turning videos into notes?"
          description="We'd love to hear your thoughts! Share what you liked, what could be better, or just drop a hello 💬"
          buttonText="Give Feedback"
          onButtonClick={() => setIsFeedbackDialogOpen(true)}
        />
      </motion.div>

      <FeedbackDialog
        isOpen={isFeedbackDialogOpen}
        onClose={() => setIsFeedbackDialogOpen(false)}
        onSuccess={handleFeedbackSuccess}
      />
    </div>
  );
}

export default HomeFeedback;