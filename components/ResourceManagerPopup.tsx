"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BuildingOffice2Icon,
  CubeIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { authFetch } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type SportOverview = {
  sport: {
    name: string; resourceType: string; hasSlotSystem: boolean; slotDurationMinutes: number;
    slotCapacity: number; hasTeamSlots: boolean; hasDynamicBooking: boolean;
    underMaintenance: boolean; maintenanceMessage: string | null;
  };
  resources: { total: number; available: number; maintenance: number; underMaintenance: { id: number; name: string; message: string | null }[] };
  gears: {
    types: number; totalQuantity: number; availableQuantity: number; damagedQuantity: number; issuedQuantity: number;
    lowStock: { id: number; name: string; available: number; total: number }[];
  };
  bookings: { total: number; active: number; today: number; pendingReturns: number; uniqueStudents: number };
  slots: { upcoming: number; upcomingBooked: number };
  upcomingReservations: { id: number; teamName: string; purpose: string | null; startDateTime: string; endDateTime: string }[];
  maintenanceWindows: { id: number; scope: string; startAt: string; endAt: string; message: string | null; resourceName: string | null }[];
};

const formatOverviewDate = (value: string) =>
  new Date(value).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

interface Props {
  sport: any;
  sports: any[];
  setSports: React.Dispatch<React.SetStateAction<any[]>>;
  updateSport: (sport: any) => Promise<{ ok: boolean; sport?: any; message?: string } | void>;
  onClose: () => void;
}

