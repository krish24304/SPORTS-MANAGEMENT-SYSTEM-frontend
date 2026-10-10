"use client";

import { useEffect, useState } from "react";
import { getAuthHeaders, authFetch, getUser } from "@/lib/auth";
import AnonymousRequestsModal from "@/components/suggestions/AnonymousRequestsModal";
import { useSuggestionUnread } from "@/lib/suggestions";
import ReturnRequestsModal from "@/components/staff/ReturnRequestsModal";
import ReturnDetailsModal from "@/components/staff/ReturnDetailsModal";
import Navbar from "@/components/layout/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import ResourceManagerPopup from "@/components/ResourceManagerPopup";
import { AnimatePresence } from "framer-motion";
// import motion from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Dumbbell,
  CalendarClock,
  RotateCcw,
  Users,
  Trophy,
  ClipboardList,
  ClipboardCheck,
  Megaphone,
  Bell,
  GraduationCap,
  Building2,
  Activity,
  Search,
  CalendarDays,
  ShieldCheck,
  Eye,
  User,
X,
Package,
  PackageOpen,
  Clock,
  ChevronRight,
  RefreshCw,
  Tag,
  MapPin,
  Timer,
  CircleUserRound,
  ArrowLeft,
  CircleDot,
  Swords,
  Crosshair,
  Table2,
  Undo2,
  Target,
} from "lucide-react";
import {
    createResources,
    renameResourceUnit,
    deleteResourceUnit,
} from "../resourceApi";
import {
ClockIcon,
WrenchScrewdriverIcon,
BuildingOffice2Icon,
UsersIcon,
PlusCircleIcon,
PencilSquareIcon,
TrashIcon
 ,PlusIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

type ResourceItem = { id: string; name: string };
function getBookingStudentName(booking: any): string {
  // 1. student is an object
  if (
    booking?.student &&
    typeof booking.student === "object"
  ) {
    return (
      booking.student.name ||
      booking.student.fullName ||
      booking.student.rollNo ||
      booking.student.email ||
      "Unknown Student"
    );
  }

  // 2. user is an object
  // Your normal booking structure appears to use booking.user
  if (
    booking?.user &&
    typeof booking.user === "object"
  ) {
    return (
      booking.user.name ||
      booking.user.fullName ||
      booking.user.rollNo ||
      booking.user.email ||
      "Unknown Student"
    );
  }

  // 3. student is already a string
  if (
    typeof booking?.student === "string" &&
    booking.student.trim()
  ) {
    return booking.student;
  }

  // 4. Other possible API fields
  if (
    typeof booking?.studentName === "string" &&
    booking.studentName.trim()
  ) {
    return booking.studentName;
  }

  if (
    typeof booking?.name === "string" &&
    booking.name.trim()
  ) {
    return booking.name;
  }

  // 5. Last fallback
  return "Unknown Student";
}
function getBookingSummary(booking: any) {
  const items: string[] = [];

  if (booking.resourceUnit?.name) {
    items.push(booking.resourceUnit.name);
  }

  if (
    Array.isArray(booking.resourcesBooked) &&
    booking.resourcesBooked.length > 0
  ) {
    items.push("Resources");
  }

  if (
    Array.isArray(booking.gearsBooked) &&
    booking.gearsBooked.length > 0
  ) {
    items.push("Gears");
  }

  const sportName =
    typeof booking.sport === "object" &&
    booking.sport !== null
      ? booking.sport.name || ""
      : typeof booking.sport === "string"
        ? booking.sport
        : typeof booking.sportName === "string"
          ? booking.sportName
          : "";

  return {
    title:
      items.length > 0
        ? items.join(" • ")
        : sportName || "Booking",

    subtitle: "",
  };
}
const getStudentName = (booking: any): string => {
  if (!booking) return "Unknown Student";

  // Most important: booking.user
  if (
    booking.user &&
    typeof booking.user === "object"
  ) {
    return (
      booking.user.name ||
      booking.user.fullName ||
      booking.user.rollNo ||
      booking.user.email ||
      "Unknown Student"
    );
  }

  // booking.student is an object
  if (
    booking.student &&
    typeof booking.student === "object"
  ) {
    return (
      booking.student.name ||
      booking.student.fullName ||
      booking.student.rollNo ||
      booking.student.email ||
      "Unknown Student"
    );
  }

  // booking.student is already a string
  if (
    typeof booking.student === "string" &&
    booking.student.trim()
  ) {
    return booking.student;
  }

  // Other possible fields
  if (
    typeof booking.studentName === "string" &&
    booking.studentName.trim()
  ) {
    return booking.studentName;
  }

  if (
    typeof booking.name === "string" &&
    booking.name.trim()
  ) {
    return booking.name;
  }

  return "Unknown Student";
};


const getSportName = (booking: any): string => {
  if (!booking) return "Unknown Sport";

  const sport = booking.sport;

  if (sport && typeof sport === "object") {
    return sport.name || "Unknown Sport";
  }

  if (typeof sport === "string" && sport.trim()) {
    return sport;
  }

  return booking.sportName || "Unknown Sport";
};
function toReturnRow(booking: any) {
  const gears: any[] = Array.isArray(booking.gears) ? booking.gears : [];
  const isGear = booking.bookingType === "gear" || gears.length > 0;
  const photo = booking.user?.idCardPhoto ? String(booking.user.idCardPhoto) : null;
  const requested = booking.returnRequestedAt ? new Date(booking.returnRequestedAt) : null;
  const slotStart = booking.startTime ?? booking.slot?.startTime ?? null;
  const slotEnd = booking.endTime ?? booking.slot?.endTime ?? null;

  return {
    id: booking.id,
    student: booking.user?.name ?? "Student",
    resourceType: isGear ? "Gear" : "Slot",
    gear: gears.length
      ? gears.map((g) => `${g.name} × ${g.quantity}`).join(", ")
      : "Equipment",
    court: booking.resourceUnit?.name ?? booking.sport?.name ?? "Sport",
    sport: booking.sport?.name ?? "",
    borrowTime: slotStart
      ? `${new Date(slotStart).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}${slotEnd ? ` – ${new Date(slotEnd).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}`
      : new Date(booking.bookedAt).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }),
    requestDate: requested ? requested.toLocaleDateString() : "",
    reason: booking.notes ?? "",
    requestedAt: booking.returnRequestedAt ?? null,
    requestTime: requested
      ? requested.toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
      : "",
    idCard: photo ? (photo.startsWith("http") ? photo : `http://localhost:5000${photo}`) : null,
    bookingId: booking.id,
    gearItems: gears,
    status: "Return requested",
  };
}

export default function AdminSportsPage() {
  const [sports, setSports] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
 
const [selectedBooking, setSelectedBooking] =
  useState<any | null>(null);
const [showBookingDetails, setShowBookingDetails] = useState(false);
const [showAnnouncement,setShowAnnouncement]=useState(false);
const [announcementTitle, setAnnouncementTitle] = useState("");
const [announcementMessage, setAnnouncementMessage] = useState("");
const [announcementAudience, setAnnouncementAudience] = useState("everyone");
const [announcementType, setAnnouncementType] = useState("announcement");
const [announcementSportId, setAnnouncementSportId] = useState("");
const [announcementError, setAnnouncementError] = useState("");
const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);
const [announcementExpiry, setAnnouncementExpiry] =useState("");
const [showCreateAnnouncement, setShowCreateAnnouncement] =useState(false);
const [announcements, setAnnouncements] = useState<any[]>([]);
const [showReturnProcess, setShowReturnProcess] = useState(false);

const [showIdViewer, setShowIdViewer] = useState(false);

const [returnCondition, setReturnCondition] = useState("Good");

const [returnNote, setReturnNote] = useState("");
const [selectedReturnRequest, setSelectedReturnRequest] = useState<any>(null);
const [showReturnPopup, setShowReturnPopup] = useState(false);

const [returnRequests, setReturnRequests] = useState<any[]>([]);
/* ================= STAFF REQUESTS ================= */

const [showRequests, setShowRequests] = useState(false);
const [dashStats, setDashStats] = useState<{ sports: number; activeSports: number; staff: number; students: number; resources: number; bookings: number } | null>(null);
const unreadRequests = useSuggestionUnread();
const [customResourceType, setCustomResourceType] = useState("");
const [selectedReturn, setSelectedReturn] = useState<any | null>(null);
const [resourceType, setResourceType] = useState("Court");  
const [showDurationModal, setShowDurationModal] =
  useState(false);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);
  const [showCapacityModal, setShowCapacityModal] =
  useState(false);
const [reservationStartTime,setReservationStartTime]=useState("");
const [slotCapacity, setSlotCapacity] = useState(1);
const [reservationDuration,setReservationDuration]=useState(120);

const [selectedReservationResources,setSelectedReservationResources]=useState<number[]>([]);
const [showResourceTypeModal, setShowResourceTypeModal] =
  useState(false);
const [showEditResourceTypeModal, setShowEditResourceTypeModal] =
  useState(false);
const [TotalCourts, setTotalCourts] = useState(1);
const [showQuantityModal, setShowQuantityModal] =
  useState(false);
const [selectedMaintenanceResources, setSelectedMaintenanceResources] =
    useState<number[]>([]);
  const [quantityInput, setQuantityInput] =
useState("");

const [tempValue, setTempValue] = useState("");

const [showRenameModal, setShowRenameModal] =
  useState(false);

const [resourceUnits, setResourceUnits] = useState<ResourceItem[]>([]);

const [selectedResourceIndex, setSelectedResourceIndex] =
  useState<number | null>(null);

const [newResourceName, setNewResourceName] =
  useState("");

  const [showSuccessToast, setShowSuccessToast] =
  useState(false);

  const [quantitySelected, setQuantitySelected] =
  useState(false);

  const [search, setSearch] = useState("");
  const [showManageSport, setShowManageSport] = useState(false);

const [selectedSport, setSelectedSport] = useState<any>(null);
const [showResourcesPopup, setShowResourcesPopup] = useState(false);

const [showAddResourcePopup, setShowAddResourcePopup] = useState(false);
const [showResourceManager, setShowResourceManager] = useState(false);

const [resourceTab, setResourceTab] = useState<
  "resources" | "gears" | "maintenance"
>("resources");
const [resourceQuantity, setResourceQuantity] = useState(0);

const [showEditResourcePopup, setShowEditResourcePopup] = useState(false);

const [showDeleteResourcePopup, setShowDeleteResourcePopup] = useState(false);

const [selectedResource, setSelectedResource] =
  useState<{ id: string; name: string } | null>(null);

const [newResourceCount, setNewResourceCount] = useState(1);

const [editedResourceName, setEditedResourceName] = useState("");
const [slotDuration, setSlotDuration] = useState(30);

const [slotCapacityValue, setSlotCapacityValue] = useState(1);

const [slotEnabled, setSlotEnabled] = useState(false);
const [showSlotPopup, setShowSlotPopup] = useState(false);
const [showResourceToast,setShowResourceToast]=useState(false);
const [reservationTeamName,setReservationTeamName]=useState("");

const [reservationPurpose,setReservationPurpose]=useState("Practice");

const [reservationStartDate,setReservationStartDate]=useState("");

const [reservationEndDate,setReservationEndDate]=useState("");
const [resourceToastMessage,setResourceToastMessage]=useState("");
const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);
const [maintenanceScope, setMaintenanceScope] = useState<"resources" | "entire">("resources");
const [maintenanceSaving, setMaintenanceSaving] = useState(false);
const [maintenanceWindowStart, setMaintenanceWindowStart] = useState("");
const [maintenanceWindowEnd, setMaintenanceWindowEnd] = useState("");
const [activeMaintenanceWindows, setActiveMaintenanceWindows] = useState<any[]>([]);
const [showActiveMaintenanceList, setShowActiveMaintenanceList] = useState(false);
const [maintenanceConflict, setMaintenanceConflict] = useState<{ conflicts: any[] } | null>(null);

const [maintenanceMessage,setMaintenanceMessage]=useState("");

const [maintenanceResources,setMaintenanceResources]=useState<string[]>([]);
const [maintenanceStartDate, setMaintenanceStartDate] = useState("");

const [maintenanceEndDate, setMaintenanceEndDate] = useState("");

const [affectedResources, setAffectedResources] = useState<string[]>([]);
const [showReservationPopup, setShowReservationPopup] = useState(false);
const [showEditSportPopup, setShowEditSportPopup] = useState(false);

const [editedSportName, setEditedSportName] = useState("");

const [editedResourceType, setEditedResourceType] = useState("");

const [editedStatus, setEditedStatus] = useState(true);
const [teamReservationEnabled,setTeamReservationEnabled]=useState(false);
const [editingDuration, setEditingDuration] = useState(false);
const [editingCapacity, setEditingCapacity] = useState(false);
const [maxTeamSize,setMaxTeamSize]=useState(10);
const [showReturnRequests, setShowReturnRequests] = useState(false);

const [returnSearch, setReturnSearch] = useState("");

const [selectedRequestSport, setSelectedRequestSport] = useState("All");
const [refreshingReturns, setRefreshingReturns] = useState(false);

// ================= LIVE BOOKINGS STATE =================

const [showLiveBookings, setShowLiveBookings] = useState(false);
const [loadErrors, setLoadErrors] = useState<Record<string, string | undefined>>({});
const [returnsReady, setReturnsReady] = useState(false);
const [showLiveBookingDetails, setShowLiveBookingDetails] = useState(false);
const [selectedLiveBooking, setSelectedLiveBooking] =
  useState<any | null>(null);

const [showLiveIdCard, setShowLiveIdCard] = useState(false);

const [liveBookings, setLiveBookings] = useState<any[]>([]);
const [liveSearch, setLiveSearch] = useState("");
const [selectedLiveFilter, setSelectedLiveFilter] = useState("All");

const [liveRefreshing, setLiveRefreshing] = useState(false);

// ================= LIVE BOOKING HELPERS =================

const getLiveBookingItems = (booking: any) => {
  const items = [];

  /*
   * RESOURCE
   */

  const resourceName =
    booking.resourceName ||
    booking.resource ||
    booking.court ||
    booking.courtName ||
    booking.table ||
    booking.field ||
    null;

  if (resourceName) {
    items.push({
      type: "resource",
      name: resourceName,
    });
  }

  /*
   * GEARS
   */

  if (Array.isArray(booking.gears) && booking.gears.length > 0) {
    booking.gears.forEach((gear: any) => {
      items.push({
        type: "gear",
        name:
          typeof gear === "string"
            ? gear
            : gear.name || gear.gear || "Equipment",
        quantity:
          typeof gear === "object"
            ? gear.quantity || 1
            : 1,
      });
    });
  } else if (booking.gear) {
    items.push({
      type: "gear",
      name:
        typeof booking.gear === "string"
          ? booking.gear
          : booking.gear.name || "Equipment",
      quantity:
        typeof booking.gear === "object"
          ? booking.gear.quantity || 1
          : booking.gearQuantity || 1,
    });
  }

  return items;
};


const getBookingSummary = (booking: any) => {
  const items = getLiveBookingItems(booking);

  const resource = items.find(
    (item) => item.type === "resource"
  );

  const gears = items.filter(
    (item) => item.type === "gear"
  );

  if (resource && gears.length > 0) {
    return {
      title: resource.name,
      subtitle:
        gears.length === 1
          ? `+ ${gears[0].quantity || 1} Gear`
          : `+ ${gears.reduce(
              (sum, gear) => sum + (gear.quantity || 1),
              0
            )} Gears`,
    };
  }

  if (resource) {
    return {
      title: resource.name,
      subtitle: "Resource Only",
    };
  }

  if (gears.length > 0) {
    const total = gears.reduce(
      (sum, gear) => sum + (gear.quantity || 1),
      0
    );

    return {
      title: "Gears Only",
      subtitle: `${total} ${
        total === 1 ? "Gear" : "Gears"
      }`,
    };
  }

  return {
    title: "Booking",
    subtitle: "No items",
  };
};


const formatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const describeLoadError = (status: number | null) => {
  if (status === null) {
    return "Can't reach the backend at localhost:5000. Start the backend, then press Refresh.";
  }
  if (status === 401) {
    return "You are not signed in on this browser. Sign in as staff at /login, then press Refresh.";
  }
  if (status === 403) {
    const role = getUser()?.role ?? "unknown";
    return `This account (${role}) cannot see staff data. Sign in with a staff or admin account.`;
  }
  return `The server returned an error (${status}). Check the backend terminal.`;
};

const formatDayShort = (iso: string) =>
  new Date(iso).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });

const getBookingTime = (booking: any) => {
  const start = booking?.startTime ?? booking?.slot?.startTime ?? null;
  const end = booking?.endTime ?? booking?.slot?.endTime ?? null;

  if (start) {
    const range = end ? `${formatClock(start)} – ${formatClock(end)}` : formatClock(start);
    return `${formatDayShort(start)} · ${range}`;
  }

  if (booking?.bookedAt) {
    return `${formatDayShort(booking.bookedAt)} · booked ${formatClock(booking.bookedAt)}`;
  }

  return "No time set";
};

const getGearVisual = (name: string) => {
  const n = name.toLowerCase();
  if (/ball|stack/.test(n)) return { Icon: CircleDot, color: "text-cyan-300" };
  if (/racket|racquet|bat|stick/.test(n)) return { Icon: Swords, color: "text-amber-300" };
  if (/stump/.test(n)) return { Icon: Crosshair, color: "text-emerald-300" };
  if (/pool|snooker|cue/.test(n)) return { Icon: Target, color: "text-violet-300" };
  if (/table|\btt\b/.test(n)) return { Icon: Table2, color: "text-sky-300" };
  return { Icon: Package, color: "text-emerald-300" };
};

function GearIcon({ name, type }: { name: string; type: string }) {
  if (type === "resource") return <MapPin className="w-5 h-5 text-emerald-400" />;
  const { Icon, color } = getGearVisual(name);
  return <Icon className={`w-5 h-5 ${color}`} />;
}


const getPhaseLabel = (booking: any) => {
  if (booking?.phase === "return_requested") return "RETURN REQUESTED";
  if (booking?.phase === "ended_not_returned") return "SLOT ENDED";
  return "IN PROGRESS";
};

const getBookingDate = (booking: any) => {
  if (!booking?.bookedAt) return "—";
  return new Date(booking.bookedAt).toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};


const getBookingAvatar = (booking: any) => {
  return (
    booking?.user?.idCardPhoto ||
    booking?.user?.profilePhoto ||
    booking?.user?.photo ||
    booking?.student?.idCardPhoto ||
    booking?.student?.profilePhoto ||
    booking?.student?.photo ||
    booking?.photo ||
    booking?.profilePhoto ||
    booking?.studentPhoto ||
    booking?.avatar ||
    booking?.idCard ||
    null
  );
};


