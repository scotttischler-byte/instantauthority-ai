"use client";

import { addDays, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { useMemo, useState } from "react";

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [headline, setHeadline] = useState("");
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    const rows: Date[] = [];
    let current = start;
    while (current <= end) {
      rows.push(current);
      current = addDays(current, 1);
    }
    return rows;
  }, [month]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="rounded-xl border border-electric/10 bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-2xl">{format(month, "MMMM yyyy")}</h2>
          <div className="flex gap-2"><button className="rounded border border-electric/20 px-3 py-1 text-sm" onClick={() => setMonth(addDays(month, -30))}>Prev</button><button className="rounded border border-electric/20 px-3 py-1 text-sm" onClick={() => setMonth(addDays(month, 30))}>Next</button></div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <button key={day.toISOString()} className="min-h-24 rounded border border-electric/10 p-2 text-left" onClick={() => setSelectedDate(day)}>
              <p className="text-xs text-slate-500">{format(day, "d")}</p>
            </button>
          ))}
        </div>
      </div>
      <aside className="rounded-xl border border-electric/10 bg-white p-4">
        <h3 className="font-display text-xl">This Week</h3>
        <p className="mt-2 text-sm text-slate-600">Releases scheduled: 0</p>
        <p className="text-sm text-slate-600">Releases submitted: 0</p>
        <p className="text-sm text-slate-600">Clients covered: 0</p>
      </aside>
      {selectedDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5">
            <h3 className="font-display text-xl">Schedule Release for {format(selectedDate, "PPP")}</h3>
            <input className="mt-3 w-full rounded border border-electric/20 px-3 py-2 text-sm" placeholder="Headline (optional)" value={headline} onChange={(e) => setHeadline(e.target.value)} />
            <div className="mt-3 flex gap-2">
              <button className="rounded bg-cyan px-3 py-2 text-sm font-semibold text-charcoal" onClick={() => setSelectedDate(null)}>Save</button>
              <button className="rounded border border-electric/20 px-3 py-2 text-sm" onClick={() => setSelectedDate(null)}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