export default function ResourceManagerPopup({
  sport,
  sports,
  setSports,
  updateSport,
  onClose,
}: Props) {
  const cards = ["resources", "gears", "overview"] as const;

type CardType = typeof cards[number];

const [rotation, setRotation] = useState(0);

const [dragging, setDragging] = useState(false);

const [startX, setStartX] = useState(0);

const velocityRef = useRef(0);

const animationRef = useRef<number | undefined>(undefined);

const [paused, setPaused] = useState(false);

const [selectedCard, setSelectedCard] = useState<number>(0);
const [targetRotation, setTargetRotation] = useState<number | null>(null);
const [editingCard, setEditingCard] = useState<number | null>(null);
const [showAddResourceModal, setShowAddResourceModal] = useState(false);
const [showTypeModal, setShowTypeModal] = useState(false);
const [showAddGearModal, setShowAddGearModal] = useState(false);

const [showOverviewModal, setShowOverviewModal] = useState(false);
const [overview, setOverview] = useState<SportOverview | null>(null);
const [overviewLoading, setOverviewLoading] = useState(true);
const [overviewError, setOverviewError] = useState("");
const [resourceName, setResourceName] = useState("");
const [resourceQuantity, setResourceQuantity] = useState(1);
const [autoGenerate, setAutoGenerate] = useState(true);
const [resourceType, setResourceType] = useState(sport.resourceType || "Court");
const [customizedResources, setCustomizedResources] = useState<number[]>([]);
const [resourceTypeDraft, setResourceTypeDraft] = useState(sport.resourceType || "Court");
const [resourceCountDraft, setResourceCountDraft] = useState(sport.resourceUnits?.length || 1);
const [previewResources, setPreviewResources] = useState<string[]>([]);
const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
const [editedResourceName, setEditedResourceName] = useState("");
const [customResourceType,setCustomResourceType]=useState("");
const [initialResourceType, setInitialResourceType] = useState(resourceType);
const [toast, setToast] = useState<{ type: "success" | "error"; message: string; actionLabel?: string; onAction?: () => void } | null>(null);
const [isLoading, setIsLoading] = useState(!sport);
const [draggedResourceIndex, setDraggedResourceIndex] = useState<number | null>(null);
const [pendingDelete, setPendingDelete] = useState<{ item: any; index: number } | null>(null);
const [gearName, setGearName] = useState("");
const [gearQuantity, setGearQuantity] = useState(1);
const [editingGearIndex, setEditingGearIndex] = useState<number | null>(null);
const [gears, setGears] = useState<any[]>(sport.gears || []);
const [viewItem, setViewItem] = useState<{
  title: string;
  content: string;
} | null>(null);
const radius = 400;
const toastTimerRef = useRef<number | undefined>(undefined);

const onMouseDown = (e:any) => {

    setPaused(false);

    setDragging(true);

    setStartX(e.clientX);

};

const onMouseMove=(e:any)=>{

    if(!dragging) return;

    const dx=e.clientX-startX;

    setRotation(prev=>prev+dx*0.55);

    velocityRef.current = dx * 0.55;

    setStartX(e.clientX);

};

const onMouseUp=()=>{

    setDragging(false);

};
useEffect(()=>{

    window.addEventListener("mousemove",onMouseMove);

    window.addEventListener("mouseup",onMouseUp);

    return ()=>{

        window.removeEventListener("mousemove",onMouseMove);

        window.removeEventListener("mouseup",onMouseUp);

    };

}, [dragging, startX]);
useEffect(() => {

    const animate = () => {

        setRotation(prev => {

            if (targetRotation !== null) {

                const diff = targetRotation - prev;

                if (Math.abs(diff) < 0.5) {

                    return targetRotation;

                }

                return prev + diff * 0.12;

            }

           if (!dragging) {

    // Rotate to selected card
    if (targetRotation !== null) {

        const diff = targetRotation - prev;

        if (Math.abs(diff) < 0.5) {

            velocityRef.current = 0;

            setPaused(true);

            setTargetRotation(null);

            return targetRotation;

        }

        return prev + diff * 0.12;

    }

    // Auto rotate
    if (!paused) {

        return prev + 0.50 + velocityRef.current;

    }

}

return prev;

            return prev;

        });

        if (!dragging && targetRotation === null) {

            velocityRef.current *= 0.99;

        }

        animationRef.current = requestAnimationFrame(animate);

    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {

        if (animationRef.current)
            cancelAnimationFrame(animationRef.current);

    };

}, [dragging, targetRotation]);
useEffect(() => {

    if (targetRotation === null) return;

    if (Math.abs(rotation - targetRotation) < 0.5) {

    setRotation(targetRotation);

    velocityRef.current = 0;

    setTargetRotation(null);

    setPaused(true);

}

}, [rotation, targetRotation]);
useEffect(() => {
  if (!sport) return;
  setResourceType(sport.resourceType || "Court");
  setResourceTypeDraft(sport.resourceType || "Court");
  setResourceCountDraft(Math.max(1, sport.resourceUnits?.length || 1));
  setGears(sport.gears || []);
  setIsLoading(false);
}, [sport]);

useEffect(() => {

    if (!autoGenerate) {

        setPreviewResources([]);

        return;

    }

    const generated = [];

    for (let i = 1; i <= resourceQuantity; i++) {

        generated.push(`${resourceType} ${i}`);

    }

    setPreviewResources(generated);

}, [resourceType, resourceQuantity, autoGenerate]);

const gearSignature = gears.map((gear: any) => `${gear.id}:${gear.totalQuantity}:${gear.damagedQuantity}`).join("|");
const resourceSignature = (sport.resourceUnits || []).map((unit: any) => `${unit.id}:${unit.status}`).join("|");

// Overview card: real, per-sport numbers from the backend. Reloads whenever resources or gears change.
useEffect(() => {
  if (!sport?.id) return;
  let cancelled = false;

  (async () => {
    try {
      const response = await authFetch(`${API_BASE}/sports/${sport.id}/overview`);
      const data = await response.json().catch(() => null);
      if (cancelled) return;
      if (!response.ok) {
        setOverviewError(data?.message || "Could not load the overview");
        return;
      }
      setOverview(data);
      setOverviewError("");
    } catch {
      if (!cancelled) setOverviewError("Could not reach the server");
    } finally {
      if (!cancelled) setOverviewLoading(false);
    }
  })();

  return () => {
    cancelled = true;
  };
}, [sport?.id, gearSignature, resourceSignature]);

useEffect(() => {
  return () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
  };
}, []);

    const resourceCount = sport.resourceUnits?.length || 0;

const maintenanceResources =
sport.resourceUnits?.filter((r:any)=>r.status==="maintenance") || [];

const showToast = (message: string, type: "success" | "error" = "success", actionLabel?: string, onAction?: () => void) => {
  if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
  setToast({ type, message, actionLabel, onAction });
  toastTimerRef.current = window.setTimeout(() => setToast(null), 2800);
};

const persistSport = async (updatedSport: any) => {
  setSports((prev) =>
    prev.map((item) => (item.id === sport.id ? updatedSport : item))
  );

  // VERY IMPORTANT
  sport.resourceUnits = updatedSport.resourceUnits;

  await updateSport(updatedSport);
};

const applyResourceUnits = (nextResourceUnits: any[]) => {
  sport.resourceUnits = nextResourceUnits;
  const updatedSport = { ...sport, resourceUnits: nextResourceUnits, resources: nextResourceUnits };
  setSports((prev) => prev.map((item) => (item.id === sport.id ? updatedSport : item)));
};

const handleAddResource = async () => {
  if (!resourceName.trim() && !autoGenerate) return;
  if (!sport?.id) return;

  const quantity = autoGenerate ? Math.max(1, resourceQuantity) : 1;

  try {
    const response = await authFetch(`http://localhost:5000/sports/${sport.id}/resource-units`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceType, quantity }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      showToast(data?.message || "Failed to add resource", "error");
      return;
    }

    let created: any[] = await response.json();

    // A single custom name overrides the auto-generated one.
    if (!autoGenerate && resourceName.trim() && created[0]) {
      const renamed = await authFetch(`http://localhost:5000/resource-units/${created[0].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: resourceName.trim() }),
      });
      if (renamed.ok) created = [await renamed.json()];
    }

    applyResourceUnits([...(sport.resourceUnits || []), ...created]);
    setShowAddResourceModal(false);
    setResourceName("");
    setResourceQuantity(1);
    showToast("Resource added successfully", "success");
  } catch (err) {
    console.error("ADD RESOURCE ERROR:", err);
    showToast("Could not reach the server", "error");
  }
};

const handleRenameResource = async (index: number) => {
  const trimmed = editedResourceName.trim();
  if (!trimmed) return;

  const target = (sport.resourceUnits || [])[index];
  if (!target) return;

  try {
    const response = await authFetch(`http://localhost:5000/resource-units/${target.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    if (!response.ok) {
      showToast("Failed to rename resource", "error");
      return;
    }

    const updated = await response.json();
    const updatedResources = [...(sport.resourceUnits || [])];
    updatedResources[index] = updated;
    applyResourceUnits(updatedResources);

    setEditingResourceIndex(null);
    setEditedResourceName("");
    showToast("Resource renamed", "success");
  } catch (err) {
    console.error("RENAME RESOURCE ERROR:", err);
    showToast("Could not reach the server", "error");
  }
};

const handleDeleteResource = async (index: number) => {
  const deletedItem = (sport.resourceUnits || [])[index];
  if (!deletedItem) return;

  try {
    const response = await authFetch(`http://localhost:5000/resource-units/${deletedItem.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      showToast("Failed to delete resource", "error");
      return;
    }

    const updatedResources = (sport.resourceUnits || []).filter((_: any, itemIndex: number) => itemIndex !== index);
    applyResourceUnits(updatedResources);

    setPendingDelete({ item: deletedItem, index });
    showToast("Resource deleted", "error", "Undo", () => handleUndoDelete());
  } catch (err) {
    console.error("DELETE RESOURCE ERROR:", err);
    showToast("Could not reach the server", "error");
  }
};

const handleUndoDelete = async () => {
  if (!pendingDelete) return;

  try {
    const response = await authFetch(`http://localhost:5000/sports/${sport.id}/resource-units`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceType: pendingDelete.item.type || resourceType, quantity: 1 }),
    });

    if (!response.ok) {
      showToast("Failed to undo deletion", "error");
      return;
    }

    let [recreated] = await response.json();
    const renamed = await authFetch(`http://localhost:5000/resource-units/${recreated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pendingDelete.item.name }),
    });
    if (renamed.ok) recreated = await renamed.json();

    // Note: the restored resource keeps its old name but gets a new id --
    // the database assigns a fresh one, it cannot reuse the deleted row's id.
    const restoredResources = [...(sport.resourceUnits || [])];
    restoredResources.splice(pendingDelete.index, 0, recreated);
    applyResourceUnits(restoredResources);

    setPendingDelete(null);
    showToast("Deletion undone", "success");
  } catch (err) {
    console.error("UNDO DELETE ERROR:", err);
    showToast("Could not reach the server", "error");
  }
};

const handleReorderResources = async (fromIndex: number, toIndex: number) => {
  const updatedResources = [...(sport.resourceUnits || [])];
  const [movedItem] = updatedResources.splice(fromIndex, 1);
  updatedResources.splice(toIndex, 0, movedItem);

  const updatedSport = {
    ...sport,
    resources: updatedResources,
    resourceUnits: updatedResources,
};

  await persistSport(updatedSport);
  setDraggedResourceIndex(null);
};

const handleChangeResourceType = async () => {
  const nextType = resourceTypeDraft === "CUSTOM"
    ? (customResourceType.trim() || resourceType)
    : (resourceTypeDraft.trim() || resourceType);
  const count = Math.max(1, resourceCountDraft || sport.resourceUnits?.length || 1);

  try {
    const result = await updateSport({ ...sport, resourceType: nextType, totalCourts: count });

    if (!result || result.ok === false) {
      showToast(result?.message || "Failed to update resource type", "error");
      return;
    }

    const updatedSport = result.sport ?? { ...sport, resourceType: nextType };
    sport.resourceUnits = updatedSport.resourceUnits ?? updatedSport.resources ?? sport.resourceUnits;
    setSports((prev) => prev.map((item) => (item.id === sport.id ? updatedSport : item)));
    setResourceType(nextType);
    setShowTypeModal(false);
    showToast("Resource type updated", "success");
  } catch (err) {
    console.error("CHANGE RESOURCE TYPE ERROR:", err);
    showToast("Could not reach the server", "error");
  }
};

const applyGears = (nextGears: any[]) => {
  setGears(nextGears);
  sport.gears = nextGears;
  setSports((prev) => prev.map((item) => (item.id === sport.id ? { ...item, gears: nextGears } : item)));
};

const handleAddGear = async () => {
  const trimmedName = gearName.trim();
  if (!trimmedName || gearQuantity < 0) return;
  if (!sport?.id) return;

  const wasEditing = editingGearIndex !== null;

  try {
    let updatedGear: any;
    let nextGears: any[];

    if (wasEditing) {
      const current = gears[editingGearIndex as number];
      if (!current) return;

      const response = await authFetch(`http://localhost:5000/gears/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          description: current.description,
          totalQuantity: gearQuantity,
          damagedQuantity: current.damagedQuantity || 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showToast(data?.message || "Failed to update gear", "error");
        return;
      }

      updatedGear = await response.json();
      nextGears = [...gears];
      nextGears[editingGearIndex as number] = updatedGear;
    } else {
      const response = await authFetch("http://localhost:5000/gears", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, sportId: sport.id, totalQuantity: gearQuantity }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showToast(data?.message || "Failed to add gear", "error");
        return;
      }

      updatedGear = await response.json();
      nextGears = [...gears, updatedGear];
    }

    applyGears(nextGears);
    setShowAddGearModal(false);
    setGearName("");
    setGearQuantity(1);
    setEditingGearIndex(null);
    showToast(wasEditing ? "Gear updated" : "Gear added", "success");
  } catch (err) {
    console.error("SAVE GEAR ERROR:", err);
    showToast("Could not reach the server", "error");
  }
};

