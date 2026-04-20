'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-xl rounded-xl border border-electric/20 bg-white p-6 text-center shadow-sm">
        <h2 className="font-display text-2xl text-charcoal">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-600">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-charcoal"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