const getBookingId = (booking: any) => {
  return (
    booking.bookingId ||
    booking.id ||
    booking._id ||
    "N/A"
  );
};

// ================= FETCH LIVE BOOKINGS =================

const fetchLiveBookings = async () => {
  let status: number | null = null;
  try {
    const res = await authFetch("http://localhost:5000/bookings/live", { cache: "no-store" });
    status = res.status;

    if (!res.ok) {
      setLoadErrors((prev) => ({ ...prev, live: describeLoadError(res.status) }));
      return;
    }

    const data = await res.json();
    setLiveBookings(Array.isArray(data) ? data : data.bookings || []);
    setLoadErrors((prev) => ({ ...prev, live: undefined }));
  } catch (error) {
    console.error("Failed to fetch live bookings:", error);
    setLoadErrors((prev) => ({ ...prev, live: describeLoadError(status) }));
  }
};

useEffect(() => {
  if (!showLiveBookings) return;

  fetchLiveBookings();

  const interval = setInterval(() => {
    fetchLiveBookings();
  }, 10000);

  return () => clearInterval(interval);
}, [showLiveBookings]);


// ================= FILTER LIVE BOOKINGS =================

const filteredLiveBookings = liveBookings.filter(
  (booking: any) => {
    const summary = getBookingSummary(booking);

    const searchText = liveSearch
      .toLowerCase()
        .trim();

    const student =
      getStudentName(booking);

    const sport =
      getSportName(booking);

    
    const summaryText =
      typeof summary === "string"
        ? summary
        : summary?.title || "";

    const matchesSearch =
      !searchText ||
      student.toLowerCase().includes(searchText) ||
      summaryText.toLowerCase().includes(searchText) ||
      sport.toLowerCase().includes(searchText);

    const matchesFilter =
      selectedLiveFilter === "All" ||
      sport === selectedLiveFilter;

    return matchesSearch && matchesFilter;
  }
);


const liveSports = [
  "All",
  ...new Set(
    liveBookings
      .map((booking: any) => 
        getSportName(booking)
      )
      .filter(Boolean)
  ),
];







const [showReturnDetails, setShowReturnDetails] = useState(false);
const [showIdCard, setShowIdCard] = useState(false);
const [showFullIdCard, setShowFullIdCard] = useState(false);
const refreshReturnPanel = async () => {
  setRefreshingReturns(true);
  try {
    const returnsRes = await authFetch("http://localhost:5000/returns/pending");
    const returns = await returnsRes.json();
    setReturnRequests(Array.isArray(returns) ? returns.map(toReturnRow) : []);
  } catch (err) {
    console.error("Failed to refresh return requests", err);
  } finally {
    setRefreshingReturns(false);
  }
};

const submitReturnCondition = async (row: any, condition: "good" | "damaged") => {
  const res = await authFetch(`http://localhost:5000/approve-return/${row.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ damaged: condition === "damaged" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Could not save the return (${res.status}).`) as Error & { status?: number };
    err.status = res.status;
    if (res.status === 409) await refreshReturnPanel();
    throw err;
  }
  setReturnRequests((prev) => prev.filter((r) => r.id !== row.id));
};

const requestSports = Array.from(
  new Set(returnRequests.map((item) => item.sport).filter(Boolean))
).sort((a: string, b: string) => a.localeCompare(b));

const filteredReturnRequests = returnRequests.filter((item) => {
  const matchesSport =
    selectedRequestSport === "All" ||
    item.sport === selectedRequestSport;

  const matchesSearch =
    returnSearch.trim() === "" ||
    (item.student || "")
      .toLowerCase()
      .includes(returnSearch.toLowerCase());

  return matchesSport && matchesSearch;
});
const [advanceBookingDays,setAdvanceBookingDays]=useState(7);  
const fetchSports = async () => {
    try {
      const response = await authFetch(
        "http://localhost:5000/sports"
      );

      const data = await response.json();

      setSports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchSports();
    authFetch("http://localhost:5000/dashboard/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDashStats(data))
      .catch(() => setDashStats(null));
    // fetch announcements, return requests and anonymous requests from backend
    const fetchAnnouncements = async () => {
      try {
        const res = await authFetch("http://localhost:5000/notices");
        if (!res.ok) {
          setLoadErrors((prev) => ({ ...prev, notices: describeLoadError(res.status) }));
          return;
        }
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
        setLoadErrors((prev) => ({ ...prev, notices: undefined }));
      } catch (err) {
        console.error("Failed to fetch announcements", err);
        setLoadErrors((prev) => ({ ...prev, notices: describeLoadError(null) }));
      }
    };

    const fetchReturnRequests = async () => {
      try {
        const res = await authFetch("http://localhost:5000/returns/pending");
        if (!res.ok) {
          setLoadErrors((prev) => ({ ...prev, returns: describeLoadError(res.status) }));
          return;
        }
        const data = await res.json();
        setReturnRequests(Array.isArray(data) ? data.map(toReturnRow) : []);
        setLoadErrors((prev) => ({ ...prev, returns: undefined }));
        setReturnsReady(true);
      } catch (err) {
        console.error("Failed to fetch return requests", err);
        setLoadErrors((prev) => ({ ...prev, returns: describeLoadError(null) }));
        setReturnsReady(true);
      }
    };

    fetchAnnouncements();
    fetchReturnRequests();
  }, []);

const deleteSport = async (id: string) => {

  const confirmed = window.confirm(
    "Delete this sport?"
  );

  if (!confirmed) return;

  try {

    const response = await authFetch(
  `http://localhost:5000/sports/${id}`,
  {
    method: "DELETE",
  }
);

if (!response.ok) {
  throw new Error("Failed to delete sport");
}

await fetchSports();

  } catch (error) {
    console.log(error);
  }

};
const updateSport = async(updatedSport:any)=>{

try{

const response = await authFetch(

`http://localhost:5000/sports/${updatedSport.id}`,

{

method:"PUT",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(updatedSport)

}

);

if (!response.ok) {
  const data = await response.json().catch(() => null);
  return { ok: false as const, message: data?.message || "Failed to update sport" };
}

const saved = await response.json();
return { ok: true as const, sport: saved };

}catch(err){

console.log(err);
return { ok: false as const, message: "Could not reach the server" };

}

};

const getSportResources = (sportData: any = selectedSport) => {
  if (!sportData) return [];
  if (Array.isArray(sportData.resources)) return sportData.resources;
  if (Array.isArray(sportData.resourceUnits)) return sportData.resourceUnits;
  return [];
};

const syncSportResources = async (sportData: any, resources: any[]) => {
  if (!sportData) return;

  const updatedSport = {
    ...sportData,
    resources,
    resourceUnits: resources,
    totalCourts: resources.length || 1,
  };

  setSelectedSport(updatedSport);
  setSports((prev) => prev.map((item) => (item.id === sportData.id ? updatedSport : item)));
  await updateSport(updatedSport);
};

const handleAddResources = async () => {
  if (!selectedSport) return;

  const currentResources = getSportResources(selectedSport);
  const baseName = selectedSport.resourceType || "Court";
  const generatedResources = Array.from({ length: Math.max(1, resourceQuantity) }, (_, index) => ({
    id: crypto.randomUUID(),
    name: `${baseName} ${currentResources.length + index + 1}`,
    status: "active",
  }));

  const nextResources = [...currentResources, ...generatedResources];
  await syncSportResources(selectedSport, nextResources);

  setShowAddResourcePopup(false);
  setResourceQuantity(1);
  setResourceToastMessage("Resources added");
  setShowResourceToast(true);
  setTimeout(() => setShowResourceToast(false), 2500);
};

const handleSaveResourceEdit = async () => {
  if (!selectedSport || !selectedResource) return;

  const trimmed = editedResourceName.trim();
  if (!trimmed) return;

  const nextResources = getSportResources(selectedSport).map((resource: any) =>
    resource.id === selectedResource.id ? { ...resource, name: trimmed } : resource
  );

  await syncSportResources(selectedSport, nextResources);
  setShowEditResourcePopup(false);
  setSelectedResource(null);
  setEditedResourceName("");
  setResourceToastMessage("Resource updated");
  setShowResourceToast(true);
  setTimeout(() => setShowResourceToast(false), 2500);
};

const handleDeleteSelectedResource = async () => {
  if (!selectedSport || !selectedResource) return;

  const nextResources = getSportResources(selectedSport).filter(
    (resource: any) => resource.id !== selectedResource.id
  );

  await syncSportResources(selectedSport, nextResources);
  setShowDeleteResourcePopup(false);
  setSelectedResource(null);
  setResourceToastMessage("Resource deleted");
  setShowResourceToast(true);
  setTimeout(() => setShowResourceToast(false), 2500);
};

const handleSaveSlotSettings = async () => {

if (!selectedSport) return;

const result = await updateSport({
  ...selectedSport,
  hasSlotSystem: slotEnabled,
  slotDurationMinutes: slotDuration,
  slotCapacity: slotCapacityValue,
});

if (!result || result.ok === false) {
  setResourceToastMessage(result?.message || "Failed to save slot settings");
  setShowResourceToast(true);
  setTimeout(() => setShowResourceToast(false), 2500);
  return;
}

const updatedSport = result.sport;
setSelectedSport(updatedSport);
setSports((prev)=>

prev.map((sport)=>

sport.id===selectedSport.id

? updatedSport

: sport

)

);

setShowSlotPopup(false);
setResourceToastMessage("Slot settings saved");
setShowResourceToast(true);
setTimeout(() => setShowResourceToast(false), 2500);

};

const handleSaveSportInfo = async () => {
  if (!selectedSport) return;

  const result = await updateSport({
    ...selectedSport,
    name: editedSportName.trim() || selectedSport.name,
    resourceType: editedResourceType.trim() || selectedSport.resourceType || "Court",
  });

  if (!result || result.ok === false) {
    setResourceToastMessage(result?.message || "Failed to update sport");
    setShowResourceToast(true);
    setTimeout(() => setShowResourceToast(false), 2500);
    return;
  }

  const updatedSport = result.sport;
  setSelectedSport(updatedSport);
  setSports((prev) =>
    prev.map((sport) => (sport.id === selectedSport.id ? updatedSport : sport))
  );

  setShowEditSportPopup(false);
  setResourceToastMessage("Sport updated");
  setShowResourceToast(true);
  setTimeout(() => {
    setShowResourceToast(false);
  }, 2500);
};

const getResourceIcon = () => {

switch(resourceType) {

case "Court":
return "🏟";

case "Table":
return "🏓";

case "Board":
return "♟";

case "Lane":
return "🎳";

case "Track":
return "🏃";

case "Pool":
return "🏊";

default:
return "📍";

}

};
const handleCreateReservation = async () => {

  if (!selectedSport?.id) return;

  const team = reservationTeamName.trim();
  const startDate = reservationStartDate;
  const endDate = reservationEndDate || reservationStartDate;

  const announce = (message: string) => {
    setResourceToastMessage(message);
    setShowResourceToast(true);
    setTimeout(() => setShowResourceToast(false), 3000);
  };

  if (!team) return announce("Please enter a team name");
  if (!startDate) return announce("Please choose a start date");
  if (!reservationStartTime) return announce("Please choose a slot start time");
  if (!reservationDuration || reservationDuration <= 0) return announce("Duration must be a positive number of minutes");
  if (selectedReservationResources.length === 0) return announce("Select at least one resource");
  if (new Date(endDate) < new Date(startDate)) return announce("End date cannot be before the start date");

  // One reservation per calendar day across the chosen date range, same
  // start time and duration every day (daily recurring team practice).
  const days: string[] = [];
  for (
    let cursor = new Date(startDate);
    cursor <= new Date(endDate);
    cursor.setDate(cursor.getDate() + 1)
  ) {
    days.push(new Date(cursor).toISOString().slice(0, 10));
  }

  let created = 0;
  const failures: string[] = [];

  for (const day of days) {
    try {
      const response = await authFetch("http://localhost:5000/team-reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: team,
          purpose: reservationPurpose,
          sportId: selectedSport.id,
          startDateTime: new Date(`${day}T${reservationStartTime}`).toISOString(),
          durationMinutes: reservationDuration,
          resourceUnitIds: selectedReservationResources,
        }),
      });

      if (response.ok) {
        created += 1;
      } else {
        const data = await response.json().catch(() => null);
        failures.push(`${day}: ${data?.message || "failed"}`);
      }
    } catch (err) {
      console.error("CREATE TEAM RESERVATION ERROR:", err);
      failures.push(`${day}: could not reach the server`);
    }
  }

  if (created > 0) {
    announce(
      failures.length === 0
        ? `Reserved ${created} day(s) for ${team}`
        : `Reserved ${created} of ${days.length} day(s); ${failures[0]}`
    );
  } else {
    announce(failures[0] || "Failed to create reservation");
    return;
  }

  // Close popup
  setShowReservationPopup(false);

  // Reset fields
  setReservationTeamName("");
  setReservationPurpose("Practice");
  setReservationStartDate("");
  setReservationEndDate("");
  setReservationStartTime("");
  setReservationDuration(120);
  setSelectedReservationResources([]);

};

const refreshSportDetail = async (sportId: number) => {
  try {
    const response = await authFetch("http://localhost:5000/sports");
    const data = await response.json();
    if (Array.isArray(data)) {
      setSports(data);
      const updated = data.find((s: any) => s.id === sportId);
      if (updated) setSelectedSport(updated);
    }
  } catch (err) {
    console.error("REFRESH SPORT DETAIL ERROR:", err);
  }
};

const fetchMaintenanceWindows = async (sportId: number) => {
  try {
    const response = await authFetch(`http://localhost:5000/sports/${sportId}/maintenance-windows`);
    if (!response.ok) {
      setActiveMaintenanceWindows([]);
      return;
    }
    const data = await response.json();
    setActiveMaintenanceWindows(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("FETCH MAINTENANCE WINDOWS ERROR:", err);
    setActiveMaintenanceWindows([]);
  }
};

const handleSaveMaintenance = async (force: boolean) => {
  if (!selectedSport?.id) return;

  const announce = (message: string) => {
    setResourceToastMessage(message);
    setShowResourceToast(true);
    setTimeout(() => setShowResourceToast(false), 3000);
  };

  if (maintenanceScope === "resources" && selectedMaintenanceResources.length === 0) {
    announce("Select at least one resource");
    return;
  }

  if (!maintenanceWindowStart || !maintenanceWindowEnd) {
    announce("Choose a start and end date/time");
    return;
  }

  const startAt = new Date(maintenanceWindowStart);
  const endAt = new Date(maintenanceWindowEnd);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    announce("Invalid start or end date/time");
    return;
  }
  if (endAt <= startAt) {
    announce("End must be after start");
    return;
  }

  setMaintenanceSaving(true);

  try {
    const response = await authFetch(`http://localhost:5000/sports/${selectedSport.id}/maintenance-windows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope: maintenanceScope === "entire" ? "entire" : "resource",
        resourceUnitIds: maintenanceScope === "resources" ? selectedMaintenanceResources : undefined,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        message: maintenanceMessage.trim() || null,
        force,
      }),
    });

    const data = await response.json().catch(() => null);

    if (response.status === 409 && data?.conflictType === "reservation") {
      setMaintenanceConflict({ conflicts: data.conflicts || [] });
      return;
    }

    if (!response.ok) {
      announce(data?.message || "Failed to schedule maintenance");
      return;
    }

    await refreshSportDetail(selectedSport.id);
    await fetchMaintenanceWindows(selectedSport.id);

    setMaintenanceConflict(null);
    setShowMaintenancePopup(false);
    setSelectedMaintenanceResources([]);
    setMaintenanceMessage("");
    setMaintenanceWindowStart("");
    setMaintenanceWindowEnd("");

    announce(
      data?.cancelledReservations > 0
        ? `Maintenance scheduled; ${data.cancelledReservations} reservation(s) cancelled`
        : "Maintenance scheduled"
    );
  } catch (err) {
    console.error("SAVE MAINTENANCE ERROR:", err);
    announce("Could not reach the server");
  } finally {
    setMaintenanceSaving(false);
  }
};

const handleEndMaintenanceWindow = async (windowId: number) => {
  if (!selectedSport?.id) return;

  try {
    const response = await authFetch(`http://localhost:5000/sports/${selectedSport.id}/maintenance-windows/${windowId}/end`, {
      method: "POST",
    });

    if (!response.ok) {
      setResourceToastMessage("Failed to end maintenance");
      setShowResourceToast(true);
      setTimeout(() => setShowResourceToast(false), 2500);
      return;
    }

    await refreshSportDetail(selectedSport.id);
    await fetchMaintenanceWindows(selectedSport.id);
    setResourceToastMessage("Maintenance ended");
    setShowResourceToast(true);
    setTimeout(() => setShowResourceToast(false), 2500);
  } catch (err) {
    console.error("END MAINTENANCE WINDOW ERROR:", err);
    setResourceToastMessage("Could not reach the server");
    setShowResourceToast(true);
    setTimeout(() => setShowResourceToast(false), 2500);
  }
};

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* HEADER */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-10">

          <div className="flex justify-between items-center flex-wrap gap-6">

            <div>
              <h1 className="text-5xl font-black mb-2">
                Sports Management System
              </h1>

              <p className="text-zinc-400">
                Welcome back! Manage sports,
                resources and bookings.
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-xl">
                Staff 👤
              </p>
            </div>

          </div>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-10 [&>*:last-child]:col-span-2 md:[&>*:last-child]:col-span-3 xl:[&>*:last-child]:col-span-1">

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center">
            <p className="text-4xl mb-2">🏅</p>
            <h3 className="font-black text-xl">
              Sports
            </h3>
            <div className="mt-4 flex items-end gap-3">

  <div className="mt-4 flex items-center gap-2">
  <span className="text-emerald-400 font-bold text-4xl" title="Sports not in maintenance">
    {dashStats ? dashStats.activeSports : "…"}
  </span>

  <span className="text-zinc-500">
    /
  </span>

  <span className="text-zinc-300 font-bold text-2xl">
    {dashStats ? dashStats.sports : sports.length}
  </span>

</div>
</div>

            <p className="text-zinc-400 text-sm mt-1">
              Active / Total Sports
            </p>

          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center">
            <Users
  className="
  w-10 h-10 mx-auto mb-3
  text-violet-400
  drop-shadow-[0_0_12px_rgba(139,92,246,.8)]
  "