const handleGearQuantity = async (index: number, delta: number) => {
  const currentGear = gears[index];
  if (!currentGear) return;

  const nextQuantity = Math.max(0, (currentGear.totalQuantity ?? 0) + delta);

  try {
    const response = await authFetch(`http://localhost:5000/gears/${currentGear.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: currentGear.name,
        description: currentGear.description,
        totalQuantity: nextQuantity,
        damagedQuantity: currentGear.damagedQuantity || 0,
      }),
    });

    if (!response.ok) {
      showToast("Failed to update gear quantity", "error");
      return;
    }

    const updated = await response.json();
    const nextGears = [...gears];
    nextGears[index] = updated;
    applyGears(nextGears);
  } catch (err) {
    console.error("GEAR QUANTITY ERROR:", err);
    showToast("Could not reach the server", "error");
  }
};

const handleDeleteGear = async (index: number) => {
  const target = gears[index];
  if (!target) return;

  try {
    const response = await authFetch(`http://localhost:5000/gears/${target.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      showToast("Failed to delete gear", "error");
      return;
    }

    const nextGears = gears.filter((_: any, itemIndex: number) => itemIndex !== index);
    applyGears(nextGears);
    showToast("Gear deleted", "error");
  } catch (err) {
    console.error("DELETE GEAR ERROR:", err);
    showToast("Could not reach the server", "error");
  }
};

