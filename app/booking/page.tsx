"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUser } from "@/lib/auth";
import { studentApi } from "@/lib/student-api";
import type { Gear, Slot, Sport } from "@/types";
import SportSelector from "@/components/booking/SportSelector";
import SlotSelector from "@/components/booking/SlotSelector";
import ResourceSelector from "@/components/booking/ResourceSelector";
import GearSelector from "@/components/booking/GearSelector";
import BookingSummary from "@/components/booking/BookingSummary";
import BookingConfirmationModal from "@/components/booking/BookingConfirmationModal";
import BookingSuccess, { type BookingSuccessInfo } from "@/components/booking/BookingSuccess";
import type { BookingResource } from "@/components/booking/ResourceCard";
import { formatTime, isSlotBookable } from "@/components/booking/utils";

const SLOT_REFRESH_MS = 30000;

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function BookingPage() {
  const reduce = useReducedMotion();
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [sports, setSports] = useState<Sport[]>([]);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [sportsError, setSportsError] = useState("");

  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [detail, setDetail] = useState<Sport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [selectedResource, setSelectedResource] = useState<BookingResource | null>(null);
  const [selectedGear, setSelectedGear] = useState<Record<number, number>>({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [success, setSuccess] = useState<BookingSuccessInfo | null>(null);

  useEffect(() => {
    const user = getUser();
    setUserId(user?.id ?? null);
    setAuthChecked(true);
  }, []);

  const loadSports = useCallback(async () => {
    try {
      setSportsLoading(true);
      setSportsError("");
      const data = await studentApi.getSports();
      setSports(Array.isArray(data) ? data : []);
    } catch (error) {
      setSportsError(errorMessage(error, "Unable to load sports right now."));
    } finally {
      setSportsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSports();
  }, [loadSports]);

  const loadDetail = useCallback(async (sportId: number) => {
    try {
      setDetailLoading(true);
      const data = await studentApi.getSport(sportId);
      setDetail(data);
    } catch (error) {
      setBookingError(errorMessage(error, "Unable to load this sport's details."));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const loadSlots = useCallback(async (sportId: number) => {
    try {
      setSlotsLoading(true);
      setSlotsError("");
      const data = await studentApi.getAvailableSlots(sportId);
      setSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      setSlotsError(errorMessage(error, "Unable to load slots right now."));
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const handleSelectSport = (sport: Sport) => {
    setSelectedSport(sport);
    setDetail(null);
    setSlots([]);
    setSlotsError("");
    setSelectedSlot(null);
    setSelectedResource(null);
    setSelectedGear({});
    setBookingError("");
    loadDetail(sport.id);
    if (sport.hasSlotSystem) loadSlots(sport.id);
  };

  useEffect(() => {
    if (!selectedSport?.hasSlotSystem) return;
    const id = window.setInterval(() => loadSlots(selectedSport.id), SLOT_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [selectedSport, loadSlots]);

  const resources: BookingResource[] = useMemo(() => {
    if (!detail) return [];
    if (detail.resources && detail.resources.length > 0) {
      return detail.resources.map((resource) => ({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        status: resource.status,
      }));
    }
    const total = Math.max(0, Number(detail.totalCourts || 0));
    const available = Math.max(0, Math.min(Number(detail.availableCourts || 0), total));
    const type = detail.resourceType || "Court";
    return Array.from({ length: total }, (_, index) => ({
      id: -(index + 1),
      name: `${type} ${index + 1}`,
      type,
      status: index < available ? "available" : "booked",
    }));
  }, [detail]);

  const gears: Gear[] = useMemo(() => detail?.gears ?? [], [detail]);
  const needsResource = resources.length > 0;
  const needsSlot = Boolean(selectedSport?.hasSlotSystem);

  const gearLines = gears
    .filter((gear) => (selectedGear[gear.id] ?? 0) > 0)
    .map((gear) => ({ gearId: gear.id, quantity: selectedGear[gear.id] ?? 0 }));

  const slotOk = !needsSlot || Boolean(selectedSlot && isSlotBookable(selectedSlot));
  const resourceOk = !needsResource || Boolean(selectedResource && selectedResource.status.toLowerCase() === "available");
  const hasSelection = needsSlot ? Boolean(selectedSlot) : gearLines.length > 0 || Boolean(selectedResource);
  const notMaintenance = !selectedSport?.maintenance;
  const canContinue = Boolean(selectedSport) && notMaintenance && slotOk && resourceOk && hasSelection && !submitting;

  const hint = !selectedSport
    ? "Choose a sport to begin."
    : !notMaintenance
      ? "This sport is under maintenance."
      : needsSlot && !selectedSlot
        ? "Pick an available time."
        : needsResource && !selectedResource
          ? "Choose a resource."
          : !hasSelection
            ? "Select a time, resource or equipment."
            : "";

  const handleGearChange = (gearId: number, next: number) => {
    const gear = gears.find((item) => item.id === gearId);
    const max = Math.max(0, gear?.availableQuantity ?? 0);
    setSelectedGear((previous) => ({ ...previous, [gearId]: Math.min(max, Math.max(0, next)) }));
  };

  const handleConfirm = async () => {
    if (!selectedSport || submitting) return;
    if (!userId) {
      setBookingError("Please sign in to continue.");
      return;
    }

    setSubmitting(true);
    setBookingError("");

    const resourcesBooked = selectedResource
      ? [{ resourceId: selectedResource.id, name: selectedResource.name, type: selectedResource.type }]
      : [];
    const gearsBooked = gearLines.map((line) => ({ gearId: line.gearId, quantity: line.quantity }));

    try {
      if (needsSlot && selectedSlot) {
        await studentApi.bookSlot({
          userId,
          sportId: selectedSport.id,
          slotId: selectedSlot.id,
          gearsBooked,
          resourcesBooked,
          notes: "",
        });
      } else {
        await studentApi.bookGear({
          userId,
          sportId: selectedSport.id,
          gearsBooked,
          resourcesBooked,
          notes: "",
        });
      }

      setConfirmOpen(false);
      setSuccess({
        sport: selectedSport.name,
        time: selectedSlot ? `${formatTime(selectedSlot.startTime)} — ${formatTime(selectedSlot.endTime)}` : "Equipment request",
        resource: selectedResource?.name ?? "Not applicable",
      });
    } catch (error) {
      setBookingError(errorMessage(error, "Booking failed. Please try again."));
      if (selectedSport.hasSlotSystem) loadSlots(selectedSport.id);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForAnother = () => {
    setSuccess(null);
    setSelectedSlot(null);
    setSelectedResource(null);
    setSelectedGear({});
    setBookingError("");
    if (selectedSport?.hasSlotSystem) loadSlots(selectedSport.id);
  };

  if (!authChecked) {
    return (
      <DashboardLayout title="Book a session">
        <div className="h-64 animate-pulse rounded-[1.5rem] bg-zinc-900/40" aria-busy="true" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Book a session">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto w-full max-w-6xl space-y-8 pb-32 lg:pb-12"
      >
        <header className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">Sports booking</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Book your next session</h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Choose a sport, select an available time, add equipment if needed, and confirm your booking.
              </p>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.06] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-300">
              <span className="relative flex h-2 w-2">
                {!reduce && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/60" />}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              Live availability
            </span>
          </div>
        </header>

        {!userId ? (
          <div role="alert" className="rounded-[1.5rem] border border-amber-400/25 bg-amber-400/[0.05] p-6 text-center">
            <p className="text-base font-bold text-amber-200">Please sign in to continue.</p>
            <Link
              href="/login"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-cyan-400 px-5 text-sm font-black text-[#05070A] outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Go to sign in
            </Link>
          </div>
        ) : success ? (
          <BookingSuccess info={success} onBookAnother={resetForAnother} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="min-w-0 space-y-8">
              {sportsError && (
                <p role="alert" className="rounded-xl border border-red-500/25 bg-red-500/[0.05] px-4 py-3 text-sm text-red-200">
                  {sportsError}
                </p>
              )}

              <SportSelector
                sports={sports}
                loading={sportsLoading}
                selectedId={selectedSport?.id ?? null}
                onSelect={handleSelectSport}
              />

              <AnimatePresence initial={false}>
                {selectedSport && (
                  <motion.div
                    key={selectedSport.id}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    {selectedSport.hasSlotSystem && (
                      <SlotSelector
                        slots={slots}
                        loading={slotsLoading}
                        error={slotsError}
                        selectedSlotId={selectedSlot?.id ?? null}
                        onSelect={setSelectedSlot}
                        onRetry={() => loadSlots(selectedSport.id)}
                      />
                    )}

                    {(needsResource || detailLoading) && (
                      <ResourceSelector
                        resources={resources}
                        loading={detailLoading}
                        selectedId={selectedResource?.id ?? null}
                        onSelect={setSelectedResource}
                      />
                    )}

                    <GearSelector
                      gears={gears}
                      loading={detailLoading}
                      selectedGear={selectedGear}
                      onChange={handleGearChange}
                    />

                    {bookingError && (
                      <p role="alert" className="rounded-xl border border-red-500/25 bg-red-500/[0.05] px-4 py-3 text-sm text-red-200">
                        {bookingError}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden lg:block">
              <BookingSummary
                sport={selectedSport}
                slot={selectedSlot}
                resource={selectedResource}
                gears={gears}
                selectedGear={selectedGear}
                canContinue={canContinue}
                hint={hint}
                onContinue={() => setConfirmOpen(true)}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Mobile: sticky bottom summary/action bar */}
      {userId && !success && selectedSport && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-400/20 bg-[#05070A]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{selectedSport.name}</p>
              <p className="truncate text-[11px] text-zinc-500" aria-live="polite">
                {canContinue ? "Ready to confirm." : hint}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={!canContinue}
              className="min-h-[48px] shrink-0 rounded-xl bg-cyan-400 px-5 text-sm font-black text-[#05070A] outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {selectedSport && (
        <BookingConfirmationModal
          open={confirmOpen}
          sport={selectedSport}
          slot={selectedSlot}
          resource={selectedResource}
          gears={gears}
          selectedGear={selectedGear}
          submitting={submitting}
          error={bookingError}
          onConfirm={handleConfirm}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