/>
            <h3 className="font-black text-xl">
              Staff
            </h3>
            <p className="text-violet-400 font-bold text-3xl mt-3">
              {dashStats?.staff ?? "…"}
            </p>
            <p className="text-zinc-400">
              Active
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center">
            <GraduationCap
  className="
  w-10 h-10 mx-auto mb-3
  text-orange-400
  drop-shadow-[0_0_12px_rgba(251,146,60,.8)]
  "
/>
            <h3 className="font-black text-xl">
              Students
            </h3>
            <p className="text-3xl text-orange-400 font-bold mt-3">
              {dashStats?.students ?? "…"}
            </p>
            <p className="text-zinc-400">
              Registered
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center">
            <p className="text-4xl mb-2">🏟️</p>
            <h3 className="font-black text-xl">
              Assets
            </h3>
            <p className="text-3xl text-blue-400 font-bold mt-3">
              {dashStats?.resources ?? "…"}
            </p>
            <p className="text-zinc-400 font-bold">
              Resources
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center">
            <p className="text-4xl mb-2">📋</p>
            <h3 className="font-black text-xl">
              Activity
            </h3>
            <p className="text-3xl text-pink-400 font-bold mt-3">
              {dashStats?.bookings ?? "…"}
            </p>
            <p className="text-zinc-400">
              Bookings
            </p>
          </div>

        </div>

{/* ================= RETURN REQUESTS MODAL ================= */}

<ReturnRequestsModal
        open={showReturnRequests}
        rows={returnRequests}
        loading={!returnsReady && !loadErrors.returns}
        error={loadErrors.returns ?? ""}
        refreshing={refreshingReturns}
        onClose={() => setShowReturnRequests(false)}
        onRefresh={refreshReturnPanel}
        onReview={(row) => {
          setSelectedReturn(row);
          setShowReturnDetails(true);
        }}
      />

{/* ================= RETURN DETAILS ================= */}

<ReturnDetailsModal
        row={showReturnDetails ? selectedReturn : null}
        onClose={() => {
          setShowReturnDetails(false);
          setSelectedReturn(null);
        }}
        onCondition={submitReturnCondition}
      />

{/* ================= FULL SIZE ID CARD ================= */}

{showIdCard && selectedReturn && (

  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}

    className="
      fixed
      inset-0
      z-[300]

      bg-black/90
      backdrop-blur-2xl

      flex
      items-center
      justify-center

      p-6
    "
  >

    {/* Ambient glow */}

    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}

      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }}

      className="
        absolute
        w-[500px]
        h-[500px]

        rounded-full

        bg-emerald-500/10

        blur-[120px]

        pointer-events-none
      "
    />

    {/* Close */}

    <button
      type="button"
      onClick={() => setShowIdCard(false)}

      className="
        absolute
        top-7
        right-7
        z-20

        w-14
        h-14

        rounded-2xl

        bg-zinc-900/90
        border
        border-zinc-700

        text-zinc-400

        flex
        items-center
        justify-center

        hover:text-white
        hover:bg-red-500/15
        hover:border-red-500/40
        hover:rotate-90

        transition-all
        duration-300
      "
    >
      <X className="w-6 h-6" />
    </button>


    {/* ID CARD */}

    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
        y: 30
      }}

      animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }}

      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }}

      className="
        relative
        z-10

        max-w-[90vw]
        max-h-[85vh]

        rounded-[30px]

        overflow-hidden

        border
        border-emerald-500/30

        bg-zinc-950

        shadow-[0_0_100px_rgba(16,185,129,.18)]

        p-3
      "
    >

      {selectedReturn.idCard ? (

        <img
          src={selectedReturn.idCard}
          alt="Student ID Card"

          className="
            max-w-[85vw]
            max-h-[80vh]

            object-contain

            rounded-2xl

            transition-transform
            duration-500

            hover:scale-[1.02]
          "
        />

      ) : (

        <div
          className="
            w-[500px]
            h-[300px]

            flex
            items-center
            justify-center

            text-zinc-500
          "
        >
          No ID card available
        </div>

      )}

    </motion.div>

  </motion.div>

)}


{/* =========================================================
    LIVE BOOKINGS MODAL
========================================================= */}

{showLiveBookings && (
  <div
    className="
      fixed inset-0 z-[220]

      bg-black/80
      backdrop-blur-2xl

      flex
      items-center
      justify-center

      p-4
      sm:p-6

      overflow-hidden
    "
  >

    {/* =====================================================
        AMBIENT BACKGROUND
    ===================================================== */}

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="
        absolute
        inset-0
        pointer-events-none
        overflow-hidden
      "
    >

      <motion.div
        animate={{
          x: [0, 90, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-[0%]
          left-[5%]

          w-[420px]
          h-[420px]

          rounded-full

          bg-emerald-500/[0.10]

          blur-[140px]
        "
      />

      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-[-5%]
          right-[5%]

          w-[450px]
          h-[450px]

          rounded-full

          bg-teal-500/[0.08]

          blur-[150px]
        "
      />

    </motion.div>


    {/* =====================================================
        MAIN MODAL
    ===================================================== */}

    <motion.div
      initial={{
        opacity: 0,
        scale: 0.88,
        y: 50,
        rotateX: 8,
      }}

      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
      }}

      exit={{
        opacity: 0,
        scale: 0.94,
        y: 30,
      }}

      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}

      className="
        relative

        w-full
        max-w-[1050px]

        max-h-[90vh]

        overflow-hidden

        rounded-[34px]

        bg-gradient-to-br
        from-[#07100d]
        via-[#050807]
        to-[#030605]

        border
        border-emerald-400/20

        shadow-[0_0_120px_rgba(16,185,129,.14)]
      "
    >

      {/* ===================================================
          MOVING BORDER
      =================================================== */}

      <motion.div
        animate={{
          opacity: [0.15, 0.5, 0.15],
        }}

        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}

        className="
          absolute
          inset-0

          rounded-[34px]

          border
          border-emerald-400/30

          pointer-events-none
        "
      />


      {/* ===================================================
          SCANNING LIGHT
      =================================================== */}

      <motion.div
        animate={{
          x: ["-120%", "230%"],
        }}

        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}

        className="
          absolute

          top-0
          left-0

          w-[35%]
          h-[2px]

          bg-gradient-to-r
          from-transparent
          via-emerald-300
          to-transparent

          blur-[2px]

          pointer-events-none

          z-30
        "
      />


      {/* ===================================================
          CLOSE BUTTON
      =================================================== */}

      <motion.button
        type="button"

        whileHover={{
          rotate: 90,
          scale: 1.08,
        }}

        whileTap={{
          scale: 0.88,
        }}

        onClick={() => {
          setShowLiveBookings(false);
          setLiveSearch("");
          setSelectedLiveFilter("All");
        }}

        className="
          absolute

          top-5
          right-5

          z-50

          w-11
          h-11

          rounded-2xl

          bg-zinc-900/80

          border
          border-zinc-800

          text-zinc-500

          flex
          items-center
          justify-center

          hover:text-white

          hover:bg-emerald-500/10
          hover:border-emerald-500/30

          transition-all
        "
      >
        <X className="w-5 h-5" />
      </motion.button>


      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          relative
          z-10

          px-7
          sm:px-9

          pt-8
          pb-6

          border-b
          border-zinc-800/70
        "
      >

        <div
          className="
            flex
            items-start
            justify-between

            pr-12
          "
        >

          <div className="flex items-center gap-4">

            {/* ICON */}

            <motion.div
              animate={{
                y: [0, -3, 0],
                rotate: [0, -2, 2, 0],
              }}

              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}

              className="
                relative

                w-14
                h-14

                shrink-0

                rounded-2xl

                bg-emerald-500/[0.08]

                border
                border-emerald-400/30

                flex
                items-center
                justify-center

                shadow-[0_0_35px_rgba(16,185,129,.15)]
              "
            >

              <ClipboardCheck
                className="
                  w-7
                  h-7

                  text-emerald-400

                  drop-shadow-[0_0_10px_rgba(52,211,153,.8)]
                "
              />

              <motion.span
                animate={{
                  opacity: [0.1, 0.5, 0.1],
                  scale: [1, 1.15, 1],
                }}

                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}

                className="
                  absolute
                  inset-0

                  rounded-2xl

                  border
                  border-emerald-400/30
                "
              />

            </motion.div>


            <div>

              <div className="flex items-center gap-3">

                <h2
                  className="
                    text-2xl
                    sm:text-3xl

                    font-black

                    bg-gradient-to-r
                    from-white
                    via-emerald-100
                    to-emerald-400

                    bg-clip-text
                    text-transparent
                  "
                >
                  Live Bookings
                </h2>


                {/* LIVE BADGE */}

                <div
                  className="
                    flex
                    items-center
                    gap-2

                    px-3
                    py-1.5

                    rounded-full

                    bg-emerald-500/[0.08]

                    border
                    border-emerald-400/20
                  "
                >

                  <motion.span
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}

                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}

                    className="
                      w-2
                      h-2

                      rounded-full

                      bg-emerald-400

                      shadow-[0_0_12px_rgba(52,211,153,.9)]
                    "
                  />

                  <span
                    className="
                      text-[10px]
                      font-black
                      tracking-[0.18em]

                      text-emerald-400
                    "
                  >
                    LIVE
                  </span>

                </div>

              </div>


              <p
                className="
                  text-zinc-500
                  text-sm
                  mt-1
                "
              >
                View currently active bookings in real time
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div
          className="
            mt-7

            flex
            flex-col
            sm:flex-row

            gap-3
          "
        >

          {/* SEARCH */}

          <div className="relative flex-1 group">

            <Search
              className="
                absolute
                left-5
                top-1/2
                -translate-y-1/2

                w-5
                h-5

                text-zinc-600

                group-focus-within:text-emerald-400

                transition-colors
              "
            />

            <input
              value={liveSearch}

              onChange={(e) =>
                setLiveSearch(e.target.value)
              }

              placeholder="
                Search student or booking...
              "

              className="
                w-full

                h-14

                rounded-2xl

                bg-black/30

                border
                border-zinc-800

                pl-14
                pr-5

                text-white

                outline-none

                placeholder:text-zinc-600

                focus:border-emerald-500/50

                focus:ring-4
                focus:ring-emerald-500/[0.05]

                transition-all
              "
            />

          </div>


          {/* SPORT FILTER */}

          <select
            value={selectedLiveFilter}

            onChange={(e) =>
              setSelectedLiveFilter(e.target.value)
            }

            className="
              h-14

              sm:w-[170px]

              rounded-2xl

              bg-black/30

              border
              border-zinc-800

              px-5

              text-zinc-300

              outline-none

              cursor-pointer

              focus:border-emerald-500/50

              transition-all
            "
          >

            {liveSports.map((sport) => (
              <option
                key={sport}
                value={sport}
              >
                {sport === "All"
                  ? "All Sports"
                  : sport}
              </option>
            ))}

          </select>

        </div>

      </div>


      {/* ===================================================
          BOOKING LIST
      =================================================== */}

      <div
        className="
          relative
          z-10

          p-5
          sm:p-7

          max-h-[62vh]

          overflow-y-auto

          space-y-3

          scrollbar-thin
          scrollbar-thumb-emerald-500/20
          scrollbar-track-transparent
        "
      >

        {filteredLiveBookings.length === 0 ? (

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}

            animate={{
              opacity: 1,
              scale: 1,
            }}

            className="
              py-20
              text-center
            "
          >

            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 2, -2, 0],
              }}

              transition={{
                duration: 3,
                repeat: Infinity,
              }}

              className="
                mx-auto

                w-20
                h-20

                rounded-[26px]

                bg-emerald-500/[0.05]

                border
                border-emerald-500/10

                flex
                items-center
                justify-center
              "
            >

              <ClipboardList
                className="
                  w-9
                  h-9

                  text-emerald-500/50
                "
              />

            </motion.div>


            <p
              className="
                mt-6

                text-lg
                font-black

                text-zinc-300
              "
            >
              {loadErrors.live ? "Couldn't load live bookings" : "No Live Bookings"}
            </p>

            <p
              className="
                mt-2

                text-sm

                text-zinc-600
              "
            >
              {loadErrors.live ?? "There are currently no active bookings."}
            </p>

          </motion.div>

        ) : (

          filteredLiveBookings.map(
            (booking: any, index: number) => {

              const summary =
                getBookingSummary(booking);

              const avatar =
                getBookingAvatar(booking);

              const student = getStudentName(booking);

              const time =
                getBookingTime(booking);

              return (
                <motion.button
                  key={getBookingId(booking)}

                  type="button"

                  initial={{
                    opacity: 0,
                    x: -25,
                  }}

                  animate={{
                    opacity: 1,
                    x: 0,
                  }}

                  transition={{
                    delay: index * 0.06,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}

                  whileHover={{
                    scale: 1.012,
                    x: 4,
                  }}

                  whileTap={{
                    scale: 0.985,
                  }}

                  onClick={() => {
                    setSelectedLiveBooking(booking);
                    setShowLiveBookingDetails(true);
                  }}

                  className="
                    relative

                    w-full

                    overflow-hidden

                    rounded-[24px]

                    bg-gradient-to-r
                    from-zinc-900/75
                    via-zinc-900/55
                    to-zinc-950/80

                    border
                    border-zinc-800

                    p-4
                    sm:p-5

                    text-left

                    hover:border-emerald-400/40

                    hover:shadow-[0_20px_60px_rgba(16,185,129,.10)]

                    transition-all
                    duration-300

                    group
                  "
                >

                  {/* HOVER AURA */}

                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      bg-gradient-to-r
                      from-emerald-500/[0.08]
                      via-transparent
                      to-teal-500/[0.04]

                      transition-opacity
                      duration-500

                      pointer-events-none
                    "
                  />


                  {/* SHINE */}

                  <motion.div
                    initial={{
                      x: "-130%",
                    }}

                    whileHover={{
                      x: "130%",
                    }}

                    transition={{
                      duration: 0.8,
                      ease: "easeInOut",
                    }}

                    className="
                      absolute
                      top-0
                      bottom-0

                      w-1/3

                      bg-gradient-to-r
                      from-transparent
                      via-white/[0.04]
                      to-transparent

                      skew-x-[-20deg]

                      pointer-events-none
                    "
                  />


                  <div
                    className="
                      relative
                      z-10

                      flex
                      items-center

                      gap-4
                    "
                  >

                    {/* AVATAR */}

                    <motion.div
                      whileHover={{
                        scale: 1.08,
                        rotate: 3,
                      }}

                      className="
                        relative

                        w-14
                        h-14

                        shrink-0

                        rounded-2xl

                        overflow-hidden

                        bg-emerald-500/[0.08]

                        border
                        border-emerald-400/20

                        flex
                        items-center
                        justify-center

                        shadow-[0_0_25px_rgba(16,185,129,.08)]
                      "
                    >

                      {avatar ? (

                        <img
                          src={avatar}
                          alt=""
                          className="
                            w-full
                            h-full

                            object-cover
                          "
                        />

                      ) : (

                        <User
                          className="
                            w-6
                            h-6

                            text-emerald-400
                          "
                        />

                      )}

                      {/* ONLINE DOT */}

                      <motion.span
                        animate={{
                          scale: [1, 1.35, 1],
                        }}

                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                        }}

                        className="
                          absolute

                          right-0.5
                          bottom-0.5

                          w-3
                          h-3

                          rounded-full

                          bg-emerald-400

                          border-2
                          border-zinc-950

                          shadow-[0_0_10px_rgba(52,211,153,.8)]
                        "
                      />

                    </motion.div>


                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <h3
                          className="
                            text-base
                            sm:text-lg

                            font-black

                            text-white

                            truncate
                          "
                        >
                          {student}
                        </h3>


                        <span
                          className="
                            hidden
                            sm:inline-flex

                            px-2.5
                            py-1

                            rounded-full

                            bg-emerald-500/[0.08]

                            border
                            border-emerald-500/20

                            text-emerald-400

                            text-[9px]

                            font-black

                            tracking-wider
                          "
                        >
                          {getPhaseLabel(booking)}
                        </span>

                      </div>


                      <div className="mt-1">

                        <span
  className="
    text-sm
    font-bold
    text-emerald-400
  "
>
  {summary.title}
</span>

                      </div>


                      <div
                        className="
                          flex
                          items-center
                          gap-2

                          mt-2

                          text-xs
                          text-zinc-500
                        "
                      >

                        <Clock
                          className="
                            w-3.5
                            h-3.5

                            text-emerald-500/70
                          "
                        />

                        {time}

                      </div>

                    </div>


                    {/* RIGHT */}

                    <div
                      className="
                        hidden
                        sm:flex

                        flex-col
                        items-end

                        gap-2
                      "
                    >

                      <span
                        className="
                          text-[10px]

                          text-zinc-600

                          uppercase

                          tracking-wider
                        "
                      >
                        Started
                      </span>

                      <span
                        className="
                          text-xs

                          font-bold

                          text-zinc-300
                        "
                      >
                        {booking.startedAt ||
                          booking.actualStartTime ||
                          "Live"}
                      </span>

                    </div>


                    {/* ARROW */}

                    <motion.div
                      animate={{
                        x: [0, 3, 0],
                      }}

                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}

                      className="
                        w-9
                        h-9

                        shrink-0

                        rounded-xl

                        bg-zinc-800/60

                        border
                        border-zinc-800

                        flex
                        items-center
                        justify-center

                        text-emerald-400

                        group-hover:bg-emerald-500/10
                        group-hover:border-emerald-500/20

                        transition-all
                      "
                    >

                      <ChevronRight
                        className="w-5 h-5"
                      />

                    </motion.div>

                  </div>

                </motion.button>
              );
            }
          )

        )}

      </div>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <div
        className="
          relative
          z-10

          px-6
          sm:px-8

          py-4

          border-t
          border-zinc-800/70

          flex
          items-center
          justify-between
        "
      >

        <div
          className="
            flex
            items-center
            gap-2

            text-xs

            text-zinc-600
          "
        >

          <motion.span
            animate={{
              opacity: [0.4, 1, 0.4],
            }}

            transition={{
              duration: 2,
              repeat: Infinity,
            }}

            className="
              w-2
              h-2

              rounded-full

              bg-emerald-400
            "
          />

          Live updates every 10 seconds

        </div>


        <motion.button
          type="button"

          onClick={fetchLiveBookings}

          whileHover={{
            scale: 1.05,
          }}

          whileTap={{
            scale: 0.9,
          }}

          className="
            flex
            items-center
            gap-2

            text-xs
            font-bold

            text-zinc-400

            hover:text-emerald-400

            transition-colors
          "
        >

          <motion.span
            animate={{
              rotate: liveRefreshing
                ? 360
                : 0,
            }}

            transition={{
              duration: 0.7,
              ease: "linear",
            }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.span>

          Refresh

        </motion.button>

      </div>

    </motion.div>

  </div>
)}