const getCardTransform = (
    index:number,
    type:CardType
) => {

    const angle = rotation + index * 120;

    const rad = angle * Math.PI / 180;

    const x = Math.sin(rad) * radius;

    const z = Math.cos(rad) * radius;

    const scale = 0.72 + ((z + radius) / (2 * radius)) * 0.38;

    const opacity = 0.45 + ((z + radius) / (2 * radius)) * 0.55;

    const isActive = selectedCard === index;

    const blur = isActive ? 0 : (1 - scale) * 2;

    return {

        transform: `
translate(-50%,-50%)
translateX(${x}px)
translateY(${isActive ? -20 : 0}px)
translateZ(${z + (isActive ? 70 : -20)}px)
rotateX(${isActive ? 5 : 0}deg)
scale(${isActive ? scale + 0.12 : scale})
`,

        opacity: isActive ? 1 : opacity,

        filter: isActive
? "blur(0px)"
: `blur(${blur}px)`,

        zIndex: isActive
? 999
: Math.round(z + radius),

    };

};


const handleCardClick = (index: number) => {

    if (selectedCard === index && paused) return;

    velocityRef.current = 0;

    setDragging(false);

    setSelectedCard(index);

    setTargetRotation(-(index * 120));

};
return (
    
    <div className="fixed inset-0 z-[900] bg-black/80 backdrop-blur-xl flex items-center justify-center">

      <div
className="
relative
w-[96vw]
max-w-[1650px]
h-[92vh]
rounded-[40px]
bg-gradient-to-br
from-black
via-zinc-950
to-black
border
border-zinc-800
overflow-hidden
"
>
        <button
onClick={onClose}
className="
absolute
right-8
top-8
w-14
h-14
rounded-full
bg-zinc-900
border
border-zinc-700
hover:border-red-500
hover:bg-red-500/10
transition
text-3xl
flex
items-center
justify-center
z-50
"
>
✕
</button>

        <div className="px-14 pt-12 pb-6">

          <h1 className="text-5xl xl:text-6xl font-black leading-none">
            Resource Management

          </h1>

          <p className="text-emerald-400 text-2xl mt-3">

            Sport : {sport.name}

          </p>

        </div>

        <div
onMouseDown={onMouseDown}
className="
absolute
left-1/2
top-[50%]
-translate-x-1/2
-translate-y-1/2
w-[1300px]
h-[620px]
cursor-grab
select-none
"
style={{
    perspective:"2600px",
    transformStyle:"preserve-3d",
}}
>
    
          {/* GEARS */}

          <div
style={getCardTransform(1, "gears")}
className="absolute left-1/2 top-1/2 transition-transform duration-75 ease-linear"
>

<div
onClick={() => handleCardClick(1)}
className="
w-[300px]
h-[400px]
rounded-[40px]
overflow-hidden
border
border-emerald-500/20
bg-zinc-950
p-6
shadow-[0_0_60px_rgba(16,185,129,.15)]
"
>
            <CubeIcon className="w-10 h-10 text-emerald-400" />
            <h2 className="text-2xl font-black mt-3">
              Gears
            </h2>
            <p className="text-zinc-500 mt-1 text-xs">
              Manage equipment and availability
            </p>

            <div className="mt-4 flex-1 flex flex-col gap-3">
              <div className="h-[200px] space-y-2 overflow-y-auto">
                {gears.length ? (
                  <>
                    {(selectedCard === 1 ? gears : gears.slice(0, 2)).map((gear: any, index: number) => (
                      <motion.div
                        key={gear.id}
                        whileHover={{ y: -2, scale: 1.01, boxShadow: "0 0 18px rgba(16,185,129,0.16)" }}
                        className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="space-y-1">
                              <p className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-sm">
                                {gear.name}
                              </p>

                              {gear.name.length > 22 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewItem({
                                      title: gear.name,
                                      content: gear.name,
                                    });
                                  }}
                                  className="text-xs text-emerald-400 hover:underline"
                                >
                                  Read More...
                                </button>
                              )}
                            </div>
                            <p className="text-[9px] text-zinc-500">{gear.availableQuantity ?? gear.totalQuantity} available{gear.damagedQuantity ? `, ${gear.damagedQuantity} damaged` : ""}</p>
                          </div>
                          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1">
                            <button onClick={() => void handleGearQuantity(index, -1)} className="h-5 w-5 rounded-full text-sm text-emerald-300 hover:bg-emerald-500/20">−</button>
                            <span className="min-w-[1.5rem] text-center text-sm font-semibold">{gear.totalQuantity}</span>
                            <button onClick={() => void handleGearQuantity(index, 1)} className="h-5 w-5 rounded-full text-sm text-emerald-300 hover:bg-emerald-500/20">+</button>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingGearIndex(index);
                              setGearName(gear.name);
                              setGearQuantity(gear.totalQuantity);
                              setShowAddGearModal(true);
                            }}
                            className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void handleDeleteGear(index)}
                            className="rounded-lg bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}

                    {selectedCard !== 1 && gears.length > 2 && (
                      <div className="text-center text-zinc-500 text-sm py-2">
                        ...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/60 p-4 text-center text-sm text-zinc-500">
                    No gears added yet.
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setEditingGearIndex(null);
                  setGearName("");
                  setGearQuantity(1);
                  setShowAddGearModal(true);
                }}
                className="mt-auto h-10 shrink-0 rounded-2xl bg-emerald-600 font-semibold transition hover:scale-[1.02]"
              >
                + Add Gear
              </button>
            </div>
          </div>
        </div>

          {/* RESOURCE */}

          <div
