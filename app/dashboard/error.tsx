'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-electric/20 bg-white p-6 text-center">
      <h2 className="font-display text-2xl text-charcoal">Dashboard error</h2>
      <p className="mt-2 text-sm text-slate-600">
        {error.message || "A dashboard module failed to load."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-charcoal"
      >
        Retry
      </button>
    </div>
  );
}