{/* =========================================================
    LIVE BOOKING DETAILS
========================================================= */}

{showLiveBookingDetails && selectedLiveBooking && (
  <div
    className="
      fixed
      inset-0

      z-[240]

      bg-black/85
      backdrop-blur-2xl

      flex
      items-center
      justify-center

      p-4
      sm:p-6
    "
  >

    {/* BACKGROUND GLOW */}

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}

      className="
        absolute
        inset-0

        pointer-events-none
        overflow-hidden
      "
    >

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.55, 0.25],
        }}

        transition={{
          duration: 7,
          repeat: Infinity,
        }}

        className="
          absolute

          top-[5%]
          right-[10%]

          w-[380px]
          h-[380px]

          rounded-full

          bg-emerald-500/[0.08]

          blur-[130px]
        "
      />

    </motion.div>


    {/* MODAL */}

    <motion.div
      initial={{
        opacity: 0,
        scale: 0.88,
        y: 35,
      }}

      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}

      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}

      className="
        relative

        w-full
        max-w-[650px]

        max-h-[88vh]

        overflow-y-auto

        rounded-[32px]

        bg-gradient-to-br
        from-[#07100d]
        via-[#050807]
        to-[#030605]

        border
        border-emerald-500/20

        shadow-[0_0_100px_rgba(16,185,129,.15)]

        scrollbar-thin
        scrollbar-thumb-emerald-500/20
      "
    >

      {/* ===================================================
          CLOSE
      =================================================== */}

      <motion.button
        type="button"

        whileHover={{
          rotate: 90,
          scale: 1.08,
        }}

        whileTap={{
          scale: 0.9,
        }}

        onClick={() => {
          setShowLiveBookingDetails(false);
          setSelectedLiveBooking(null);
        }}

        className="
          absolute

          top-5
          right-5

          z-30

          w-10
          h-10

          rounded-xl

          bg-zinc-900/80

          border
          border-zinc-800

          text-zinc-500

          flex
          items-center
          justify-center

          hover:text-white
          hover:bg-emerald-500/10
          hover:border-emerald-500/30

          transition-all
        "
      >

        <X className="w-5 h-5" />

      </motion.button>


      <div className="p-6 sm:p-8">


        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <div className="flex items-center gap-4">

            {/* AVATAR */}

            <div
              className="
                relative

                w-16
                h-16

                rounded-2xl

                overflow-hidden

                bg-emerald-500/[0.08]

                border
                border-emerald-400/30

                flex
                items-center
                justify-center

                shadow-[0_0_30px_rgba(16,185,129,.12)]
              "
            >

              {getBookingAvatar(
                selectedLiveBooking
              ) ? (

                <img
                  src={getBookingAvatar(
                    selectedLiveBooking
                  )}

                  alt=""

                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

              ) : (

                <User
                  className="
                    w-7
                    h-7

                    text-emerald-400
                  "
                />

              )}

              <span
                className="
                  absolute

                  right-1
                  bottom-1

                  w-3
                  h-3

                  rounded-full

                  bg-emerald-400

                  border-2
                  border-zinc-950
                "
              />

            </div>


            <div>

              <div className="flex items-center gap-3">

                <h2
                  className="
                    text-2xl
                    sm:text-3xl

                    font-black

                    text-white
                  "
                >
                  {getStudentName(selectedLiveBooking)}
                </h2>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2

                  mt-2
                "
              >

                <motion.span
                  animate={{
                    scale: [1, 1.3, 1],
                  }}

                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                  }}

                  className="
                    w-2
                    h-2

                    rounded-full

                    bg-emerald-400

                    shadow-[0_0_10px_rgba(52,211,153,.8)]
                  "
                />

                <span
                  className="
                    text-[10px]

                    font-black

                    tracking-[0.15em]

                    text-emerald-400
                  "
                >
                  {getPhaseLabel(selectedLiveBooking)}
                </span>

              </div>

            </div>

          </div>

        </motion.div>


        {/* =================================================
            BOOKED ITEMS
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            delay: 0.1,
          }}

          className="mt-7"
        >

          <div className="mb-3">

            <h3
              className="
                text-lg
                font-black

                text-white
              "
            >
              Booked Items
            </h3>

            <p
              className="
                text-xs

                text-zinc-600

                mt-1
              "
            >
              Everything currently booked by this student
            </p>

          </div>


          <div className="space-y-3">

            {getLiveBookingItems(
              selectedLiveBooking
            ).map((item, index) => (

              <motion.div
                key={`${item.name}-${index}`}

                initial={{
                  opacity: 0,
                  x: -15,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                transition={{
                  delay: 0.15 + index * 0.08,
                }}

                whileHover={{
                  x: 4,
                }}

                className="
                  relative

                  overflow-hidden

                  rounded-2xl

                  bg-zinc-900/60

                  border
                  border-zinc-800

                  p-4

                  hover:border-emerald-500/25

                  transition-all
                "
              >

                <div className="flex items-center gap-4">

                  <div
                    className="
                      w-12
                      h-12

                      shrink-0

                      rounded-xl

                      bg-emerald-500/[0.07]

                      border
                      border-emerald-500/15

                      flex
                      items-center
                      justify-center
                    "
                  >

                    <GearIcon name={item.name} type={item.type} />

                  </div>


                  <div className="flex-1">

                    <p
                      className="
                        text-base

                        font-black

                        text-white
                      "
                    >
                      {item.name}
                    </p>

                    <p
                      className="
                        text-xs

                        text-zinc-600

                        mt-1
                      "
                    >
                      {item.type === "resource"
                        ? "Resource"
                        : `Equipment × ${
                            item.quantity || 1
                          }`}
                    </p>

                  </div>


                  {item.type === "gear" && (
                    <span
                      className="
                        px-2.5
                        py-1

                        rounded-full

                        bg-emerald-500/[0.06]

                        border
                        border-emerald-500/15

                        text-[9px]

                        font-black

                        text-emerald-400
                      "
                    >
                      GEAR
                    </span>
                  )}

                </div>

              </motion.div>

            ))}

          </div>

        </motion.div>


        {/* =================================================
            BOOKING INFO
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            delay: 0.2,
          }}

          className="
            mt-6

            grid
            grid-cols-2

            gap-3
          "
        >

          {/* TIME */}

          <div
            className="
              rounded-2xl

              bg-zinc-900/60

              border
              border-zinc-800

              p-4
            "
          >

            <Clock
              className="
                w-4
                h-4

                text-emerald-400

                mb-3
              "
            />

            <p
              className="
                text-[9px]

                uppercase

                tracking-[0.16em]

                text-zinc-600

                font-black
              "
            >
              Booking Time
            </p>

            <p
              className="
                text-sm

                font-bold

                text-white

                mt-2
              "
            >
              {getBookingTime(
                selectedLiveBooking
              )}
            </p>

          </div>


          {/* BOOKING TYPE */}

          <div
            className="
              rounded-2xl

              bg-zinc-900/60

              border
              border-zinc-800

              p-4
            "
          >

            <Timer
              className="
                w-4
                h-4

                text-emerald-400

                mb-3
              "
            />

            <p
              className="
                text-[9px]

                uppercase

                tracking-[0.16em]

                text-zinc-600

                font-black
              "
            >
              Booking Type
            </p>

            <p
              className="
                text-sm

                font-bold

                text-white

                mt-2
              "
            >
              {selectedLiveBooking.slotSystem ?? selectedLiveBooking.isSlotSystem ?? false ? (
              <span className="flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-400/15 border border-cyan-400/40 text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,.25)]">Slot</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold border border-zinc-800 text-zinc-600 opacity-40 blur-[1px]">Direct</span>
              </span>
            ) : (
              <span className="flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold border border-zinc-800 text-zinc-600 opacity-40 blur-[1px]">Slot</span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-400/15 border border-emerald-400/40 text-emerald-200 shadow-[0_0_14px_rgba(52,211,153,.25)]">Direct</span>
              </span>
            )}
            </p>

          </div>


          {/* BOOKING STATUS */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
            <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-600 font-black">
              Booking Status
            </p>
            <p className="text-sm font-bold text-white mt-2">
              {selectedLiveBooking.status === "return_requested"
                ? "Return requested"
                : selectedLiveBooking.phase === "ended_not_returned"
                  ? "Ended · not returned"
                  : "Ongoing"}
            </p>
          </div>

          {/* RETURN STATUS */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
            <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-600 font-black">
              Return Status
            </p>
            <p className="text-sm font-bold text-white mt-2">
              {selectedLiveBooking.returnRequestedAt
                ? "Requested"
                : selectedLiveBooking.returnDeclinedAt
                  ? "Declined"
                  : "Not requested"}
            </p>
            {selectedLiveBooking.returnDeclineNote && (
              <p className="text-xs text-amber-300 mt-2">
                {selectedLiveBooking.returnDeclineNote}
              </p>
            )}
          </div>

          {/* DATE */}

          <div
            className="
              rounded-2xl

              bg-zinc-900/60

              border
              border-zinc-800

              p-4
            "
          >

            <CalendarDays
              className="
                w-4
                h-4

                text-emerald-400

                mb-3
              "
            />

            <p
              className="
                text-[9px]

                uppercase

                tracking-[0.16em]

                text-zinc-600

                font-black
              "
            >
              Booking Date
            </p>

            <p
              className="
                text-sm

                font-bold

                text-white

                mt-2
              "
            >
              {getBookingDate(
                selectedLiveBooking
              )}
            </p>

          </div>


          {/* BOOKING ID */}

          <div
            className="
              rounded-2xl

              bg-zinc-900/60

              border
              border-zinc-800

              p-4
            "
          >

            <Tag
              className="
                w-4
                h-4

                text-emerald-400

                mb-3
              "
            />

            <p
              className="
                text-[9px]

                uppercase

                tracking-[0.16em]

                text-zinc-600

                font-black
              "
            >
              Booking ID
            </p>

            <p
              className="
                text-sm

                font-bold

                text-white

                mt-2

                truncate
              "
            >
              {getBookingId(
                selectedLiveBooking
              )}
            </p>

          </div>

        </motion.div>


        {/* =================================================
            STUDENT ID BUTTON
        ================================================= */}

        <motion.button
          type="button"

          initial={{
            opacity: 0,
            y: 15,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            delay: 0.3,
          }}

          whileHover={{
            scale: 1.015,
            y: -2,
          }}

          whileTap={{
            scale: 0.98,
          }}

          onClick={() =>
            setShowLiveIdCard(true)
          }

          className="
            group

            relative

            overflow-hidden

            w-full

            h-14

            mt-6

            rounded-2xl

            bg-emerald-500/[0.05]

            border
            border-emerald-500/20

            text-emerald-300

            font-bold

            hover:bg-emerald-500/[0.10]

            hover:border-emerald-400/40

            hover:shadow-[0_10px_40px_rgba(16,185,129,.10)]

            transition-all
          "
        >

          <div
            className="
              absolute
              inset-0

              -translate-x-full

              group-hover:translate-x-full

              transition-transform
              duration-700

              bg-gradient-to-r
              from-transparent
              via-emerald-300/[0.08]
              to-transparent
            "
          />

          <span
            className="
              relative
              z-10

              flex
              items-center
              justify-center

              gap-2
            "
          >

            <Eye className="w-5 h-5" />

            View Student ID Card

            <ChevronRight
              className="
                w-4
                h-4

                group-hover:translate-x-1

                transition-transform
              "
            />

          </span>

        </motion.button>

          {/* RETURN REQUESTED ICON: glows only when the student has requested a return */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <motion.div
              animate={
                selectedLiveBooking.returnRequestedAt
                  ? { scale: [1, 1.12, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 1.6, repeat: selectedLiveBooking.returnRequestedAt ? Infinity : 0 }}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-500 ${
                selectedLiveBooking.returnRequestedAt
                  ? "border-amber-400/40 bg-amber-400/15 text-amber-300 shadow-[0_0_22px_rgba(251,191,36,.7)]"
                  : "border-zinc-800 bg-zinc-950 text-zinc-700 opacity-50"
              }`}
            >
              <Undo2 className="w-5 h-5" />
            </motion.div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-600 font-black">Return</p>
              <p className={`text-sm font-bold mt-1 ${selectedLiveBooking.returnRequestedAt ? "text-amber-200" : "text-zinc-500"}`}>
                {selectedLiveBooking.returnRequestedAt
                  ? "Return requested by student"
                  : selectedLiveBooking.returnDeclinedAt
                    ? "Last return was declined"
                    : "No return requested"}
              </p>
            </div>
          </div>

          {showLiveIdCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowLiveIdCard(false)}
              className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-[28px] border border-zinc-800 bg-zinc-950 p-6"
              >
                <button
                  type="button"
                  onClick={() => setShowLiveIdCard(false)}
                  className="absolute right-4 top-4 text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-black">Student ID card</p>
                <h3 className="text-xl font-black text-white mt-1">{getStudentName(selectedLiveBooking)}</h3>
                <p className="text-xs text-zinc-500 mt-1">{selectedLiveBooking.user?.rollNo || "No college ID on file"}</p>
                <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-800 bg-black/40">
                  {selectedLiveBooking.user?.idCardPhoto ? (
                    <img
                      src={
                        String(selectedLiveBooking.user.idCardPhoto).startsWith("http")
                          ? selectedLiveBooking.user.idCardPhoto
                          : `http://localhost:5000${selectedLiveBooking.user.idCardPhoto}`
                      }
                      alt="Uploaded student ID card"
                      className="w-full max-h-[60vh] object-contain"
                    />
                  ) : (
                    <p className="p-10 text-center text-sm text-zinc-500">This student has not uploaded an ID card photo.</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}


        {/* =================================================
            LIVE STATUS
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
          }}

          animate={{
            opacity: 1,
          }}

          transition={{
            delay: 0.4,
          }}

          className="
            mt-4

            rounded-2xl

            bg-emerald-500/[0.035]

            border
            border-emerald-500/10

            px-4
            py-3

            flex
            items-center
            gap-3
          "
        >

          <motion.span
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 1, 0.5],
            }}

            transition={{
              duration: 1.8,
              repeat: Infinity,
            }}

            className="
              w-2.5
              h-2.5

              rounded-full

              bg-emerald-400

              shadow-[0_0_12px_rgba(52,211,153,.8)]
            "
          />

          <div>

            <p
              className="
                text-xs

                font-bold

                text-emerald-300
              "
            >
              {selectedLiveBooking.phase === "return_requested"
  ? "Return requested"
  : selectedLiveBooking.phase === "ended_not_returned"
    ? "Ended · not returned"
    : "Booking currently in progress"}
            </p>

            <p
              className="
                text-[10px]

                text-zinc-600

                mt-0.5
              "
            >
              {selectedLiveBooking.phase === "return_requested"
  ? "Waiting for staff to verify the equipment."
  : selectedLiveBooking.phase === "ended_not_returned"
    ? "The time has passed, but the equipment is still with the student."
    : "This booking is actively using the selected resource."}
            </p>

          </div>

        </motion.div>

      </div>

    </motion.div>

  </div>
)}






        {/* QUICK ACTIONS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

<button
  onClick={() => setShowLiveBookings(true)}
  className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-emerald-500 transition-all hover:-translate-y-1"
>
  <div className="mb-4 flex justify-center">
  <ClipboardList 
    className="
    w-10 h-10
    text-emerald-400
    drop-shadow-[0_0_12px_rgba(16,185,129,.8)]
    text-center"
  />
</div>

  <h3 className="font-black text-xl">
    Live Bookings
  </h3>

  <p className="text-zinc-500 text-sm mt-2">
    View current bookings
  </p>
</button>

<button
  onClick={() => setShowReturnRequests(true)}
  className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-pink-800 transition-all hover:-translate-y-1"
>
  <div className="mb-4 flex justify-center">
  <ClipboardCheck
    className="
    w-10 h-10
    text-pink-400
    drop-shadow-[0_0_12px_rgba(249,115,22,.8)]
    "
  />
</div>

  <h3 className="font-black text-xl">
    Return Requests
  </h3>

  <p className="text-zinc-500 text-sm mt-2">
    Approve equipment returns
  </p>
</button>

  <button
onClick={()=>setShowAnnouncement(true)}
className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-yellow-500 transition-all hover:-translate-y-1"
>
    <div className="mb-4 flex justify-center">
  <Megaphone
    className="
    w-10 h-10
    text-orange-400
    drop-shadow-[0_0_12px_rgba(250,204,21,.8)]
    "
  />
</div>
    <h3 className="font-black text-xl">Announcement</h3>
    <p className="text-zinc-500 text-sm mt-2">
      Publish important notices
    </p>
  </button>

  <button
onClick={()=>setShowRequests(true)}
className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-yellow-500 transition-all hover:-translate-y-1"
>
    <div className="mb-4 flex justify-center">
  <Bell
    className="
    w-10
    h-10
    text-yellow-400
    drop-shadow-[0_0_12px_rgba(250,204,21,.8)]
    "
  />
</div>
    <h3 className="font-black text-xl flex items-center justify-center gap-2">
      Requests ({unreadRequests})
      {unreadRequests > 0 && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-400" />
        </span>
      )}
    </h3>
    <p className="text-zinc-500 text-sm mt-2">
      {unreadRequests > 0 ? `${unreadRequests} unread` : "All caught up"}
    </p>
  </button>

</div>

        {/* SEARCH */}

        <div className="mb-10">

          <input
type="text"
value={search}
onChange={(e)=>
setSearch(e.target.value)
}
placeholder="Search sports, resources, staff..."
            className="
              w-full
              bg-zinc-900
              border
              border-zinc-800
              rounded-[24px]
              p-5
              outline-none
            "
          />
        
        </div>

        <h2 className="text-4xl font-black mb-8">
          Sports
        </h2>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {sports
  .filter((sport) =>
    sport.name.toLowerCase().includes(search.toLowerCase())
  )
  .map((sport) => (
              <div
                key={sport.id}
                className="
                  group
                  bg-gradient-to-br
                  from-zinc-900
                  to-zinc-950
                  border
                  border-zinc-800
                  rounded-[32px]
                  overflow-hidden
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:border-emerald-500/30
                  hover:shadow-[0_0_40px_rgba(16,185,129,0.12)]
                "
              >
                <div className="p-6">
                  <div className="flex justify-between mb-6">
                    <h3 className="text-4xl font-black">
                      {sport.name}
                    </h3>
                    <div className="text-green-400 font-bold">
                      ● Active
                    </div>
                  </div>

                  <p className="text-zinc-400 mb-5">
                    Resource Type : {sport.resourceType || "Court"}
                  </p>

                  <div className="grid grid-cols-3 gap-4 my-7">

  <div className="bg-zinc-800/40 rounded-2xl p-4 text-center">

    <p className="text-3xl font-black text-sky-400">
      {sport.resourceUnits?.length || 0}
    </p>

    <p className="text-xs uppercase tracking-wider text-zinc-500 mt-1">
      {sport.resourceType || "Courts"}
    </p>

  </div>

  <div className="bg-zinc-800/40 rounded-2xl p-4 text-center">

    <p className="text-3xl font-black text-emerald-400">
      {sport.gears?.length || 0}
    </p>

    <p className="text-xs uppercase tracking-wider text-zinc-500 mt-1">
      Gears
    </p>

  </div>

  <div className="bg-zinc-800/40 rounded-2xl p-4 text-center">

    <p className="text-3xl font-black text-violet-400">
      {sport.slots?.length || 0}
    </p>

    <p className="text-xs uppercase tracking-wider text-zinc-500 mt-1">
      Slots
    </p>

  </div>

</div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Slot System</span>
                      <span className="
                        px-3 py-1
                        rounded-full
                        bg-emerald-500/10
                        text-emerald-400
                        border border-emerald-500/20
                        text-sm font-semibold
                      ">
                        {sport.hasSlotSystem ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Team Booking</span>
                      <span className="
                        px-3 py-1
                        rounded-full
                        bg-sky-500/10
                        text-sky-400
                        border border-sky-500/20
                        text-sm font-semibold
                      ">
                        {sport.teamReservationEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Maintenance</span>
                      <span className="
                        px-3 py-1
                        rounded-full
                        bg-orange-500/10
                        text-orange-400
                        border border-orange-500/20
                        text-sm font-semibold
                      ">
                        {sport.maintenance ? "Active" : "Off"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 p-6 flex gap-4 mt-5">
                    <button
  onClick={() => {
    setSelectedSport(sport);
    setShowManageSport(true);
  }}
  className="
    group
    relative

    flex-1
    h-16

    overflow-hidden
    rounded-2xl

    bg-zinc-900
    border
    border-zinc-700

    flex
    items-center
    justify-center

    transition-all
    duration-300
    
    transform-gpu

    hover:ring-1
hover:ring-emerald-500/30

    hover:border-emerald-500/50
hover:shadow-[0_10px_35px_rgba(16,185,129,.18)]
    hover:-translate-y-[6px]
    active:scale-[0.98]
    hover:scale-[1.02]
  "
>

  {/* Shine */}
  <div
    className="
    absolute
    inset-0
    -translate-x-full
    group-hover:translate-x-full
    transition-transform
    duration-1000

    bg-gradient-to-r
    from-transparent
    via-white/10
    to-transparent
    "
  />

  <div
  className="
  relative
  z-10

  flex
  items-center
  justify-center
  gap-3
  "
>

  <span
    className="
    ml-2
    text-[20px]

    transition-all
    duration-700

    text-zinc-300

    group-hover:text-emerald-400
    group-hover:rotate-[180deg]
    group-hover:scale-125

    drop-shadow-[0_0_0px_rgba(16,185,129,0)]
    group-hover:drop-shadow-[0_0_14px_rgba(16,185,129,.9)]
    "
  >
    ⚙
  </span>

  <span
    className="
    text-white
    font-extrabold
    text-[14px]
    tracking-wide

    transition-colors
    duration-500

    group-hover:text-white
    "
  >
    Manage Sport
  </span>

</div>

</button>

<button

  onClick={() => deleteSport(sport.id)}
  className="
    flex-1
    bg-red-500/10
    hover:bg-red-500/20
    text-red-400
    border border-red-500/20
    py-4
    rounded-2xl
    font-black
    transition-all
    hover:scale-[1.02]
  "
>
  🗑 Delete
</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      

</div>

























































{showAnnouncement && (

<div
className="
fixed
inset-0
z-[250]
bg-black/80
backdrop-blur-xl
flex
items-center
justify-center
"
>

<motion.div

initial={{ opacity:0, scale:.92, y:40 }}

animate={{ opacity:1, scale:1, y:0 }}

exit={{ opacity:0 }}

transition={{
duration:.35,
ease:[0.16,1,0.3,1]
}}

className="
relative
w-[900px]
max-h-[90vh]
overflow-hidden
rounded-[38px]
bg-gradient-to-br
from-zinc-950
via-black
to-zinc-950
border
border-orange-500/20
shadow-[0_0_80px_rgba(249,115,22,.18)]
"

>

<div
className="
absolute
inset-0
bg-gradient-to-br
from-orange-500/5
via-transparent
to-yellow-500/5
pointer-events-none
"
/>

<button
type="button"
onClick={()=>setShowAnnouncement(false)}

className="
absolute
top-6
right-6
w-14
h-14
rounded-2xl
bg-zinc-900
border
border-zinc-800
hover:bg-red-500/10
hover:border-red-500/40
hover:rotate-90
transition-all
duration-300
"

>

✕

</button>

<div className="px-10 pt-10">

<div className="flex justify-between items-center">

<div>

<h2
className="
text-5xl
font-black
bg-gradient-to-r
from-yellow-300
via-orange-400
to-orange-500
bg-clip-text
text-transparent
"
>

📢 Announcements

</h2>

<p className="text-zinc-500 mt-2">

Manage every announcement from here

</p>

</div>

<button
type="button"
onClick={()=>setShowCreateAnnouncement(true)}

className="
group
relative
overflow-hidden
px-8
h-14
rounded-2xl
font-black
bg-gradient-to-r
from-yellow-400
via-orange-500
to-orange-600
text-black
hover:scale-105
transition-all
shadow-[0_0_30px_rgba(249,115,22,.35)]
"

>

<div
className="
absolute
inset-0
-translate-x-full
group-hover:translate-x-full
transition-transform
duration-1000
bg-gradient-to-r
from-transparent
via-white/20
to-transparent
"
/>

<span className="relative z-10">

＋ New Announcement

</span>

</button>

</div>

</div>

<div
className="
mt-10
px-8
pb-8
space-y-6
overflow-y-auto
max-h-[65vh]
"
>

{announcements.length===0 ? (

<div className="text-center py-20">

<div className="text-7xl">

📢

</div>

<h3 className="text-3xl font-black mt-6">

{loadErrors.notices ? "Couldn't load announcements" : "No announcements yet"}

</h3>

<p className="text-zinc-500 mt-2">

Create your first announcement.

</p>

</div>

) : (
  announcements.map((item,index)=>(

<motion.div

key={item.id}

initial={{
opacity:0,
y:30
}}

animate={{
opacity:1,
y:0
}}

transition={{
delay:index*.08
}}

className="
group
relative
overflow-hidden

rounded-[34px]

border
border-orange-500/15

bg-gradient-to-br
from-zinc-900
to-zinc-950

p-8

hover:border-orange-400/40

hover:-translate-y-1

hover:shadow-[0_0_40px_rgba(249,115,22,.15)]

transition-all
duration-300
"

>

<div
className="
absolute
inset-0

opacity-0

group-hover:opacity-100

transition

bg-gradient-to-r
from-orange-500/5
via-transparent
to-yellow-500/5
"
/>

<div className="relative flex justify-between">

<div className="flex-1">

<div className="flex items-center gap-5">

<div
className="
w-16
h-16

rounded-[22px]

bg-gradient-to-br
from-orange-500/20
to-yellow-500/20

border
border-orange-500/20

flex
items-center
justify-center

shadow-[0_0_30px_rgba(249,115,22,.15)]
"
>

<span
className="
text-3xl

drop-shadow-[0_0_14px_rgba(249,115,22,.8)]
"
>

📣

</span>

</div>

<div>

<h3
className="
text-3xl
font-black
tracking-tight

group-hover:text-orange-300

transition-colors
duration-300
"
>

{item.title}

</h3>

<p
className="
text-zinc-500
mt-1
"
>

Announcement

</p>

</div>

</div>

<p
className="
mt-8

text-[17px]

leading-8

text-zinc-300
"
>

{item.message}

</p>

<div
className="
flex
flex-wrap

gap-4

mt-8
"
>

<div
className="
px-5
py-3

rounded-full

bg-orange-500/10

border
border-orange-500/20

text-orange-300

font-bold

text-sm
"
>

👁 Audience : {item.audience === "staff_admin" ? "Staff & Admin" : "Everyone"}

</div>

<div
className="
px-5
py-3

rounded-full

bg-zinc-800

border
border-zinc-700

text-zinc-400

text-sm
font-semibold
"
>

🕒 {item.createdAt}

</div>

</div>

</div>

<div className="pl-8">

<button

onClick={async () => {
  try {
    await authFetch(`http://localhost:5000/notices/${item.id}`, { method: 'DELETE' });
    setAnnouncements((prev) => prev.filter((a) => a.id !== item.id));
  } catch (err) {
    console.error('Failed to delete announcement', err);
    // fallback to local removal
    setAnnouncements((prev) => prev.filter((a) => a.id !== item.id));
  }
}}

className="
group

relative

w-16
h-16

rounded-[22px]

bg-red-500/10

border
border-red-500/15

text-red-400

hover:bg-red-500

hover:text-white

hover:scale-110

hover:rotate-6

transition-all
duration-300
"

>

<div
className="
absolute
inset-0

rounded-[22px]

bg-gradient-to-br
from-white/10
to-transparent

opacity-0

group-hover:opacity-100

transition
"
/>

<span
className="
relative

text-2xl
"
>

🗑

</span>

</button>

</div>

</div>

</motion.div>

))

)}

</div>

{/* Bottom Glow */}

<div
className="
absolute
bottom-0
left-1/2
-translate-x-1/2
w-[70%]
h-16
bg-orange-500/20
blur-3xl
pointer-events-none
animate-pulse
"
/>

</motion.div>

</div>

)}

{/* ================= CREATE ANNOUNCEMENT ================= */}

{showCreateAnnouncement && (

<div
className="
fixed
inset-0
z-[260]
bg-black/85
backdrop-blur-xl
flex
items-center
justify-center
"
>

<motion.div

initial={{opacity:0,scale:.9,y:40}}

animate={{opacity:1,scale:1,y:0}}

exit={{opacity:0,scale:.9,y:20}}

transition={{
duration:.35,
ease:[0.16,1,0.3,1]
}}

className="
relative

w-[760px]

rounded-[36px]

overflow-hidden

bg-gradient-to-br
from-zinc-950
via-black
to-zinc-950

border
border-orange-500/20

shadow-[0_0_80px_rgba(249,115,22,.20)]
"

>

<div
className="
absolute
inset-0
pointer-events-none
bg-gradient-to-br
from-orange-500/5
via-transparent
to-yellow-500/5
"
/>

<button
onClick={()=>{
setShowCreateAnnouncement(false);
setAnnouncementTitle("");
setAnnouncementMessage("");
setAnnouncementAudience("Everyone");
setAnnouncementExpiry("");
}}

className="
absolute
z-30
top-6
right-6

w-14
h-14

rounded-2xl

flex
items-center
justify-center

bg-zinc-900

border
border-zinc-800

text-zinc-400

hover:text-white
hover:bg-red-500/15
hover:border-red-500/40
hover:rotate-90
hover:scale-110

transition-all
duration-300
"
>
✕
</button>

<div
className="
relative
z-20

p-10

max-h-[85vh]

overflow-y-auto

pr-5

scrollbar-thin
scrollbar-thumb-orange-500/40
scrollbar-track-transparent
"
>

<h2
className="
text-4xl
font-black

bg-gradient-to-r
from-yellow-300
via-orange-400
to-orange-500

bg-clip-text
text-transparent
"
>

Create Announcement

</h2>

<p className="text-zinc-500 mt-2 mb-8">

Publish a new announcement

</p>

<div className="space-y-7">

{/* Title */}

<div>

<label className="block mb-3 font-bold text-orange-300">
Title
</label>

<input
type="text"
value={announcementTitle}
maxLength={120}
onChange={(e)=>setAnnouncementTitle(e.target.value)}
placeholder="e.g. Court 2 closed on Sunday"
className="
w-full
h-16
rounded-[22px]
bg-zinc-900/80
border
border-zinc-800
px-6
outline-none
transition-all
duration-300
focus:border-orange-500
focus:shadow-[0_0_30px_rgba(249,115,22,.18)]
"
/>

<div className="text-right text-zinc-500 text-sm mt-2">
{announcementTitle.length}/120
</div>

</div>

{/* Message */}

<div>

<label
className="
block
mb-3
font-bold
text-orange-300
"
>

Message

</label>

<textarea

value={announcementMessage}

onChange={(e)=>
setAnnouncementMessage(e.target.value)
}

rows={7}

placeholder="Write your announcement..."

className="
w-full

rounded-[24px]

bg-zinc-900/80

border
border-zinc-800

p-6

resize-none

outline-none

transition-all
duration-300

focus:border-orange-500
focus:shadow-[0_0_35px_rgba(249,115,22,.20)]
"
/>

<div
className="
text-right
text-zinc-500
text-sm
mt-2
"
>

{announcementMessage.length} characters

</div>

</div>


{/* Audience */}

<div>

<label className="block mb-4 font-bold text-orange-300">
Visible To
</label>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

{[
{
value:"everyone",
title:"Everyone",
icon:"🌍",
desc:"Students, Staff & Admin"
},
{
value:"staff_admin",
title:"Staff & Admin",
icon:"🛡",
desc:"Only staff and admin. Students never see it."
}
].map((option)=>{
const selected = announcementAudience===option.value;
return (
<motion.button
key={option.value}
type="button"
whileHover={{ y:-4 }}
whileTap={{ scale:.98 }}
aria-pressed={selected}
onClick={()=>setAnnouncementAudience(option.value)}
className={`
group
relative
overflow-hidden
rounded-[26px]
border
p-6
text-left
transition-colors
duration-300
${
selected
? "border-orange-500 bg-orange-500/10 shadow-[0_0_35px_rgba(249,115,22,.25)]"
: "border-zinc-800 bg-zinc-900/70 hover:border-orange-500/30"
}
`}
>

<div
className="
absolute
inset-0
bg-gradient-to-br
from-orange-500/5
via-transparent
to-yellow-500/5
opacity-0
group-hover:opacity-100
transition
"
/>

{selected && (
<motion.span
initial={{ scale:0 }}
animate={{ scale:1 }}
transition={{ type:"spring", stiffness:500, damping:22 }}
className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-sm font-black text-black"
>
✓
</motion.span>
)}

<div className="relative">

<div
className="
text-5xl
mb-4
transition-transform
duration-300
group-hover:scale-110
"
>
{option.icon}
</div>

<h3 className="text-xl font-black">
{option.title}
</h3>

<p className="mt-2 text-zinc-500 text-sm leading-6">
{option.desc}
</p>

</div>

</motion.button>
);
})}

</div>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-5">

<div>

<label className="block mb-3 font-bold text-orange-300">
Type
</label>

<select
value={announcementType}
onChange={(e)=>setAnnouncementType(e.target.value)}
className="w-full h-16 rounded-[22px] bg-zinc-900 border border-zinc-800 px-6 outline-none transition-all duration-300 focus:border-orange-500 focus:shadow-[0_0_30px_rgba(249,115,22,.18)]"
>
{["announcement","general","event","important","sport","maintenance"].map((type)=>(
<option key={type} value={type}>
{type.charAt(0).toUpperCase()+type.slice(1)}
</option>
))}
</select>

</div>

<div>

<label className="block mb-3 font-bold text-orange-300">
Sport (optional)
</label>

<select
value={announcementSportId}
onChange={(e)=>setAnnouncementSportId(e.target.value)}
className="w-full h-16 rounded-[22px] bg-zinc-900 border border-zinc-800 px-6 outline-none transition-all duration-300 focus:border-orange-500 focus:shadow-[0_0_30px_rgba(249,115,22,.18)]"
>
<option value="">All sports</option>
{sports.map((sport:any)=>(
<option key={sport.id} value={String(sport.id)}>
{sport.name}
</option>
))}
</select>

</div>

</div>

{/* Expiry */}

<div>

<label className="block mb-3 font-bold text-orange-300">
Expires (optional)
</label>

<input
type="datetime-local"
value={announcementExpiry}
onChange={(e)=>setAnnouncementExpiry(e.target.value)}
className="w-full h-16 rounded-[22px] bg-zinc-900 border border-zinc-800 px-6 outline-none transition-all duration-300 focus:border-orange-500 focus:shadow-[0_0_30px_rgba(249,115,22,.18)]"
/>

<p className="mt-2 text-sm text-zinc-500">
Leave empty to keep it visible until you delete it. Expired announcements hide automatically.
</p>

</div>

{announcementError && (
<motion.div
role="alert"
initial={{ opacity:0, y:-6 }}
animate={{ opacity:1, y:0 }}
className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-300"
>
{announcementError}
</motion.div>
)}

{/* Publish Button */}

<button

onClick={async () => {
  if (announcementSubmitting) return;

  const title = announcementTitle.trim();
  const message = announcementMessage.trim();

  if (!title) {
    setAnnouncementError("Please enter a title.");
    return;
  }
  if (!message) {
    setAnnouncementError("Please write a message.");
    return;
  }

  let expiresAt: string | undefined;
  if (announcementExpiry) {
    const expiryDate = new Date(announcementExpiry);
    if (Number.isNaN(expiryDate.getTime()) || expiryDate.getTime() <= Date.now()) {
      setAnnouncementError("Expiry must be a future date and time.");
      return;
    }
    expiresAt = expiryDate.toISOString();
  }

  setAnnouncementError("");
  setAnnouncementSubmitting(true);

  try {
    const res = await authFetch("http://localhost:5000/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        message,
        audience: announcementAudience,
        type: announcementType,
        sportId: announcementSportId || null,
        expiresAt,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setAnnouncementError(data?.message || "Could not publish the announcement.");
      return;
    }

    setAnnouncements((prev) => [data, ...prev]);
    setAnnouncementTitle("");
    setAnnouncementMessage("");
    setAnnouncementAudience("everyone");
    setAnnouncementType("announcement");
    setAnnouncementSportId("");
    setAnnouncementExpiry("");
    setShowCreateAnnouncement(false);
  } catch (err) {
    console.error("Failed to create announcement", err);
    setAnnouncementError("Could not reach the server. Check that the backend is running and try again.");
  } finally {
    setAnnouncementSubmitting(false);
  }
}}

disabled={announcementSubmitting}

className="
relative

group

overflow-hidden

mt-10

w-full
h-16

rounded-[24px]

bg-gradient-to-r
from-yellow-400
via-orange-500
to-orange-600

text-black

font-black
text-xl

shadow-[0_0_40px_rgba(249,115,22,.35)]

hover:scale-[1.02]
active:scale-[.98]

transition-all
duration-300
"

>

<div
className="
absolute
inset-0

-translate-x-full

group-hover:translate-x-full

transition-transform
duration-[1200ms]

bg-gradient-to-r
from-transparent
via-white/25
to-transparent
"
/>

<span
className="
relative
z-10

flex
items-center
justify-center
gap-3
"
>

<span
className="
text-2xl

group-hover:rotate-12
group-hover:scale-125

transition-all
"
>

🚀

</span>

{announcementSubmitting ? "Publishing..." : "Publish Announcement"}

</span>

</button>

</div>










</div>






<div
className="
absolute

bottom-0
left-1/2

-translate-x-1/2

w-[75%]
h-14

bg-orange-500/20

blur-3xl

pointer-events-none

animate-pulse
"
/>

</motion.div>

</div>

)}











<AnonymousRequestsModal open={showRequests} onClose={() => { setShowRequests(false); }} />




{showRenameModal && (

<div
className="
fixed inset-0
z-[100]
bg-black/80
animate-[fadeIn_.2s_ease]
backdrop-blur-md
flex
items-center
justify-center
"
>

<div
className="
relative
w-[520px]
overflow-hidden
bg-gradient-to-br
from-zinc-900
via-black
to-zinc-950
border
border-emerald-500/20
rounded-[32px]
px-8 py-6
shadow-[0_0_60px_rgba(16,185,129,0.15)]
animate-[fadeUp_.25s_ease]
"
>
<button
  onClick={() => setShowRenameModal(false)}
  className="
  absolute
  top-5
  right-5
  w-12
  h-12
  rounded-2xl
  flex
  items-center
  justify-center
  bg-zinc-900/80
  border
  border-zinc-800
  text-zinc-400
  hover:text-white
  hover:border-red-500/40
  hover:bg-red-500/10
  hover:rotate-90
  hover:scale-110
  transition-all
  duration-300
  backdrop-blur-xl
  z-20
  "
>
  ✕
</button>
<div className="mb-8">

  <div className="flex items-center gap-4 mb-3">

    <div
className="
relative

w-16
h-16

rounded-[24px]

bg-gradient-to-br
from-emerald-500/15
to-cyan-500/15

border
border-emerald-500/20

flex
items-center
justify-center

shadow-[0_0_30px_rgba(16,185,129,0.15)]

overflow-hidden
"
>

<div
className="
absolute
inset-0

bg-gradient-to-br
from-emerald-400/10
to-cyan-400/10

animate-pulse
"
/>

<span
className="
relative
z-10

text-3xl

drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]
"
>
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  className="
  w-8
  h-8
  text-emerald-400
  drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]
  "
>
  <path d="M12 20h9"/>
  <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
</svg>
</span>

</div>

    <div>

      <h3
className="
text-3xl
font-black
tracking-tight

bg-gradient-to-r
from-white
via-emerald-200
to-cyan-300

bg-clip-text
text-transparent

animate-[fadeUp_.4s_ease]
"
>
Rename Resource
</h3>

      <p className="text-zinc-500 text-sm">
        Update the resource display name
      </p>

    </div>

  </div>

</div>



<div className="relative mb-8">

  <span
  className="
  absolute
  left-5
  top-1/2
  -translate-y-1/2
  z-10
  "
>
  <div
    className="
    w-10
    h-10

    rounded-2xl

    bg-gradient-to-br
    from-emerald-500/15
    to-cyan-500/15

    border
    border-emerald-500/20

    flex
    items-center
    justify-center

    shadow-[0_0_20px_rgba(16,185,129,0.15)]
    "
  >
    <span
  className="
  text-[28px]
  drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]
  "
>
{getResourceIcon()}
</span>
  </div>
</span>

  <input
    value={newResourceName}
    onChange={(e)=>
      setNewResourceName(e.target.value)
    }
    
    maxLength={50}
    placeholder="Enter new resource name..."
    className="
    w-full
    h-20

    pl-20
    pr-20

    bg-black/80

    border
    border-zinc-800

    rounded-[24px]

    text-xl

    outline-none

    transition-all
    duration-300

    focus:border-emerald-500
    focus:shadow-[0_0_30px_rgba(16,185,129,0.25)]
    "
  />

  <span
    className="
    absolute
    right-5
    top-1/2
    -translate-y-1/2

    text-zinc-400 leading-6
    text-sm
    "
  >
    {newResourceName.length}/50
  </span>

</div>

<button
  onClick={() => {
    if (selectedResourceIndex === null) return;

    const trimmed = newResourceName.trim();
    if (!trimmed) return;

    setResourceUnits((prev) =>
      prev.map((resource, index) =>
        index === selectedResourceIndex ? { ...resource, name: trimmed } : resource
      )
    );

    setShowRenameModal(false);
    setNewResourceName("");
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  }}
  
  className="
  relative
  overflow-hidden
  group
  w-full
  h-16
  rounded-[20px]

  font-black
  text-xl
  text-white

  bg-gradient-to-r
  from-emerald-500
  via-green-500
  to-lime-400

  shadow-[0_0_40px_rgba(132,204,22,0.35)]

  transition-all
  duration-500

  hover:scale-[1.04]
  hover:-translate-y-1
  hover:shadow-[0_0_70px_rgba(132,204,22,0.55)]

  active:scale-[0.97]
  "
>

  <div
    className="
    absolute
    inset-0
    -translate-x-full
    group-hover:translate-x-full
    transition-transform
    duration-[1200ms]
    bg-gradient-to-r
    from-transparent
    via-white/20
    to-transparent
    "
  />

  <span
    className="
    relative
    z-10
    flex
    items-center
    justify-center
    gap-3
    "
  >
    <span
      className="
      text-2xl
      transition-all
      duration-300
      group-hover:rotate-12
      group-hover:scale-125
      "
    >
      ✨
    </span>

    Save Changes

  </span>

</button>
<div
  className="
  absolute
  bottom-0
  left-1/2
  -translate-x-1/2

  w-[70%]
  h-10

  bg-emerald-500/20
  blur-3xl

  animate-pulse
  pointer-events-none
  "
/>
<div
className="
absolute
inset-0
rounded-[32px]
bg-gradient-to-br
from-emerald-500/5
via-transparent
to-cyan-500/5
pointer-events-none
"
/>
</div>

</div>

)}
{showSuccessToast && (

<div
className="
fixed
bottom-8
right-8

z-[200]

bg-zinc-950

border
border-emerald-500/20

rounded-[24px]

px-6
py-5

shadow-[0_0_40px_rgba(16,185,129,0.2)]

animate-[fadeUp_.3s_ease]
"
>

<div className="flex items-center gap-4">

<div
className="
w-12
h-12

rounded-full

bg-emerald-500

flex
items-center
justify-center

text-black
font-black
"
>
✓
</div>

<div>

<h4 className="font-bold">
Resource Updated
</h4>

<p className="text-zinc-500 text-sm">
Changes saved successfully
</p>

</div>

</div>

</div>

)}
{showResourceTypeModal && (

<div
className="
fixed
inset-0
z-[150]
bg-black/80
backdrop-blur-xl
flex
items-center
justify-center
"
>

<div
className="
relative
w-[620px]
bg-zinc-950
border
border-emerald-500/20
rounded-[36px]
p-10
shadow-[0_0_80px_rgba(16,185,129,.12)]
animate-[fadeUp_.35s_cubic-bezier(.16,1,.3,1)]
"
>

<button
onClick={() =>
setShowResourceTypeModal(false)
}
className="
absolute
top-5
right-5
w-12
h-12
rounded-2xl
border
border-zinc-800
bg-zinc-900/80
text-zinc-400
hover:text-white
hover:rotate-90
hover:scale-110
transition-all
duration-300
"
>
✕
</button>

<h3 className="text-4xl font-black">
Select Resource Type
</h3>

<p className="text-zinc-500 mt-2 mb-8">
Choose the type of resource
</p>

<div className="space-y-5">

{[
"Court",
"Table",
"Board",
"Lane",
"Track",
"Pool"
].map((type) => (

<label
key={type}
className="
flex
items-center
gap-4
cursor-pointer
text-xl
font-semibold
hover:text-emerald-400
transition-all
duration-300
"
>

<input
type="radio"
name="resourceType"
checked={resourceType === type}
onChange={() =>
setResourceType(type)
}
className="
w-6
h-6
accent-emerald-500
cursor-pointer
"
/>

<span>
{type}
</span>

</label>

))}

<div className="border-t border-zinc-800 pt-5">

<label
className="
flex
items-center
gap-4
cursor-pointer
text-xl
font-semibold
text-emerald-400
"
>

<input
type="radio"
name="resourceType"
checked={resourceType === "Custom"}
onChange={() =>
setResourceType("Custom")
}
className="
w-6
h-6
accent-emerald-500
cursor-pointer
"
/>

<span>
+ Custom
</span>

</label>

</div>

{resourceType === "Custom" && (

<input
value={customResourceType}
onChange={(e) =>
setCustomResourceType(
e.target.value
)
}
placeholder="Enter custom resource type"
className="
mt-4
w-full
h-14
rounded-2xl
bg-black
border
border-zinc-800
px-5
outline-none
focus:border-emerald-500
transition-all
"
/>

)}

<button
onClick={() => {

if (
resourceType === "Custom" &&
!customResourceType.trim()
) {
alert("Enter custom resource type");
return;
}

setShowResourceTypeModal(false);

}}
className="
mt-8
w-full
h-16
rounded-2xl
bg-gradient-to-r
from-emerald-500
to-emerald-400
text-black
font-black
text-lg
hover:scale-[1.02]
active:scale-[0.98]
transition-all
duration-300
shadow-[0_0_40px_rgba(16,185,129,.3)]
"
>
✓ Confirm Selection
</button>

</div>

</div>

</div>

)}
{showDurationModal && (

<div
className="
fixed inset-0
z-[150]
bg-black/80
backdrop-blur-xl
flex
items-center
justify-center
"
>

<div
className="
relative
w-[560px]
bg-zinc-950
border
border-emerald-500/20
rounded-[36px]
p-10
shadow-[0_0_80px_rgba(16,185,129,.12)]
animate-[fadeUp_.35s_cubic-bezier(.16,1,.3,1)]
"
>

<button
onClick={() =>
setShowDurationModal(false)
}
className="
absolute
top-5
right-5
w-12
h-12
rounded-2xl
border
border-zinc-800
text-zinc-400
hover:text-white
hover:rotate-90
hover:scale-110
transition-all
duration-300
"
>
✕
</button>

<h3 className="text-4xl font-black">
Slot Duration
</h3>

<p className="text-zinc-500 mt-2 mb-8">
Enter duration in minutes
</p>

<div
className="
h-16
rounded-2xl
border
border-emerald-500/30
bg-black
px-5
flex
items-center
justify-between
"
>

<input
type="number"
value={slotDurationMinutes}
onChange={(e)=>
setSlotDurationMinutes(
Number(e.target.value)
)
}
className="
bg-transparent
outline-none
text-xl
w-full
"
/>

<span className="text-zinc-500">
Minutes
</span>

</div>

<p className="text-zinc-500 text-sm mt-4">
Enter any value between 1 and 1440 minutes
</p>

<button
onClick={() =>
setShowDurationModal(false)
}
className="
mt-8
w-full
h-16
rounded-2xl
bg-gradient-to-r
from-emerald-500
to-emerald-400
text-black
font-black
text-lg
hover:scale-[1.02]
transition-all
shadow-[0_0_40px_rgba(16,185,129,.3)]
"
>
✓ Confirm Duration
</button>

</div>

</div>

)}
{showCapacityModal && (

<div
className="
fixed inset-0
z-[150]
bg-black/80
backdrop-blur-xl
flex
items-center
justify-center
"
>

<div
className="
relative
w-[560px]
bg-zinc-950
border
border-sky-500/20
rounded-[36px]
p-10
shadow-[0_0_80px_rgba(56,189,248,.12)]
"
>

<button
onClick={() =>
setShowCapacityModal(false)
}
className="
absolute
top-5
right-5
w-12
h-12
rounded-2xl
border
border-zinc-800
text-zinc-400
hover:text-white
hover:rotate-90
hover:scale-110
transition-all
"
>
✕
</button>

<h3 className="text-4xl font-black">
Slot Capacity
</h3>

<p className="text-zinc-500 mt-2 mb-8">
Enter capacity per slot
</p>

<div
className="
h-16
rounded-2xl
border
border-sky-500/30
bg-black
px-5
flex
items-center
justify-between
"
>

<input
type="number"
value={slotCapacity}
onChange={(e)=>
setSlotCapacity(
Number(e.target.value)
)
}
className="
bg-transparent
outline-none
text-xl
w-full
"
/>

<span className="text-zinc-500">
People
</span>

</div>

<p className="text-zinc-500 text-sm mt-4">
Enter any value between 1 and 1000 people
</p>

<button
onClick={() =>
setShowCapacityModal(false)
}
className="
mt-8
w-full
h-16
rounded-2xl
bg-gradient-to-r
from-sky-500
to-cyan-400
text-black
font-black
text-lg
hover:scale-[1.02]
transition-all
shadow-[0_0_40px_rgba(56,189,248,.3)]
"
>
✓ Confirm Capacity
</button>

</div>

</div>

)}
{showQuantityModal && (

<div
className="
fixed
inset-0
z-[150]
bg-black/80
backdrop-blur-xl
flex
items-center
justify-center
"
>

<div
className="
relative
w-[560px]
bg-zinc-950
border
border-cyan-500/20
rounded-[36px]
p-10
shadow-[0_0_80px_rgba(34,211,238,.12)]
"
>

<button
onClick={() =>
setShowQuantityModal(false)
}
className="
absolute
top-5
right-5
w-12
h-12
rounded-2xl
border
border-zinc-800
text-zinc-400
hover:text-white
transition-all
"
>
✕
</button>

<h3 className="text-4xl font-black">
Quantity
</h3>

<p className="text-zinc-500 mt-2 mb-8">
Enter number of resources
</p>

<div
className="
h-16
rounded-2xl
border
border-cyan-500/30
bg-black
px-5
flex
items-center
"
>

<input
type="number"
min="1"
value={quantityInput}
onChange={(e)=>
setQuantityInput(e.target.value)
}
placeholder="Example: 4"
className="
bg-transparent
outline-none
text-xl
w-full
"
/>

</div>

<button
  onClick={async () => {
    
    const qty = Number(quantityInput);

    if (qty <= 0) {
      alert("Enter valid quantity");
      return;
    }

    setTotalCourts(qty);

    const baseName =
      resourceType === "Custom" ? customResourceType : resourceType;

    setResourceUnits(
      Array.from({ length: qty }, (_, index) => ({
        id: `resource-${Date.now()}-${index}`,
        name: `${baseName} ${index + 1}`,
      }))
    );

    setQuantitySelected(true);
    setShowQuantityModal(false);
  }}
  className="
    mt-8
    w-full
    h-16
    rounded-2xl
    bg-gradient-to-r
    from-cyan-500
    to-sky-400
    text-black
    font-black
    text-lg
    hover:scale-[1.02]
    transition-all
    shadow-[0_0_40px_rgba(34,211,238,.3)]
  "
>
  ✓ Confirm Quantity
</button>

</div>

</div>

)}
{
showManageSport && selectedSport && (
<div
className="
fixed
inset-0
z-[500]
bg-black/70
backdrop-blur-xl
flex
items-center
justify-center
px-8 py-6
"
>

<div
className="
relative
w-full
max-w-[1250px]
h-[90vh]

overflow-auto

rounded-[35px]

border
border-emerald-500/20

bg-gradient-to-br
from-zinc-950
via-black
to-zinc-900

shadow-[0_0_80px_rgba(16,185,129,.15)]

animate-[fadeUp_.25s_ease]
"
>

<div className="p-10">

{/* Back */}

<button
className="
mb-8
text-zinc-400 leading-6
hover:text-white
transition
flex
items-center
gap-2
"
onClick={()=>{
setShowManageSport(false);
setSelectedSport(null);
}}
>
← Back to Sports
</button>

{/* HEADER */}

<div className="flex items-start justify-between">
<div className="flex gap-6">

<div
  className="
  w-24
  h-24
  rounded-[24px]

  bg-gradient-to-br
  from-emerald-400
  to-emerald-700

  shadow-[0_0_35px_rgba(16,185,129,.45)]

  flex
  items-center
  justify-center

  text-[56px]
  shrink-0
  "
>
  {
  selectedSport.name === "Football" ? "⚽" :

  selectedSport.name === "Basketball" ? "🏀" :

  selectedSport.name === "Cricket" ? "🏏" :

  selectedSport.name === "Badminton" ? "🏸" :

  selectedSport.name === "Swimming" ? "🏊" :

  selectedSport.name === "Volleyball" ? "🏐" :

  selectedSport.name === "Tennis" ? "🎾" :

  selectedSport.name === "Table Tennis" ? "🏓" :

  selectedSport.name === "Chess" ? "♟️" :

  selectedSport.name === "Athletics" ? "🏃" :

  selectedSport.name === "Bowling" ? "🎳" :

  selectedSport.name === "Hockey" ? "🏑" :

  selectedSport.name === "Ice Hockey" ? "🏒" :

  selectedSport.name === "Baseball" ? "⚾" :

  selectedSport.name === "Softball" ? "🥎" :

  selectedSport.name === "Rugby" ? "🏉" :

  selectedSport.name === "Golf" ? "⛳" :

  selectedSport.name === "Boxing" ? "🥊" :

  selectedSport.name === "Martial Arts" ? "🥋" :

  selectedSport.name === "Karate" ? "🥋" :

  selectedSport.name === "Taekwondo" ? "🥋" :

  selectedSport.name === "Judo" ? "🥋" :

  selectedSport.name === "Wrestling" ? "🤼" :

  selectedSport.name === "Cycling" ? "🚴" :

  selectedSport.name === "Gymnastics" ? "🤸" :

  selectedSport.name === "Weightlifting" ? "🏋️" :

  selectedSport.name === "Fencing" ? "🤺" :

  selectedSport.name === "Archery" ? "🏹" :

  selectedSport.name === "Shooting" ? "🎯" :

  selectedSport.name === "Rowing" ? "🚣" :

  selectedSport.name === "Canoeing" ? "🛶" :

  selectedSport.name === "Surfing" ? "🏄" :

  selectedSport.name === "Skateboarding" ? "🛹" :

  selectedSport.name === "Skiing" ? "🎿" :

  selectedSport.name === "Snowboarding" ? "🏂" :

  selectedSport.name === "Climbing" ? "🧗" :

  selectedSport.name === "Billiards" ? "🎱" :

  selectedSport.name === "Snooker" ? "🎱" :

  selectedSport.name === "Darts" ? "🎯" :

  selectedSport.name === "Esports" ? "🎮" :

  selectedSport.name === "Kabaddi" ? "🤼" :

  selectedSport.name === "Kho Kho" ? "🏃" :

  selectedSport.name === "Handball" ? "🤾" :

  selectedSport.name === "Netball" ? "🥅" :

  selectedSport.name === "American Football" ? "🏈" :

  selectedSport.name === "Formula Racing" ? "🏎️" :

  selectedSport.name === "Motorcycling" ? "🏍️" :

  selectedSport.name === "Horse Riding" ? "🏇" :

  selectedSport.name === "Fishing" ? "🎣" :

  selectedSport.name === "Diving" ? "🤿" :

  selectedSport.name === "Triathlon" ? "🏅" :

  "🏅"
  }
</div>

<div>

<h1 className="text-[60px]
leading-none
font-black leading-none font-black tracking-tight">
{selectedSport.name}
</h1>

<div className="flex items-center gap-4 mt-3 text-[17px]">
{selectedSport.maintenance ? (
<span className="flex items-center gap-2 text-orange-400 text-sm font-semibold">
<span className="w-2 h-2 rounded-full bg-orange-400"></span>
Maintenance
</span>
) : (
<span className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
Active
</span>
)}

<span className="text-zinc-500">
<span className="text-zinc-500">
Resource Type :
{" "}
<span className="text-zinc-300 font-medium">
{selectedSport.resourceType || "Court"}
</span>
</span>
</span>

</div>

</div>

</div>

<button
onClick={()=>{
setEditedSportName(selectedSport.name);
setEditedResourceType(selectedSport.resourceType);
setEditedStatus(true);
setShowEditSportPopup(true);
}}
className="
h-[52px]
px-6
rounded-2xl
border
border-zinc-800
bg-zinc-900
hover:border-white
transition
flex
items-center
gap-3
text-[15px]
font-semibold
"
>

<PencilSquareIcon 
className="w-5 h-5 hover:text-sky-400 transition"/>
Edit Sport Info

</button>

</div>

<div className="grid grid-cols-4 gap-6 mt-10">

<div
className="
rounded-[24px]
border
border-sky-500/30

bg-zinc-900
h-[240px]
px-8 py-6

shadow-[0_0_30px_rgba(59,130,246,.15)]
"
>

<p className="text-4xl font-black text-sky-400">
{selectedSport?.resourceUnits?.length || 0}
</p>

<p className="uppercase text-sm tracking-wider mt-3">
Resources
</p>

</div>

<div
className="
rounded-[24px]
border
border-emerald-500/30

bg-zinc-900
h-[240px]
px-8 py-6

shadow-[0_0_30px_rgba(16,185,129,.15)]
"
>

<p className="text-4xl font-black text-emerald-400">
{selectedSport.gears?.length || 0}
</p>

<p className="uppercase text-sm tracking-wider mt-3">
Gears
</p>

</div>

<div
className="
rounded-[24px]
border
border-violet-500/30

bg-zinc-900
h-[240px]
px-8 py-6

shadow-[0_0_30px_rgba(168,85,247,.15)]
"
>

<p className="text-4xl font-black text-violet-400">

{selectedSport.hasSlotSystem
? "Enabled"
: "Off"}

</p>

<p className="uppercase text-sm tracking-wider mt-3">

Slot System

</p>

</div>

<div
className="
rounded-[24px]
border
border-orange-500/30

bg-zinc-900

p-6
min-h-[240px]

shadow-[0_0_30px_rgba(249,115,22,.15)]
"
>

<p className="text-4xl font-black text-orange-400">

{selectedSport.maintenance ? "ON" : "OFF"}

</p>
<p className="uppercase text-sm tracking-wider mt-3">

Maintenance

</p>

</div>

</div>

<div className="grid grid-cols-2 gap-7 mt-8">
<button
  onClick={() => setShowSlotPopup(true)}
  className="
    rounded-[24px]
    bg-zinc-900
    border
    border-zinc-800
    p-6
    min-h-[240px]
    text-left
    hover:border-emerald-500
    hover:shadow-[0_0_25px_rgba(16,185,129,.15)]
    transition
  "
>

<div className="flex justify-between items-center h-full">
<div>

<ClockIcon className="w-8 h-8 text-emerald-400 mb-5"/>

<h2 className="text-5xl font-bold mt-4">
Slot System
</h2>

<p className="text-zinc-500 mt-2">
Manage booking slots
</p>

{selectedSport.hasSlotSystem && (

<div className="mt-5 space-y-2">

<p className="text-emerald-400">
Duration:
{selectedSport.slotDurationMinutes} min
</p>

<p className="text-emerald-400">
Capacity:
{selectedSport.slotCapacity}
</p>

</div>

)}

</div>
<span className="self-center text-3xl text-zinc-500">
    ›
</span>
</div>

</button>

<button
onClick={() => {
  setMaintenanceMessage("");
  setMaintenanceWindowStart("");
  setMaintenanceWindowEnd("");
  setSelectedMaintenanceResources([]);
  setMaintenanceScope("resources");
  setMaintenanceConflict(null);
  setShowMaintenancePopup(true);
  void fetchMaintenanceWindows(selectedSport.id);
}}
className="
rounded-[24px]
bg-zinc-900

border
border-zinc-800

p-6
min-h-[240px]

text-left

hover:border-orange-500
hover:shadow-[0_0_25px_rgba(249,115,22,.15)]

transition
"
>
<div className="flex justify-between items-center">
<WrenchScrewdriverIcon className="w-8 h-8 text-orange-400 mb-5" />
<div>
<h2 className="text-5xl font-black mt-4">
Maintenance
</h2>
<p className="text-zinc-500 mt-2">
Manage maintenance
</p>
</div>

<span className="text-3xl text-zinc-500">
›
</span>

</div>
</button>

<button
onClick={() =>{
    setResourceTab("resources");
    setShowResourceManager(true);
}}
className="
rounded-[24px]
bg-zinc-900

border
border-zinc-800

p-6
min-h-[240px]

text-left

hover:border-sky-500
hover:shadow-[0_0_25px_rgba(59,130,246,.15)]

transition
"
>

<div className="flex justify-between items-center">

<div>

<BuildingOffice2Icon className="w-10 h-10 text-sky-400 mb-3"/>

<h2 className="text-5xl font-black mt-4">
Manage Resources
</h2>

<p className="text-zinc-500 mt-2">
Resources & Gears
</p>

</div>

<span className="text-3xl text-zinc-500">
›
</span>

</div>

</button>

<button
onClick={()=>setShowReservationPopup(true)}
className="
rounded-[24px]
bg-zinc-900
border
border-zinc-800
p-6
min-h-[240px]
text-left
hover:border-violet-500
hover:shadow-[0_0_25px_rgba(168,85,247,.15)]
transition
"
>

<div className="flex justify-between items-center">

<div>
<UsersIcon className="w-10 h-10 text-violet-400" />
<h2 className="text-5xl font-black mt-4">
Team Reservations
</h2>

<p className="text-zinc-500 mt-2">
Create and manage team
reservations
</p>

</div>

<span className="text-2xl">
›
</span>

</div>

</button>

{showSlotPopup && (

<div
className="
fixed
inset-0
z-[600]
bg-black/70
backdrop-blur-xl
flex
items-center
justify-center
"
>

<div
className="
w-[560px]
rounded-[32px]
bg-zinc-950
border
border-emerald-500/20
shadow-[0_0_60px_rgba(16,185,129,.15)]
p-8
"
>

{/* Header */}

<div className="flex justify-between items-center">

<div className="flex items-center gap-4">

<ClockIcon className="w-10 h-10 text-emerald-400" />

<h2 className="text-3xl font-black">
Slot System
</h2>

</div>

<button
onClick={()=>setShowSlotPopup(false)}
className="text-3xl hover:text-red-400 transition"
>
✕
</button>

</div>

<hr className="border-zinc-800 my-7"/>

{/* Enable */}

<div className="flex justify-between items-center">

<p className="text-lg">
Slot System
</p>


<label className="relative inline-flex items-center cursor-pointer">

<input
type="checkbox"
checked={slotEnabled}
onChange={(e)=>setSlotEnabled(e.target.checked)}
className="sr-only peer"
/>

<div
className="
w-14
h-8
bg-zinc-700
rounded-full
peer-checked:bg-emerald-500

after:absolute
after:left-1
after:top-1
after:w-6
after:h-6
after:bg-white
after:rounded-full
after:transition-all

peer-checked:after:translate-x-6
"
/>

</label>

</div>

<hr className="border-zinc-800 my-7"/>

<p className="text-zinc-500">
Booking Window
</p>

<p className="text-emerald-400 mt-2 font-semibold">
6 Hour Dynamic Window
</p>

<div className="grid grid-cols-2 gap-5 mt-8">

{/* Duration */}

<div
className="
rounded-2xl
border
border-zinc-800
bg-zinc-900
p-5
"
>

<p className="text-zinc-500 text-sm">
Slot Duration
</p>

<div className="flex justify-between items-center mt-4">

<input
type="number"
value={slotDuration}
onChange={(e)=>setSlotDuration(Number(e.target.value))}
className="
w-full
bg-transparent
text-xl
font-bold
outline-none
text-emerald-400
"
/>

<button
className="hover:text-emerald-400"
>
<PencilSquareIcon className="w-5 h-5 hover:text-sky-400 transition"/>
</button>

</div>

</div>

{/* Capacity */}

<div
className="
rounded-2xl
border
border-zinc-800
bg-zinc-900
p-5
"
>

<p className="text-zinc-500 text-sm">
Slot Capacity
</p>

<div className="flex justify-between items-center mt-4">

<input
type="number"
value={slotCapacityValue}
onChange={(e)=>setSlotCapacityValue(Number(e.target.value))}
className="
w-full
bg-transparent
text-xl
font-bold
outline-none
text-emerald-400
"
/>

<button>
<PencilSquareIcon className="w-5 h-5 hover:text-sky-400 transition"/>
</button>

</div>

</div>
</div>

<button

onClick={handleSaveSlotSettings}
className="
mt-10
w-full
h-14
rounded-2xl
bg-emerald-500
hover:bg-emerald-400
font-bold
text-black
"
>
✔ Save Changes
</button>

</div>

</div>

)}
</div>


{showReservationPopup && (

<motion.div
    initial={{opacity:0}}
    animate={{opacity:1}}
    exit={{opacity:0}}
    className="
    fixed
    inset-0
    z-[700]
    bg-black/70
    backdrop-blur-xl
    flex
    items-center
    justify-center
    "
>

<motion.div
    initial={{scale:.92,y:25}}
    animate={{scale:1,y:0}}
    exit={{scale:.92,y:25}}
    transition={{duration:.35}}
    className="
    w-[980px]
    rounded-[34px]
    border
    border-violet-500/25
    bg-gradient-to-br
    from-zinc-950
    via-zinc-950
    to-[#121018]
    shadow-[0_0_90px_rgba(168,85,247,.18)]
    max-h-[92vh]
overflow-y-auto
    "
>

<div className="p-8">

{/* Header */}

<div className="flex justify-between items-start">

<div className="flex gap-5">

<div
className="
h-16
w-16
rounded-2xl
bg-violet-500/10
border
border-violet-500/20
flex
items-center
justify-center
"
>

<UsersIcon className="w-8 h-8 text-violet-400"/>

</div>

<div>

<h2 className="text-5xl font-black leading-none">

Team Reservations

</h2>

<p className="mt-4 text-zinc-500">

Create a new team reservation

</p>

</div>

</div>

<button

onClick={()=>setShowReservationPopup(false)}

className="
text-4xl
text-zinc-500
hover:text-red-400
transition
"

>

✕

</button>

</div>

<div className="grid grid-cols-2 gap-6 mt-10">

{/* TEAM NAME */}

<div>

<p className="text-sm text-zinc-400 mb-2">

Team Name

</p>

<input

value={reservationTeamName}

onChange={(e)=>setReservationTeamName(e.target.value)}

placeholder="Enter team name"

className="
h-14
w-full
rounded-2xl
bg-zinc-900/70
border
border-zinc-800
px-5
outline-none
focus:border-violet-500
transition
"

/>

</div>

{/* PURPOSE */}

<div>

<p className="text-sm text-zinc-400 mb-2">

Purpose

</p>

<input
  value={reservationPurpose}
  onChange={(e) => setReservationPurpose(e.target.value)}
  placeholder="Practice / Tournament / Coaching / Club Event..."
  className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 outline-none"
/>

</div>

{/* SPORT */}

<div className="col-span-2">

<p className="text-sm text-zinc-400 mb-2">

Sport

</p>

<div

className="
h-14
rounded-2xl
border
border-zinc-800
bg-zinc-900/70
px-5
flex
items-center
"

>

{selectedSport.name}

</div>

</div>

{/* START DATE */}

<div>

<p className="text-sm text-zinc-400 mb-2">

Start Date

</p>

<input

type="date"

value={reservationStartDate}

onChange={(e)=>setReservationStartDate(e.target.value)}

className="
h-14
w-full
rounded-2xl
bg-zinc-900/70
border
border-zinc-800
px-5
outline-none
focus:border-violet-500
"

/>

</div>

{/* END DATE */}

<div>

<p className="text-sm text-zinc-400 mb-2">

End Date

</p>

<input

type="date"

value={reservationEndDate}

onChange={(e)=>setReservationEndDate(e.target.value)}

className="
h-14
w-full
rounded-2xl
bg-zinc-900/70
border
border-zinc-800
px-5
outline-none
focus:border-violet-500
"

/>

</div>

{/* SLOT START */}

<div>

    <p className="text-sm text-zinc-400 mb-2">
        Slot Start Time
    </p>

    <input
        type="time"
        value={reservationStartTime}
        onChange={(e)=>setReservationStartTime(e.target.value)}
        className="
        h-14
        w-full
        rounded-2xl
        bg-zinc-900/70
        border
        border-zinc-800
        px-5
        outline-none
        focus:border-violet-500
        "
    />

</div>

{/* SLOT DURATION */}

<div>

    <p className="text-sm text-zinc-400 mb-2">
        Slot Duration
    </p>

    <input
    type="number"
    min={15}
    step={15}
    value={reservationDuration}
    onChange={(e)=>
        setReservationDuration(Number(e.target.value))
    }
    className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4"
/>

</div>

</div>

{/* ========================= */}

{/* RESOURCE SELECTOR */}

<div className="mt-8">

<div className="flex justify-between items-center mb-3">

<p className="font-semibold text-lg">

Reserve Resources

</p>

<div
className="
rounded-full
bg-violet-500/15
px-3
py-1
text-xs
text-violet-300
"
>

{selectedReservationResources.length} Selected

</div>

</div>

<div
className="
rounded-3xl
border
border-zinc-800
bg-zinc-900/60
max-h-[220px]
overflow-y-auto
"
>

{selectedSport.resourceUnits?.map((resource:any)=>{

const selected =
selectedReservationResources.includes(resource.id);

return(

<div

key={resource.id}

onClick={()=>{

if(selected){

setSelectedReservationResources(

selectedReservationResources.filter(
(id)=>id!==resource.id
)

);

}else{

setSelectedReservationResources([

...selectedReservationResources,

resource.id

]);

}

}}

className="
flex
justify-between
items-center
px-5
py-4
cursor-pointer
border-b
border-zinc-800
hover:bg-violet-500/5
transition
"

>

<div>

<p className="font-semibold text-[15px]">
{resource.name}

</p>

<p className="text-[11px] text-zinc-500">
{resource.status || "Available"}

</p>

</div>

<div

className={`
h-6
w-6
rounded-md
border
flex
items-center
justify-center
transition
${
selected
?
"bg-violet-500 border-violet-500"
:
"border-zinc-600"
}
`}

>

{selected && "✓"}

</div>

</div>

);

})}

</div>

</div>

{/* FOOTER */}

<div className="mt-8 flex justify-between items-center">

<div className="text-sm text-zinc-500">

{selectedReservationResources.length} resource(s) selected

</div>

<div className="flex gap-4">

<button

onClick={()=>setShowReservationPopup(false)}

className="
h-12
px-8
rounded-2xl
border
border-zinc-700
hover:border-zinc-500
transition
"

>

Cancel

</button>

<motion.button

whileHover={{
scale:1.04
}}

whileTap={{
scale:.97
}}

onClick={()=>{

void handleCreateReservation();

}}

className="
h-12
px-8
rounded-2xl
bg-gradient-to-r
from-violet-600
to-fuchsia-600
font-bold
shadow-[0_0_25px_rgba(168,85,247,.35)]
transition
"

>

Reserve Now

</motion.button>

</div>

</div>

</div>

</motion.div>

</motion.div>

)}





































{showResourceManager && (
  <ResourceManagerPopup
    sport={selectedSport}
    sports={sports}
    setSports={setSports}
    updateSport={updateSport}
    onClose={() => setShowResourceManager(false)}
  />
)}


{showAddResourcePopup && (

<div
className="
fixed
inset-0
z-[660]
bg-black/70
backdrop-blur-xl
flex
items-center
justify-center
"
>

<div
className="
w-[500px]
rounded-[28px]
bg-zinc-950
border
border-sky-500/20
shadow-[0_0_50px_rgba(59,130,246,.18)]
p-7
"
>

<div className="flex justify-between items-center">

<div className="flex items-center gap-3">
<div
className="
w-7
h-7
rounded-full
bg-sky-500/20
flex
items-center
justify-center
"
>

<PlusCircleIcon
className="w-4 h-4 text-sky-400"
/>

</div>
<h2 className="text-2xl font-bold">
Add Resource
</h2>

</div>

<button
onClick={()=>setShowAddResourcePopup(false)}
className="text-2xl hover:text-red-400"
>
✕
</button>

</div>

<div className="mt-8">

<div className="flex justify-between items-center mb-4">

<p className="text-zinc-400">
Quantity
</p>

<p className="text-sky-400 font-bold text-xl">
{resourceQuantity}
</p>

</div>

<div className="flex items-center mt-3">

<button
onClick={()=>setResourceQuantity(Math.max(1, resourceQuantity - 1))}
className="
w-12
h-12
bg-zinc-800
hover:bg-zinc-700
transition
rounded-l-xl
text-xl
font-bold
"
>
−
</button>

<input
type="number"
value={resourceQuantity}
readOnly
className="
w-full
h-12
bg-zinc-900
border-y
border-zinc-800
text-center
text-lg
font-bold
outline-none
"
/>

<button
  onClick={() => setResourceQuantity(resourceQuantity + 1)}
  className="
  w-12
  h-12
  bg-zinc-800
  hover:bg-zinc-700
  transition
  rounded-r-xl
  text-xl
  font-bold
  "
>
  +
</button>

</div>

</div>

<div className="mt-8">

<p className="text-zinc-500 mb-4">
This will add the following resources:
</p>

<div className="space-y-2">

{Array.from({ length: Math.max(1, resourceQuantity) }).map((_, i) => (

<div
key={i}
className="
flex
justify-between
items-center
bg-zinc-900
rounded-xl
px-4
py-3
"
>

<span>

{selectedSport?.resourceType || "Court"} {getSportResources(selectedSport).length + i + 1}

</span>

<PlusCircleIcon className="w-5 h-5 text-sky-400"/>

</div>

))}

</div>

</div>

<button
onClick={handleAddResources}
className="
mt-7
w-full
h-12
rounded-xl
bg-gradient-to-r
from-sky-600
to-blue-600
hover:brightness-110
transition
font-bold
text-white
"
>

Add Resources

</button>

</div>
</div>

)}
{showEditResourcePopup && (

<div
className="
fixed
inset-0
z-[670]
bg-black/70
backdrop-blur-xl
flex
items-center
justify-center
"
>

<div
className="
w-[470px]
rounded-[30px]
bg-zinc-950
border
border-sky-500/20
shadow-[0_0_60px_rgba(59,130,246,.15)]
p-8
"
>

<div className="flex justify-between items-center">

<div className="flex items-center gap-3">

<PencilSquareIcon className="w-8 h-8 text-sky-400"/>

<h2 className="text-5xl font-black mt-4">
Edit Resource
</h2>

</div>

<button
onClick={()=>setShowEditResourcePopup(false)}
className="text-3xl hover:text-red-400 transition"
>
✕
</button>

</div>

<div className="mt-8">

<p className="text-zinc-400 mb-3">
Resource Name
</p>

<input
value={editedResourceName}
onChange={(e)=>setEditedResourceName(e.target.value)}
className="
w-full
h-14
rounded-xl
bg-zinc-900
border
border-zinc-800
px-5
outline-none
focus:border-sky-500
"
/>

</div>

<div className="flex gap-4 mt-8">

<button
onClick={()=>setShowEditResourcePopup(false)}
className="
flex-1
h-12
rounded-xl
bg-zinc-900
hover:bg-zinc-800
transition
"
>
Cancel
</button>

<button
onClick={handleSaveResourceEdit}
className="
flex-1
h-12
rounded-xl
bg-gradient-to-r
from-sky-600
to-blue-600
hover:brightness-110
font-bold
"
>
Save Changes
</button>

</div>

</div>

</div>

)}

<AnimatePresence>
{showMaintenancePopup && (

<motion.div
key="maintenance-popup"
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
className="
fixed
inset-0
z-[700]
bg-black/75
backdrop-blur-xl
flex
items-center
justify-center
p-6
"
>

<motion.div
initial={{ scale:.95, y:20, opacity:0 }}
animate={{ scale:1, y:0, opacity:1 }}
exit={{ scale:.95, y:20, opacity:0 }}
transition={{ type:"spring", stiffness:180, damping:18 }}
onClick={(e)=>e.stopPropagation()}
className="
w-[760px]
max-h-[88vh]
rounded-[36px]
border
border-orange-500/20
bg-zinc-950
shadow-[0_0_90px_rgba(249,115,22,.18)]
overflow-y-auto
"
>

<div className="p-8">

{/* Header */}

<div className="flex items-start justify-between">

<div className="flex gap-5">

<div
className="
w-20
h-20
rounded-3xl
bg-orange-500/10
border
border-orange-500/20
flex
items-center
justify-center
"
>

<WrenchScrewdriverIcon
className="w-10 h-10 text-orange-400"
/>

</div>

<div>

<h1 className="text-5xl font-black">

Maintenance Management

</h1>

<p className="mt-2 text-zinc-500">

Manage maintenance for {selectedSport?.name}

</p>

</div>

</div>

<div className="flex items-center gap-3">

<button
type="button"
onClick={()=>setShowActiveMaintenanceList(true)}
className="
h-12
px-5
rounded-2xl
border
border-orange-500/30
bg-orange-500/5
text-orange-300
text-sm
font-semibold
hover:bg-orange-500/10
transition
"
>
Active Maintenance ({activeMaintenanceWindows.length})
</button>

<button

onClick={()=>setShowMaintenancePopup(false)}

className="
text-4xl
text-zinc-500
hover:text-red-400
transition
"

>

✕

</button>

</div>

</div>

{/* Maintenance Scope */}

<div className="mt-8">

<div>

<p className="text-xl font-bold">
Maintenance Scope
</p>

<p className="text-zinc-500 text-sm mt-1">
Choose where maintenance should apply.
</p>

</div>

<div
className="
mt-6
rounded-2xl
bg-zinc-900
border
border-zinc-800
p-2
flex
items-center
"
>

<motion.button

whileHover={{scale:1.02}}

whileTap={{scale:.97}}

onClick={()=>setMaintenanceScope("resources")}

className={`
flex-1
h-12
rounded-xl
font-bold
transition
${maintenanceScope==="resources"
  ? "bg-orange-500 text-black shadow-[0_0_25px_rgba(249,115,22,.35)]"
  : "text-zinc-400 hover:text-white"
}
`}

>

Specific Resources

</motion.button>

<motion.button

whileHover={{scale:1.02}}

whileTap={{scale:.97}}

onClick={()=>setMaintenanceScope("entire")}

className={`
flex-1
h-12
rounded-xl
font-bold
transition
${maintenanceScope==="entire"
  ? "bg-orange-500 text-black shadow-[0_0_25px_rgba(249,115,22,.35)]"
  : "text-zinc-400 hover:text-white"
}
`}

>

Entire Sport

</motion.button>

</div>

</div>

{maintenanceScope === "resources" && (

<div className="mt-8">

<p className="font-bold text-xl">
Select Resources
</p>

<div
className="
mt-4
space-y-3
max-h-[260px]
overflow-y-auto
pr-2
"
>

{(selectedSport?.resourceUnits || []).map((resource:any)=>{

const alreadyInMaintenance = resource.status === "maintenance";
const checked = selectedMaintenanceResources.includes(resource.id);

return(

<div

key={resource.id}

onClick={()=>{

if (alreadyInMaintenance) return;

if(checked){

setSelectedMaintenanceResources(

selectedMaintenanceResources.filter(

(id:number)=>id!==resource.id

)

);

}else{

setSelectedMaintenanceResources([

...selectedMaintenanceResources,

resource.id

]);

}

}}

className={`
rounded-2xl
border
p-5
flex
justify-between
items-center
transition-all
duration-300

${
alreadyInMaintenance
?
"cursor-not-allowed border-zinc-800 bg-zinc-900/40 opacity-50"
:
checked
?
"cursor-pointer border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,.20)]"
:
"cursor-pointer border-zinc-800 bg-zinc-900 hover:border-orange-500/30"
}
`}

>

<div className="flex items-center gap-4">

<div
className="
w-12
h-12
rounded-xl
bg-orange-500/10
flex
items-center
justify-center
"
>

<WrenchScrewdriverIcon
className="w-6 h-6 text-orange-400"
/>

</div>

<div>

<p className="font-semibold">

{resource.name}

</p>

<p className="text-xs text-zinc-500">

{alreadyInMaintenance ? "Already in maintenance" : resource.type}

</p>

</div>

</div>

{!alreadyInMaintenance && (
<div
className={`
w-6
h-6
rounded-md
border

${checked

?

"bg-orange-500 border-orange-500"

:

"border-zinc-600"

}
`}
/>
)}

</div>

);

})}

{(selectedSport?.resourceUnits || []).length === 0 && (
<p className="text-sm text-zinc-500">This sport has no resources yet.</p>
)}

</div>

</div>

)}

{/* Schedule */}

<div className="mt-8">

<p className="text-xl font-bold">

Maintenance Schedule

</p>

<p className="text-zinc-500 text-sm mt-1">

Choose when maintenance starts and ends.

</p>

<div className="grid grid-cols-2 gap-5 mt-6">

<div
className="
rounded-2xl
bg-zinc-900
border
border-zinc-800
p-5
"
>

<label className="text-sm text-zinc-500">

Start

</label>

<input
type="datetime-local"
value={maintenanceWindowStart}
onChange={(e)=>setMaintenanceWindowStart(e.target.value)}
className="
mt-3
w-full
bg-transparent
outline-none
"
/>

</div>

<div
className="
rounded-2xl
bg-zinc-900
border
border-zinc-800
p-5
"
>

<label className="text-sm text-zinc-500">

End

</label>

<input
type="datetime-local"
value={maintenanceWindowEnd}
onChange={(e)=>setMaintenanceWindowEnd(e.target.value)}
className="
mt-3
w-full
bg-transparent
outline-none
"
/>

</div>

</div>

</div>

{/* Maintenance Message */}

<div className="mt-8">

    <div className="flex justify-between items-center">

        <div>

            <p className="text-xl font-bold">
                Maintenance Message
            </p>

            <p className="text-zinc-500 text-sm mt-1">
                Students will see this during maintenance.
            </p>

        </div>

        <span className="text-xs text-zinc-500">
            {maintenanceMessage.length}/300
        </span>

    </div>

    <motion.textarea

        whileFocus={{
            scale:1.01
        }}

        value={maintenanceMessage}

        onChange={(e)=>setMaintenanceMessage(e.target.value)}

        maxLength={300}

        placeholder="Court resurfacing is in progress."

        className="
        mt-4
        h-[120px]
        w-full
        rounded-3xl
        border
        border-orange-500/20
        bg-gradient-to-br
        from-zinc-900
        to-zinc-950
        p-6
        resize-none
        outline-none
        transition
        focus:border-orange-500
        focus:shadow-[0_0_25px_rgba(249,115,22,.15)]
        "

    />

</div>

{maintenanceConflict && (

<div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">

<p className="font-bold text-red-300">
This will cancel {maintenanceConflict.conflicts.length} existing reservation(s)
</p>

<div className="mt-3 space-y-2 max-h-[140px] overflow-y-auto pr-1">
{maintenanceConflict.conflicts.map((c:any)=>(
<p key={c.reservationId} className="text-sm text-red-200">
{c.teamName} on {c.resourceName} · {new Date(c.startDateTime).toLocaleString()} - {new Date(c.endDateTime).toLocaleString()}
</p>
))}
</div>

<div className="mt-4 flex gap-3">
<button
type="button"
onClick={()=>setMaintenanceConflict(null)}
className="h-11 px-5 rounded-xl border border-zinc-700 hover:border-zinc-500 transition"
>
Cancel
</button>
<button
type="button"
disabled={maintenanceSaving}
onClick={()=>void handleSaveMaintenance(true)}
className="h-11 px-5 rounded-xl bg-red-500 text-black font-bold hover:bg-red-400 transition disabled:opacity-60"
>
Cancel reservation(s) and continue
</button>
</div>

</div>

)}

{/* Footer */}

<div className="mt-10">

    <div className="flex gap-5">

        <motion.button

            whileHover={{
                scale:1.02
            }}

            whileTap={{
                scale:.98
            }}

            onClick={()=>setShowMaintenancePopup(false)}

            className="
            flex-1
            h-14
            rounded-2xl
            border
            border-zinc-700
            bg-zinc-900
            hover:border-zinc-500
            transition
            "

        >

            Cancel

        </motion.button>

        <motion.button

            whileHover={{
                scale:1.03,
                boxShadow:"0 0 35px rgba(249,115,22,.45)"
            }}

            whileTap={{
                scale:.97
            }}

            disabled={maintenanceSaving}

            onClick={() => void handleSaveMaintenance(false)}

            className="
            flex-1
            h-14
            rounded-2xl
            bg-gradient-to-r
            from-orange-500
            via-orange-500
            to-orange-600
            font-bold
            text-black
            shadow-[0_0_30px_rgba(249,115,22,.35)]
            disabled:opacity-60
            "

        >

            {maintenanceSaving ? "Scheduling..." : "Schedule Maintenance"}

        </motion.button>

    </div>

</div>

</div>

</motion.div>

</motion.div>

)}

{showActiveMaintenanceList && (

<motion.div
key="active-maintenance-list"
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
onClick={()=>setShowActiveMaintenanceList(false)}
className="
fixed
inset-0
z-[710]
bg-black/80
backdrop-blur-xl
flex
items-center
justify-center
p-6
"
>

<motion.div
initial={{ scale:.95, y:20, opacity:0 }}
animate={{ scale:1, y:0, opacity:1 }}
exit={{ scale:.95, y:20, opacity:0 }}
onClick={(e)=>e.stopPropagation()}
className="
w-[560px]
max-h-[80vh]
overflow-y-auto
rounded-[32px]
border
border-orange-500/20
bg-zinc-950
p-7
shadow-[0_0_80px_rgba(249,115,22,.18)]
"
>

<div className="flex items-center justify-between">
<h2 className="text-2xl font-black">Active Maintenance</h2>
<button
type="button"
onClick={()=>setShowActiveMaintenanceList(false)}
className="text-3xl text-zinc-500 hover:text-red-400 transition"
>
✕
</button>
</div>

<p className="text-zinc-500 text-sm mt-1">
Currently scheduled maintenance for {selectedSport?.name}
</p>

<div className="mt-6 space-y-3">

{activeMaintenanceWindows.length === 0 && (
<div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
<WrenchScrewdriverIcon className="mx-auto w-10 h-10 text-zinc-600"/>
<p className="mt-4 text-zinc-500">No active maintenance.</p>
</div>
)}

{activeMaintenanceWindows.map((w:any)=>(
<div key={w.id} className="rounded-2xl border border-orange-500/15 bg-zinc-900 p-5">
<div className="flex items-start justify-between gap-3">
<div className="min-w-0">
<p className="font-bold">
{w.scope === "entire" ? "Entire Sport" : (w.resourceUnit?.name || "Resource")}
</p>
<p className="text-xs text-zinc-500 mt-1">
{new Date(w.startAt).toLocaleString()} → {new Date(w.endAt).toLocaleString()}
</p>
<p className="text-sm text-zinc-400 mt-2">
{w.message || "No maintenance message."}
</p>
</div>
<button
type="button"
onClick={()=>void handleEndMaintenanceWindow(w.id)}
className="shrink-0 h-9 px-4 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition text-xs font-semibold"
>
End now
</button>
</div>
</div>
))}

</div>

</motion.div>

</motion.div>

)}

</AnimatePresence>










{showDeleteResourcePopup && (

<div
className="
fixed
inset-0
z-[680]
bg-black/70
backdrop-blur-xl
flex
items-center
justify-center
"
>

<div
className="
w-[430px]
rounded-[30px]
bg-zinc-950
border
border-red-500/20
shadow-[0_0_50px_rgba(239,68,68,.18)]
p-8
"
>

<div className="flex justify-between items-center">

<div className="flex items-center gap-3">

<TrashIcon className="w-8 h-8 text-red-500"/>

<h2 className="text-5xl font-black mt-4">
Delete Resource
</h2>

</div>

<button
onClick={()=>setShowDeleteResourcePopup(false)}
className="text-3xl"
>
✕
</button>

</div>

<p className="text-zinc-400 mt-8">
Are you sure you want to delete
</p>

<p className="text-xl font-bold mt-2">
{selectedResource?.name} ?
</p>

<div className="flex gap-4 mt-8">

<button
onClick={()=>setShowDeleteResourcePopup(false)}
className="
flex-1
h-12
rounded-xl
bg-zinc-900
"
>
Cancel
</button>

<button
onClick={handleDeleteSelectedResource}
className="
flex-1
h-12
rounded-xl
bg-red-600
hover:bg-red-500
font-bold
"
>
Delete
</button>
</div>

</div>

</div>

)}

{showEditSportPopup && (

<div
className="
fixed
inset-0
z-[690]
bg-black/70
backdrop-blur-xl
flex
items-center
justify-center
"
>

<div
className="
w-[620px]
rounded-[32px]
bg-zinc-950
border
border-emerald-500/20
shadow-[0_0_60px_rgba(16,185,129,.15)]
p-8
"
>

<div className="flex justify-between items-center">

<h2 className="text-5xl font-black mt-4">
Edit Sport

</h2>

<button

onClick={()=>setShowEditSportPopup(false)}

className="text-3xl"

>

✕

</button>

</div>

<div className="space-y-6 mt-8">

<div>

<p className="text-zinc-400">

Sport Name

</p>

<input
value={editedSportName}
onChange={(e)=>setEditedSportName(e.target.value)}
className="
mt-2
w-full
bg-zinc-900
rounded-xl
p-4
outline-none
"
/>

</div>

<div>

<p className="text-zinc-400">

Resource Type

</p>

<input
value={editedResourceType}
onChange={(e)=>setEditedResourceType(e.target.value)}
className="
mt-2
w-full
bg-zinc-900
rounded-xl
p-4
outline-none
"
/>

</div>

<div className="flex justify-between items-center">

<p>

Sport Active

</p>

<input
type="checkbox"
checked={editedStatus}
onChange={(e)=>setEditedStatus(e.target.checked)}
/>

</div>

</div>

<button

onClick={handleSaveSportInfo}

className="
mt-8
w-full
h-14
rounded-xl
bg-emerald-500
text-black
font-bold
"

>

Save Changes

</button>

</div>

</div>

)}
{showResourceToast && (

<div
className="
fixed
bottom-8
right-8
z-[999]

bg-emerald-600

rounded-xl

px-6
py-4

shadow-[0_0_40px_rgba(16,185,129,.4)]

font-bold

animate-pulse
"
>

{resourceToastMessage}

</div>
)}

  </div>
</div>

</div>
)}

    </main>


  );
}


