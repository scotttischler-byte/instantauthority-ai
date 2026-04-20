'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-surface p-6">
        <div className="w-full max-w-xl rounded-xl border border-electric/20 bg-white p-6 text-center shadow-sm">
          <h2 className="font-display text-2xl text-charcoal">Critical application error</h2>
          <p className="mt-2 text-sm text-slate-600">
            {error.message || "The application hit an unrecoverable error."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-charcoal"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
