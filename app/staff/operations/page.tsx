"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  History,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { authFetch, getAuthToken, getUser } from "@/lib/auth";

const API = "http://localhost:5000";

type Tab = "history" | "issued" | "slots" | "resources";

type SportOption = {
  id: number;
  name: string;
  hasSlotSystem?: boolean;
  gears?: { id: number; name: string; availableQuantity: number }[];
  resourceUnits?: { id: number; name: string; status: string }[];
};

type Student = { id: number; name: string; email: string; rollNo: string | null };

type HistoryRow = {
  id: number;
  status: string;
  bookingType: string;
  bookedAt: string;
  startTime: string | null;
  endTime: string | null;
  user?: { name: string; rollNo: string | null; email: string } | null;
  sport?: { name: string } | null;
};

type IssuedRow = {
  id: number;
  quantityIssued: number;
  issueDate: string;
  expectedReturnDate: string | null;
  returnDate: string | null;
  status: string;
  condition: string | null;
  issueNotes: string | null;
  user?: { name: string; rollNo: string | null } | null;
  gear?: { name: string } | null;
};

type ResourceRow = {
  id: number;
  name: string;
  type: string;
  status: string;
  maintenanceMessage: string | null;
};

type Notice = { tone: "success" | "error"; text: string };

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "history", label: "Booking history", icon: <History size={15} /> },
  { key: "issued", label: "Issued gear", icon: <Package size={15} /> },
  { key: "slots", label: "Slot generation", icon: <CalendarPlus size={15} /> },
  { key: "resources", label: "Resources", icon: <MapPin size={15} /> },
];