style={getCardTransform(0, "resources")}
className="absolute left-1/2 top-1/2 transition-transform duration-75 ease-linear"
>

<div
onClick={() => handleCardClick(0)}
className={`
w-[300px]
h-[400px]
rounded-[32px]
border
bg-zinc-950
p-5
flex
flex-col
overflow-hidden
transition-all
duration-500
${
selectedCard === 0
?
"border-sky-400 shadow-[0_0_120px_rgba(59,130,246,.45)]"
:
"border-sky-500/20 shadow-[0_0_50px_rgba(59,130,246,.12)]"
}
`}
>
            <div className="flex items-start justify-between gap-2">
              <div>
                <BuildingOffice2Icon className="w-10 h-10 text-sky-400"/>
                <h2 className="text-xl font-black mt-2">
                  Resources
                </h2>
                <p className="text-zinc-500 text-sm">
                  Manage inventory with smooth updates
                </p>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setShowTypeModal(true);
                }}
                className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-sky-300 transition hover:bg-sky-500/20"
              >
                Change Type
              </button>
            </div>

            <div className="mt-2 rounded-xl border border-sky-500/20 bg-sky-500/10 p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-sky-300">Current Type</p>
                  <p className="font-medium text-xs">{sport.resourceType || resourceType}</p>
                </div>
                <div className="rounded-full bg-zinc-950 px-3 py-1 text-sm font-semibold text-sky-300">{resourceCount}</div>
              </div>
            </div>

           <div className="mt-4 flex flex-col flex-1 min-h-0">
              <div
  className={`
    space-y-2
    flex-1
    pr-1
    ${
      selectedCard === 0
        ? "overflow-y-auto"
        : "overflow-hidden"
    }
  `}
