"use client";
import { motion, useScroll, useTransform } from "motion/react";

export function ParallaxBanner({ bannerUrl, name }: { bannerUrl?: string | null, name: string }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  if (!bannerUrl) {
    return (
      <div className="py-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[24px] shadow-[0_10px_25px_-5px_rgba(99,102,241,0.3)] text-white">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{name}</h1>
      </div>
    );
  }

  return (
    <div className="w-full h-48 sm:h-64 relative rounded-[24px] overflow-hidden shadow-[0_10px_25px_-5px_rgba(99,102,241,0.3)]">
      <motion.img 
        src={bannerUrl} 
        alt={`${name} Banner`}
        className="object-cover w-full h-[150%] absolute top-[-25%]"
        style={{ y }}
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight relative z-10">{name}</h1>
      </div>
    </div>
  );
}