const inputClass =
  "w-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/50";

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function StaffOperationsPage() {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<Tab>("history");
  const [sports, setSports] = useState<SportOption[]>([]);
  const [role, setRole] = useState<string>("");
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    setRole(getUser()?.role?.toLowerCase() ?? "");
    setSignedIn(!!getAuthToken());
    authFetch(`${API}/sports`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSports(Array.isArray(data) ? data : []))
      .catch(() => setSports([]));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const [signedIn, setSignedIn] = useState(false);

  return (
    <main className="min-h-screen bg-[#050607] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <Link href="/staff" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 transition hover:text-emerald-300">
            <ArrowLeft size={13} /> Staff dashboard
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Operations</h1>
            <p className="mt-2 text-sm text-zinc-500">Booking history, issued equipment, slot generation and resource availability.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {TABS.map((item) => {
              const active = tab === item.key;
              return (
                <motion.button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                    active
                      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200 shadow-[0_0_30px_rgba(52,211,153,0.12)]"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        </motion.header>

        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.text}
              role="status"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-start gap-3 rounded-2xl border px-5 py-3 text-sm ${
                notice.tone === "success"
                  ? "border-emerald-400/25 bg-emerald-950/40 text-emerald-200"
                  : "border-red-400/25 bg-red-950/40 text-red-200"
              }`}
            >
              {notice.tone === "success" ? <CheckCircle2 size={17} className="mt-0.5" /> : <XCircle size={17} className="mt-0.5" />}
              {notice.text}
            </motion.div>
          )}
        </AnimatePresence>

        {!signedIn && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
            Not signed in on this browser. Sign in as staff or admin to use Operations.
          </div>
        )}

        {signedIn && (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "history" && <HistoryPanel sports={sports} onNotice={setNotice} />}
              {tab === "issued" && <IssuedPanel sports={sports} onNotice={setNotice} />}
              {tab === "slots" && <SlotPanel sports={sports} onNotice={setNotice} />}
              {tab === "resources" && <ResourcePanel sports={sports} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function HistoryPanel({ sports, onNotice }: { sports: SportOption[]; onNotice: (n: Notice) => void }) {
  const [sportId, setSportId] = useState("");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sportId) params.set("sportId", sportId);
      if (status) params.set("status", status);
      const res = await authFetch(`${API}/bookings/history?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not load booking history.");
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not load booking history." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [sportId, status]);

  return (
    <Panel title="Booking history" subtitle="Every booking, newest first. Filter by sport or status.">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <select className={inputClass} value={sportId} onChange={(e) => setSportId(e.target.value)}>
          <option value="">All sports</option>
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>{sport.name}</option>
          ))}
        </select>
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="return_requested">Return requested</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-emerald-400/40 hover:text-emerald-300">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading && rows.length === 0 && <p className="text-sm text-zinc-500">Loading…</p>}
      {!loading && rows.length === 0 && <p className="text-sm text-zinc-600">No bookings match these filters.</p>}

      <div className="space-y-3">
        {rows.map((row) => (
          <motion.div key={row.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid gap-2 rounded-2xl border border-zinc-800 bg-black/40 p-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center">
            <div>
              <p className="font-semibold text-white">{row.user?.name ?? "Student"}</p>
              <p className="text-xs text-zinc-500">{row.user?.rollNo || row.user?.email || "—"}</p>
            </div>
            <div className="text-sm text-zinc-300">{row.sport?.name ?? "Sport"} · {row.bookingType === "gear" ? "Gear only" : "Slot"}</div>
            <div className="text-sm text-zinc-400">
              {row.startTime ? `${formatDateTime(row.startTime)} – ${formatDateTime(row.endTime)}` : `Booked ${formatDateTime(row.bookedAt)}`}
            </div>
            <span className="justify-self-start rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 md:justify-self-end">{row.status.replace("_", " ")}</span>
          </motion.div>
        ))}
      </div>
    </Panel>
  );
}

function IssuedPanel({ sports, onNotice }: { sports: SportOption[]; onNotice: (n: Notice) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [gearId, setGearId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [issued, setIssued] = useState<IssuedRow[]>([]);
  const [returningId, setReturningId] = useState<number | null>(null);
  const [condition, setCondition] = useState<Record<number, string>>({});

  const gearOptions = useMemo(
    () =>
      sports.flatMap((sport) =>
        (sport.gears ?? []).map((gear) => ({ id: gear.id, label: `${gear.name} (${sport.name}) · ${gear.availableQuantity} free` }))
      ),
    [sports]
  );

  const loadIssued = async () => {
    try {
      const res = await authFetch(`${API}/issued-gears?status=issued`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not load issued gear.");
      setIssued(Array.isArray(data) ? data : []);
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not load issued gear." });
    }
  };

  useEffect(() => {
    loadIssued();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const res = await authFetch(`${API}/students/search?q=${encodeURIComponent(query.trim())}`, { cache: "no-store" });
        const data = await res.json();
        setResults(res.ok && Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const issue = async () => {
    if (!student) return onNotice({ tone: "error", text: "Choose a student first." });
    if (!gearId) return onNotice({ tone: "error", text: "Choose the equipment to issue." });
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) return onNotice({ tone: "error", text: "Quantity must be a whole number of 1 or more." });

    setSubmitting(true);
    try {
      const res = await authFetch(`${API}/issued-gears`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: student.id,
          gearId: Number(gearId),
          quantityIssued: qty,
          expectedReturnDate: dueDate || undefined,
          issueNotes: notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not issue the equipment.");
      onNotice({ tone: "success", text: `Issued ${qty} item(s) to ${student.name}.` });
      setGearId("");
      setQuantity("1");
      setDueDate("");
      setNotes("");
      await loadIssued();
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not issue the equipment." });
    } finally {
      setSubmitting(false);
    }
  };

  const markReturned = async (id: number) => {
    setReturningId(id);
    try {
      const res = await authFetch(`${API}/issued-gears/${id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition: condition[id] ?? "good" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not mark as returned.");
      onNotice({ tone: "success", text: data.message || "Gear returned." });
      await loadIssued();
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not mark as returned." });
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Panel title="Issue equipment" subtitle="Find the student, choose the equipment and quantity, then issue.">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input className={`${inputClass} pl-11`} placeholder="Student name, email or college ID" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {results.length > 0 && !student && (
          <div className="space-y-2">
            {results.map((s) => (
              <button key={s.id} type="button" onClick={() => { setStudent(s); setResults([]); setQuery(""); }} className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-left text-sm transition hover:border-emerald-400/40">
                <span className="font-semibold text-white">{s.name}</span>
                <span className="text-xs text-zinc-500">{s.rollNo || s.email}</span>
              </button>
            ))}
          </div>
        )}
        {student && (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-400/25 bg-emerald-400/5 px-4 py-3 text-sm">
            <span className="text-emerald-200">Student: <strong>{student.name}</strong> · {student.rollNo || student.email}</span>
            <button type="button" onClick={() => setStudent(null)} className="text-xs text-zinc-400 hover:text-white">Change</button>
          </div>
        )}
        <select className={inputClass} value={gearId} onChange={(e) => setGearId(e.target.value)}>
          <option value="">Choose equipment</option>
          {gearOptions.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <input type="number" min={1} className={inputClass} placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <input type="date" className={inputClass} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <textarea className={`${inputClass} min-h-20`} placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <motion.button type="button" onClick={issue} disabled={submitting} whileTap={{ scale: 0.97 }} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-3 text-sm font-bold text-black disabled:opacity-60">
          {submitting && <Loader2 size={15} className="animate-spin" />} Issue equipment
        </motion.button>
      </Panel>

      <Panel title="Currently issued" subtitle="Equipment that has not come back yet. Mark it returned as good or damaged.">
        {issued.length === 0 && <p className="text-sm text-zinc-600">Nothing is issued right now.</p>}
        <div className="space-y-3">
          {issued.map((row) => (
            <motion.div key={row.id} layout className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{row.gear?.name ?? "Equipment"} × {row.quantityIssued}</p>
                  <p className="text-xs text-zinc-500">{row.user?.name ?? "Student"} · {row.user?.rollNo || "no college ID"}</p>
                  <p className="mt-1 text-xs text-zinc-500">Issued {formatDateTime(row.issueDate)}{row.expectedReturnDate ? ` · due ${formatDateTime(row.expectedReturnDate)}` : ""}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select className="rounded-xl border border-zinc-800 bg-black/40 px-3 py-2 text-xs text-zinc-300" value={condition[row.id] ?? "good"} onChange={(e) => setCondition((c) => ({ ...c, [row.id]: e.target.value }))}>
                  <option value="good">Good</option>
                  <option value="damaged">Damaged</option>
                </select>
                <button type="button" onClick={() => markReturned(row.id)} disabled={returningId === row.id} className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-50">
                  {returningId === row.id && <Loader2 size={12} className="animate-spin" />} Mark returned
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        <button type="button" onClick={loadIssued} className="inline-flex items-center gap-2 text-xs text-zinc-500 transition hover:text-emerald-300">
          <RefreshCw size={12} /> Refresh list
        </button>
      </Panel>
    </div>
  );
}

function SlotPanel({ sports, onNotice }: { sports: SportOption[]; onNotice: (n: Notice) => void }) {
  const [sportId, setSportId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");
  const slotSports = sports.filter((sport) => sport.hasSlotSystem);

  const generate = async () => {
    setResult("");
    if (!sportId || !start || !end) return onNotice({ tone: "error", text: "Choose a sport and both dates." });
    setSubmitting(true);
    try {
      const res = await authFetch(`${API}/slots/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sportId: Number(sportId), startDate: new Date(start).toISOString(), endDate: new Date(end).toISOString() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not generate slots.");
      const text = data.message || "Slots generated.";
      setResult(text);
      onNotice({ tone: "success", text });
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not generate slots." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Panel title="Slot generation" subtitle="Create bookable time slots for a sport with a slot system, between two dates.">
      {slotSports.length === 0 && <p className="text-sm text-zinc-600">No sport has the slot system turned on.</p>}
      <select className={inputClass} value={sportId} onChange={(e) => setSportId(e.target.value)}>
        <option value="">Choose a sport</option>
        {slotSports.map((sport) => (
          <option key={sport.id} value={sport.id}>{sport.name}</option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1"><span className="text-xs text-zinc-500">From</span><input type="datetime-local" className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label className="space-y-1"><span className="text-xs text-zinc-500">To</span><input type="datetime-local" className={inputClass} value={end} onChange={(e) => setEnd(e.target.value)} /></label>
      </div>
      <motion.button type="button" onClick={generate} disabled={submitting} whileTap={{ scale: 0.97 }} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-3 text-sm font-bold text-black disabled:opacity-60">
        {submitting && <Loader2 size={15} className="animate-spin" />} Generate slots
      </motion.button>
      {result && <p className="text-sm text-emerald-300">{result}</p>}
    </Panel>
  );
}

function ResourcePanel({ sports }: { sports: SportOption[] }) {
  const [sportId, setSportId] = useState("");
  const [units, setUnits] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sportId) {
      setUnits([]);
      return;
    }
    setLoading(true);
    authFetch(`${API}/resources?sportId=${sportId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setUnits(Array.isArray(data) ? data : []))
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  }, [sportId]);

  const counts = useMemo(() => {
    const available = units.filter((u) => u.status === "available").length;
    return { total: units.length, available, other: units.length - available };
  }, [units]);

  return (
    <Panel title="Resources" subtitle="Courts and resource units for a sport, with their current status.">
      <select className={inputClass} value={sportId} onChange={(e) => setSportId(e.target.value)}>
        <option value="">Choose a sport</option>
        {sports.map((sport) => (
          <option key={sport.id} value={sport.id}>{sport.name}</option>
        ))}
      </select>

      {sportId && (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Total" value={counts.total} />
          <Stat label="Available" value={counts.available} tone="emerald" />
          <Stat label="Not available" value={counts.other} tone="amber" />
        </div>
      )}

      {loading && <p className="text-sm text-zinc-500">Loading…</p>}
      {!loading && sportId && units.length === 0 && <p className="text-sm text-zinc-600">This sport has no resource units yet.</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {units.map((unit) => (
          <div key={unit.id} className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">{unit.name}</p>
              <span className={`rounded-full px-3 py-1 text-xs ${unit.status === "available" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>{unit.status}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">{unit.type}{unit.maintenanceMessage ? ` · ${unit.maintenanceMessage}` : ""}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "amber" }) {
  const color = tone === "emerald" ? "text-emerald-300" : tone === "amber" ? "text-amber-300" : "text-white";
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}

