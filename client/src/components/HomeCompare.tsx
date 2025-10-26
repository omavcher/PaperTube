import React from "react";
import { Compare } from "@/components/ui/compare";

export function HomeCompare() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 mt-5 border rounded-3xl dark:bg-neutral-900 bg-neutral-100 border-neutral-200 dark:border-neutral-800">
      <Compare
        firstImage="/pdf_home_img/pdf_other.png"
        secondImage="/pdf_home_img/pdf_us.png"
        firstImageClassName="object-cover object-left-top"
        secondImageClassname="object-cover object-left-top"
        className="aspect-[3/4] w-full max-w-[280px] mx-auto 
                   sm:max-w-[320px] 
                   md:max-w-[400px] 
                   lg:max-w-[450px] 
                   xl:max-w-[500px]"
        slideMode="hover"
      />
    </div>
  );
}