>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/70" />
                  ))
                ) : sport.resourceUnits?.length ? (
                  <>
                    {(selectedCard === 0
                      ? sport.resourceUnits
                      : sport.resourceUnits.slice(0, 3)
                    ).map((resource: any, index: number) => (
                      <motion.div
                        key={resource.id}
                        whileHover={{ y: -2, scale: 1.01, boxShadow: "0 0 20px rgba(59,130,246,0.16)" }}
                        transition={{ type: "spring", stiffness: 240, damping: 20 }}
                        className="group rounded-xl border border-zinc-800 bg-zinc-900/80 px-2 py-1.5 transition hover:border-sky-500"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            {editingResourceIndex === index ? (
                              <div className="flex items-center gap-2">
                                <input
                                  value={editedResourceName}
                                  onChange={(event) => setEditedResourceName(event.target.value)}
                                  className="w-full rounded-xl border border-sky-500/30 bg-zinc-950 px-2 py-1 text-sm outline-none"
                                />
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void handleRenameResource(index);
                                  }}
                                  className="rounded-xl bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300"
                                >
                                  ✓
                                </button>
                              </div>
                              
                            ) : (
                              <>
                                <div className="space-y-1">
  <p className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-sm">
    {resource.name}
  </p>

  {resource.name.length > 22 && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setViewItem({
          title: resource.name,
          content: resource.name,
        });
      }}
      className="text-xs text-sky-400 hover:underline"
    >
      Read More...
    </button>
  )}
</div>
                                <span className={`mt-1 inline-block rounded-full px-1.5 py-0 text-[8px] ${resource.status === "maintenance" ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                                  {resource.status || "Active"}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setEditingResourceIndex(index);
                                setEditedResourceName(resource.name);
                              }}
                              className="h-7 w-7 rounded-xl bg-sky-500/15 text-sm transition hover:bg-sky-500/25"
                            >
                              ✏
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteResource(index);
                              }}
                              className="h-7 w-7 rounded-xl bg-red-500/15 text-sm transition hover:bg-red-500/25"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {selectedCard !== 0 &&
                      sport.resourceUnits.length > 3 && (
                        <div className="text-center text-zinc-500 text-sm py-2">
                          ...
                        </div>
                      )}
                  </>
                ) : (
                  <div>
                    No resources yet. Create a new resource set to get started.
                  </div>
                )
              }
              </div>
              
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setShowAddResourceModal(true);
                }}
                className="mt-auto h-11 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 font-semibold transition hover:scale-[1.02]"
              >
                + Add Resource
              </button>
            </div>
          </div>
        </div>
              

          {/* MAINTENANCE */}

          <div
style={getCardTransform(2, "overview")}
className="absolute left-1/2 top-1/2 transition-transform duration-75 ease-linear"
>

<div
onClick={() => handleCardClick(2)}
className="
w-[300px]
h-[400px]
rounded-[40px]
overflow-hidden
border
border-orange-500/20
bg-zinc-950
p-6
shadow-[0_0_70px_rgba(249,115,22,.15)]
"
>
            <WrenchScrewdriverIcon className="w-14 h-14 text-orange-400"/>
            <h2 className="text-3xl font-black mt-6">
              Overview
            </h2>
            <p className="text-zinc-500 mt-1 text-xs">
              Sport-specific information and status
            </p>

            <div
  className={`
    mt-4
    space-y-3
    flex-1
    ${
      selectedCard === 2
        ? "overflow-y-auto"
        : "overflow-hidden"
    }
  `}
>
              {overviewLoading ? (
                <div className="h-24 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/70" />
              ) : overviewError || !overview ? (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-300">
                  {overviewError || "Overview unavailable"}
                </p>
              ) : (
                <>
                  <div className="rounded-xl border border-orange-500/20 bg-zinc-900/80 p-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">Maintenance</p>
                      <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] text-orange-300">
                        {overview.resources.maintenance}
                      </span>
                    </div>
                    {overview.sport.underMaintenance ? (
                      <p className="mt-1 text-xs text-orange-300 line-clamp-2">
                        Sport closed{overview.sport.maintenanceMessage ? `: ${overview.sport.maintenanceMessage}` : "."}
                      </p>
                    ) : overview.resources.underMaintenance.length ? (
                      <div className="mt-1 space-y-1">
                        {overview.resources.underMaintenance.slice(0, 2).map((resource) => (
                          <p key={resource.id} className="text-xs text-zinc-400">• {resource.name}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-zinc-500">Nothing under maintenance. Ready for play.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2">
                    <p className="font-semibold text-sm">{overview.sport.resourceType}s</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {overview.resources.available} of {overview.resources.total} available
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2">
                    <p className="font-semibold text-sm">Gears</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {overview.gears.availableQuantity} of {overview.gears.totalQuantity} in stock
                      {overview.gears.damagedQuantity ? `, ${overview.gears.damagedQuantity} damaged` : ""}
                    </p>
                  </div>

                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-2">
                    <p className="font-semibold text-sm text-sky-300">Bookings</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {overview.bookings.active} active, {overview.bookings.today} today, {overview.bookings.uniqueStudents} students
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2">
                    <p className="font-semibold text-sm text-emerald-300">Upcoming Team Reservations</p>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                      {overview.upcomingReservations.length
                        ? `${overview.upcomingReservations.length} upcoming, next: ${overview.upcomingReservations[0].teamName}`
                        : "No reservations scheduled yet."}
                    </p>
                  </div>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOverviewModal(true);
                }}
                disabled={!overview}
                className="mt-2 self-end text-xs font-semibold text-orange-400 hover:underline disabled:opacity-40"
              >
                Read More...
              </button>
            </div>
          </div>
        </div>

        </div>
        </div>
        
        <AnimatePresence>
          {showAddResourceModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md"
            >
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 10, opacity: 0, scale: 0.98 }}
                className="w-[700px] max-w-[90vw] max-h-[85vh] overflow-hidden rounded-[35px] border border-sky-500/20 bg-zinc-950 shadow-[0_0_80px_rgba(59,130,246,.25)]"
              >
               
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-black">Add Resource</h2>
                      <p className="mt-2 text-zinc-500">Create new resources smoothly and preview their names before you save.</p>
                    </div>
                    <button onClick={() => setShowAddResourceModal(false)} className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-400 transition hover:border-zinc-500 hover:text-white">✕</button>
                  </div>

                  <div className="mt-8 space-y-6">
                    <div>
                      <label className="text-zinc-400">Resource Name</label>
                      <input
                        value={resourceName}
                        onChange={(event) => setResourceName(event.target.value)}
                        placeholder={resourceType}
                        className="mt-2 h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={resourceQuantity}
                        onChange={(event) => setResourceQuantity(Number(event.target.value))}
                        className="mt-2 h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
                      <input type="checkbox" checked={autoGenerate} onChange={(event) => setAutoGenerate(event.target.checked)} />
                      <p className="text-sm text-zinc-300">Generate resources automatically</p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                      <p className="font-semibold">Preview generated names</p>
                      <div className="mt-3 space-y-2">
                        {previewResources.length ? previewResources.map((item) => (
                          <div key={item} className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-400">
                            {item}
                          </div>
                        )) : (
                          <p className="text-sm text-zinc-500">No preview yet. Toggle auto generation to preview names.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-4">
                    <button onClick={() => setShowAddResourceModal(false)} className="h-12 rounded-xl border border-zinc-700 px-6">Cancel</button>
                    <button onClick={() => void handleAddResource()} className="h-12 rounded-xl bg-sky-600 px-6 font-semibold transition hover:bg-sky-500">Add</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

         

          {showAddGearModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md"
            >
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 10, opacity: 0, scale: 0.98 }}
                className="w-[520px] max-w-[90vw] rounded-[35px] border border-emerald-500/20 bg-zinc-950 p-8 shadow-[0_0_80px_rgba(16,185,129,.18)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-black">{editingGearIndex !== null ? "Edit Gear" : "Add Gear"}</h2>
                    <p className="mt-2 text-zinc-500">Add or update equipment quickly with live quantity updates.</p>
                  </div>
                  <button onClick={() => setShowAddGearModal(false)} className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-400 transition hover:border-zinc-500 hover:text-white">✕</button>
                </div>

                <div className="mt-8 space-y-6">
                  <div>
                    <label className="text-zinc-400">Gear Name</label>
                    <input value={gearName} onChange={(event) => setGearName(event.target.value)} placeholder="Cricket Bat" className="mt-2 h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 outline-none" />
                  </div>
                  <div>
                    <label className="text-zinc-400">Quantity</label>
                    <input type="number" min={1} value={gearQuantity} onChange={(event) => setGearQuantity(Number(event.target.value))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-5 outline-none" />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button onClick={() => setShowAddGearModal(false)} className="h-12 rounded-xl border border-zinc-700 px-6">Cancel</button>
                  <button onClick={() => void handleAddGear()} className="h-12 rounded-xl bg-emerald-600 px-6 font-semibold transition hover:bg-emerald-500">Save</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showOverviewModal && overview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-md"
              onClick={() => setShowOverviewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(event) => event.stopPropagation()}
                className="w-[760px] max-w-[92vw] max-h-[85vh] overflow-y-auto rounded-[30px] border border-orange-500/20 bg-zinc-950 p-8"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-black">{overview.sport.name} Overview</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {overview.sport.hasSlotSystem
                        ? `Slot booking, ${overview.sport.slotDurationMinutes} min slots, ${overview.sport.slotCapacity} per slot`
                        : "Open booking, no fixed slots"}
                      {overview.sport.hasTeamSlots ? ", team reservations enabled" : ""}
                    </p>
                  </div>
                  <button onClick={() => setShowOverviewModal(false)} className="text-2xl hover:text-red-400">✕</button>
                </div>

                {overview.sport.underMaintenance && (
                  <p className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-300">
                    This sport is closed for maintenance{overview.sport.maintenanceMessage ? `: ${overview.sport.maintenanceMessage}` : "."}
                  </p>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { label: overview.sport.resourceType + "s", value: overview.resources.total, note: `${overview.resources.available} available` },
                    { label: "Gear stock", value: overview.gears.availableQuantity, note: `of ${overview.gears.totalQuantity}, ${overview.gears.issuedQuantity} issued` },
                    { label: "Active bookings", value: overview.bookings.active, note: `${overview.bookings.today} today` },
                    { label: "Students", value: overview.bookings.uniqueStudents, note: `${overview.bookings.total} bookings overall` },
                    { label: "Upcoming slots", value: overview.slots.upcoming, note: `${overview.slots.upcomingBooked} booked` },
                    { label: "Pending returns", value: overview.bookings.pendingReturns, note: "waiting for staff" },
                    { label: "Damaged gear", value: overview.gears.damagedQuantity, note: `${overview.gears.types} gear types` },
                    { label: "Under maintenance", value: overview.resources.maintenance, note: `${overview.maintenanceWindows.length} scheduled` },
                  ].map((tile) => (
                    <div key={tile.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
                      <p className="text-[11px] uppercase tracking-wider text-zinc-500">{tile.label}</p>
                      <p className="mt-1 text-2xl font-black">{tile.value}</p>
                      <p className="text-xs text-zinc-500">{tile.note}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="font-semibold text-emerald-300">Upcoming team reservations</p>
                    {overview.upcomingReservations.length ? (
                      <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                        {overview.upcomingReservations.map((reservation) => (
                          <li key={reservation.id}>
                            <span className="font-semibold">{reservation.teamName}</span>
                            <span className="block text-xs text-zinc-500">
                              {formatOverviewDate(reservation.startDateTime)} to {formatOverviewDate(reservation.endDateTime)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-zinc-500">No reservations scheduled yet.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                    <p className="font-semibold text-orange-300">Maintenance schedule</p>
                    {overview.maintenanceWindows.length ? (
                      <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                        {overview.maintenanceWindows.map((window) => (
                          <li key={window.id}>
                            <span className="font-semibold">{window.resourceName || "Entire sport"}</span>
                            <span className="block text-xs text-zinc-500">
                              {formatOverviewDate(window.startAt)} to {formatOverviewDate(window.endAt)}
                              {window.message ? `, ${window.message}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-zinc-500">No maintenance scheduled.</p>
                    )}
                  </div>
                </div>

                {overview.gears.lowStock.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="font-semibold text-red-300">Low stock gear</p>
                    <p className="mt-1 text-sm text-zinc-300">
                      {overview.gears.lowStock.map((gear) => `${gear.name} (${gear.available}/${gear.total})`).join(", ")}
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

          {viewItem && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-md"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="w-[600px] max-w-[90vw] rounded-[30px] bg-zinc-950 border border-zinc-700 p-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {viewItem.title}
        </h2>

        <button
          onClick={() => setViewItem(null)}
          className="text-2xl hover:text-red-400"
        >
          ✕
        </button>
      </div>

      <div className="mt-6 max-h-[350px] overflow-y-auto text-zinc-300 leading-7 whitespace-pre-wrap">
        {viewItem.content}
      </div>
    </motion.div>
  </motion.div>
)}

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 right-6 z-[1000] rounded-2xl border border-zinc-800 bg-zinc-950/95 px-4 py-3 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${toast.type === "error" ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"}`}>
                {toast.type === "error" ? "✕" : "✓"}
              </span>
              <p className="text-sm text-zinc-200">{toast.message}</p>
              {toast.actionLabel && toast.onAction && (
                <button onClick={toast.onAction} className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-white">
                  {toast.actionLabel}
                </button>
              )}
              
            </div>
            
          </motion.div>
          
        )}
      </div>
    
  );
}








































































































