'use client';

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.9 }}
          className="h-16 rounded-2xl bg-white shadow-sm"
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.25 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8, delay: i * 0.08 }}
              className="h-72 rounded-2xl bg-white shadow-sm"
            />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.75, delay: i * 0.05 }}
              className="h-40 rounded-xl bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
