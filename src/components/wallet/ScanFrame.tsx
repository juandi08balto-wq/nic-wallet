"use client";

import { motion } from "framer-motion";

// Visual-only QR scan frame: dimmed surroundings, square cutout with
// gold corners, and an animated gold scanning line. Pure CSS — does NOT
// actually decode anything; scanning is simulated by tapping a merchant
// tile below.
export function ScanFrame() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative h-56 w-56">
        <span className="absolute left-0 top-0 h-9 w-9 rounded-tl-2xl border-l-[3px] border-t-[3px] border-gold" />
        <span className="absolute right-0 top-0 h-9 w-9 rounded-tr-2xl border-r-[3px] border-t-[3px] border-gold" />
        <span className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-2xl border-b-[3px] border-l-[3px] border-gold" />
        <span className="absolute bottom-0 right-0 h-9 w-9 rounded-br-2xl border-b-[3px] border-r-[3px] border-gold" />

        <motion.div
          initial={{ top: "8%" }}
          animate={{ top: ["8%", "92%", "8%"] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-x-3 h-[2px] rounded-full bg-gold/85 shadow-[0_0_10px_2px_rgba(212,165,116,0.7)]"
        />
      </div>
    </div>
  );
}
