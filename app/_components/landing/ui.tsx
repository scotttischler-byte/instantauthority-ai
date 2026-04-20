"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export function ScoreBar({
  label,
  score,
  color = "bg-cyan",
}: {
  label: string;
  score: number;
  color?: string;
}) {
  return (
    <div className="rounded-lg bg-white p-2">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{score}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(score, 100))}%` }} />
      </div>
    </div>
  );
}

export function ModalShell({
  open,
  title,
  onClose,
  children,
  maxWidth = "max-w-4xl",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={`w-full ${maxWidth} rounded-2xl border border-electric/20 bg-white shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-electric/10 px-5 py-4">
              <h3 className="flex items-center gap-2 font-display text-2xl text-charcoal">
                <Sparkles className="h-5 w-5 text-cyan" />
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-surface hover:text-charcoal"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
