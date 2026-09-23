"use client";

import { useEffect, useState } from "react";
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
const [announcementAudience, setAnnouncementAudience] = useState("All");
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

const [showCreateRequest, setShowCreateRequest] = useState(false);

const [requestMessage, setRequestMessage] = useState("");


const [requests, setRequests] = useState<any[]>([]);
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
const [maintenanceEnabled,setMaintenanceEnabled]=useState(false);

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

const [selectedRequestDate, setSelectedRequestDate] = useState("Today");

// ================= LIVE BOOKINGS STATE =================

const [showLiveBookings, setShowLiveBookings] = useState(false);
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


const getBookingTime = (booking: any) => {
  const slotSystem =
    booking?.slotSystem ??
    booking?.isSlotSystem ??
    booking?.slotBased ??
    booking?.sport?.slotSystem ??
    booking?.sport?.isSlotSystem ??
    booking?.sport?.slotBased ??
    booking?.sport?.hasSlotSystem ??
    false;

  if (slotSystem) {
    return (
      booking?.slotTime ||
      booking?.slot ||
      booking?.timeSlot ||
      `${booking?.startTime || "--"} - ${
        booking?.endTime || "--"
      }`
    );
  }

  if (booking?.startTime && booking?.endTime) {
    return `${booking.startTime} - ${booking.endTime}`;
  }

  if (booking?.bookingTime) {
    return booking.bookingTime;
  }

  if (booking?.time) {
    return booking.time;
  }

  return "Time not available";
};


const getBookingDate = (booking: any) => {
  return (
    booking.bookingDate ||
    booking.date ||
    booking.slotDate ||
    "Today"
  );
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
  try {
    console.log("🔄 Fetching live bookings...");

    const res = await fetch("http://localhost:5000/bookings/live", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Live bookings response:", res.status, res.statusText);

    const text = await res.text();

    console.log("📦 Live bookings raw response:", text);

    if (!res.ok) {
      throw new Error(
        `Live bookings API failed: ${res.status} ${res.statusText} - ${text}`
      );
    }

    const data = JSON.parse(text);

    console.log("✅ Live bookings data:", data);

    setLiveBookings(Array.isArray(data) ? data : data.bookings || []);

  } catch (error) {
    console.error("❌ Failed to fetch live bookings:", error);
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
const filteredReturnRequests = returnRequests.filter((item) => {
  const matchesDate =
    selectedRequestDate === "All" ||
    item.requestDate === selectedRequestDate;

  const matchesSearch =
    returnSearch.trim() === "" ||
    (item.student || "")
      .toLowerCase()
      .includes(returnSearch.toLowerCase());

  return matchesDate && matchesSearch;
});
const [advanceBookingDays,setAdvanceBookingDays]=useState(7);  
const fetchSports = async () => {
    try {
      const response = await fetch(
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
    // fetch announcements, return requests and anonymous requests from backend
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("http://localhost:5000/notices");
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      }
    };

    const fetchReturnRequests = async () => {
      try {
        const res = await fetch("http://localhost:5000/return-requests");
        const data = await res.json();
        setReturnRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch return requests", err);
      }
    };

    const fetchAnonymousRequests = async () => {
      try {
        const res = await fetch("http://localhost:5000/anonymous-requests");
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch anonymous requests", err);
      }
    };

    fetchAnnouncements();
    fetchReturnRequests();
    fetchAnonymousRequests();
  }, []);

const deleteSport = async (id: string) => {

  const confirmed = window.confirm(
    "Delete this sport?"
  );

  if (!confirmed) return;

  try {

    const response = await fetch(
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

await fetch(

`http://localhost:5000/sports/${updatedSport.id}`,

{

method:"PUT",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(updatedSport)

}

);

}catch(err){

console.log(err);

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

const handleSaveSlotSettings = () => {

if (!selectedSport) return;

const updatedSport = {

...selectedSport,

hasSlotSystem: slotEnabled,

slotDurationMinutes: slotDuration,

slotCapacity: slotCapacityValue,

};

setSelectedSport(updatedSport);

setSports((prev)=>

prev.map((sport)=>

sport.id===selectedSport.id

? updatedSport

: sport

)

);

setShowSlotPopup(false);

};

const handleSaveSportInfo = () => {
  if (!selectedSport) return;

  const updatedSport = {
    ...selectedSport,
    name: editedSportName.trim() || selectedSport.name,
    resourceType: editedResourceType.trim() || selectedSport.resourceType || "Court",
    active: editedStatus,
  };

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

  // TODO: Save reservation to Firebase later.

  console.log({
    team: reservationTeamName,
    purpose: reservationPurpose,
    startDate: reservationStartDate,
    endDate: reservationEndDate,
    startTime: reservationStartTime,
    duration: reservationDuration,
    resources: selectedReservationResources,
  });

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

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center">
            <p className="text-4xl mb-2">🏅</p>
            <h3 className="font-black text-xl">
              Sports
            </h3>
            <div className="mt-4 flex items-end gap-3">

  <div className="mt-4 flex items-center gap-2">
  <span className="text-emerald-400 font-bold text-4xl">
    {sports.length}
  </span>

  <span className="text-zinc-500">
    /
  </span>

  <span className="pb-1 text-sm font-semibold text-zinc-500 uppercase text 3xl">
    Total Sports
  </span>

</div>
</div>

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
              {sports.reduce((sum, sport) => sum + (sport.totalStaff || 0), 0)}
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
              {sports.reduce((sum, sport) => sum + (sport.totalStudents || 0), 0)}
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
              {sports.reduce(
  (sum, sport) =>
    sum + (sport.resourceUnits?.length || 0),
  0
)}
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
              {sports.reduce((sum, sport) => sum + (sport.totalBookings || 0), 0)}
            </p>
            <p className="text-zinc-400">
              Bookings
            </p>
          </div>

        </div>

{/* ================= RETURN REQUESTS MODAL ================= */}

{showReturnRequests && (
  <div
    className="
      fixed inset-0 z-[230]
      bg-black/80
      backdrop-blur-2xl
      flex items-center justify-center
      p-4 sm:p-6
    "
  >

    {/* BACKGROUND AMBIENT LIGHT */}

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >

      {/* PINK GLOW */}

      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-[5%]
          left-[5%]
          w-[460px]
          h-[460px]
          rounded-full
          bg-pink-500/[0.10]
          blur-[140px]
        "
      />

      {/* FUCHSIA GLOW */}

      <motion.div
        animate={{
          x: [0, -70, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-[0%]
          right-[5%]
          w-[430px]
          h-[430px]
          rounded-full
          bg-fuchsia-500/[0.08]
          blur-[140px]
        "
      />

      {/* SMALL ROSE ACCENT */}

      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-[45%]
          left-[45%]
          w-[250px]
          h-[250px]
          rounded-full
          bg-rose-500/[0.05]
          blur-[120px]
        "
      />

    </motion.div>


    {/* MAIN MODAL */}

    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
        y: 45,
        rotateX: 6,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
      }}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="
        relative
        w-full
        max-w-[1180px]
        max-h-[92vh]

        overflow-hidden

        rounded-[30px]
        sm:rounded-[38px]

        bg-gradient-to-br
        from-[#12090f]
        via-[#080808]
        to-[#0d080b]

        border
        border-pink-500/25

        shadow-[0_0_140px_rgba(236,72,153,.16)]
      "
    >

      {/* MOVING BORDER GLOW */}

      <motion.div
        animate={{
          opacity: [0.15, 0.45, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          inset-0
          rounded-[30px]
          sm:rounded-[38px]

          border
          border-pink-400/30

          pointer-events-none
        "
      />


      {/* TOP SCANNING LIGHT */}

      <motion.div
        animate={{
          x: ["-120%", "220%"],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          top-0
          left-0
          w-[45%]
          h-[2px]

          bg-gradient-to-r
          from-transparent
          via-pink-400
          to-transparent

          blur-[2px]

          pointer-events-none
        "
      />


      {/* CLOSE BUTTON */}

      <motion.button
        type="button"
        whileHover={{
          rotate: 90,
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.9,
        }}
        onClick={() => setShowReturnRequests(false)}
        className="
          absolute
          top-5
          right-5
          z-50

          w-12
          h-12

          rounded-2xl

          bg-zinc-900/90
          border
          border-zinc-800

          text-zinc-500

          flex
          items-center
          justify-center

          hover:text-pink-300
          hover:bg-pink-500/10
          hover:border-pink-500/30

          transition-all
          duration-300
        "
      >
        <X className="w-5 h-5" />
      </motion.button>


      {/* HEADER */}

      <div
        className="
          relative
          z-10

          px-6
          sm:px-10
          lg:px-12

          pt-8
          sm:pt-10

          pb-7

          border-b
          border-pink-500/10
        "
      >

        <div className="flex items-center gap-4 sm:gap-5">

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
              w-16
              h-16
              sm:w-[68px]
              sm:h-[68px]
              shrink-0

              rounded-[22px]

              bg-gradient-to-br
              from-pink-500/20
              to-fuchsia-500/10

              border
              border-pink-400/30

              flex
              items-center
              justify-center

              shadow-[0_0_40px_rgba(236,72,153,.18)]
            "
          >

            <ClipboardCheck
              className="
                w-8
                h-8

                text-pink-400

                drop-shadow-[0_0_12px_rgba(244,114,182,.8)]
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
                rounded-[22px]

                border
                border-pink-400/30
              "
            />

          </motion.div>


          <div>

            <h2
              className="
                text-3xl
                sm:text-4xl

                font-black

                bg-gradient-to-r
                from-white
                via-pink-100
                to-pink-400

                bg-clip-text
                text-transparent
              "
            >
              Return Requests
            </h2>

            <p className="text-zinc-500 text-sm sm:text-base mt-1">
              Review and process equipment returns
            </p>

          </div>

        </div>


        {/* SEARCH AREA */}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">

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

                group-focus-within:text-pink-400

                transition-colors
              "
            />

            <input
              value={returnSearch}
              onChange={(e) => setReturnSearch(e.target.value)}
              placeholder="Search student or equipment..."
              className="
                w-full
                h-15
                sm:h-16

                rounded-2xl

                bg-black/30

                border
                border-zinc-800

                pl-14
                pr-5

                text-white

                outline-none

                placeholder:text-zinc-600

                focus:border-pink-500/50
                focus:bg-pink-500/[0.025]

                focus:ring-4
                focus:ring-pink-500/[0.06]

                transition-all
                duration-300
              "
            />

          </div>


          {/* DATE FILTER */}

          <select
            value={selectedRequestDate}
            onChange={(e) =>
              setSelectedRequestDate(e.target.value)
            }
            className="
              h-15
              sm:h-16

              w-full
              sm:w-[175px]

              rounded-2xl

              bg-black/30

              border
              border-zinc-800

              px-5

              text-zinc-300

              outline-none

              hover:border-pink-500/30

              focus:border-pink-500/50
              focus:ring-4
              focus:ring-pink-500/[0.05]

              transition-all
              duration-300

              cursor-pointer
            "
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>All</option>
          </select>

        </div>

      </div>


      {/* REQUEST LIST */}

      <div
        className="
          relative
          z-10

          p-5
          sm:p-8
          lg:p-9

          max-h-[62vh]

          overflow-y-auto

          space-y-4

          scrollbar-thin
          scrollbar-thumb-pink-500/30
          scrollbar-track-transparent
        "
      >

        {filteredReturnRequests.length === 0 ? (

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="py-20 text-center"
          >

            <motion.div
              animate={{
                y: [0, -7, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                mx-auto
                mb-6

                w-24
                h-24

                rounded-[28px]

                bg-pink-500/[0.06]

                border
                border-pink-500/15

                flex
                items-center
                justify-center

                shadow-[0_0_45px_rgba(236,72,153,.08)]
              "
            >
              <PackageOpen
                className="
                  w-10
                  h-10
                  text-pink-400/60
                "
              />
            </motion.div>

            <p className="text-xl font-black text-zinc-300">
              No Return Requests
            </p>

            <p className="text-sm text-zinc-600 mt-2">
              Nothing is waiting for review.
            </p>

          </motion.div>

        ) : (

          filteredReturnRequests.map((item, index) => (

            <motion.button
              key={item.id}
              type="button"

              initial={{
                opacity: 0,
                x: -20,
              }}

              animate={{
                opacity: 1,
                x: 0,
              }}

              transition={{
                delay: index * 0.06,
                duration: 0.4,
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
                setSelectedReturn(item);
                setShowReturnDetails(true);
              }}

              className="
                relative
                w-full
                group
                text-left
                overflow-hidden

                rounded-[26px]

                bg-gradient-to-r
                from-[#160b11]/90
                via-zinc-900/70
                to-[#10090d]/90

                border
                border-zinc-800

                p-5
                sm:p-6
                lg:p-7

                hover:border-pink-500/40

                hover:shadow-[0_20px_70px_rgba(236,72,153,.11)]

                transition-all
                duration-300
              "
            >

              {/* PINK HOVER AURA */}

              <div
                className="
                  absolute
                  inset-0

                  opacity-0
                  group-hover:opacity-100

                  bg-gradient-to-r
                  from-pink-500/[0.09]
                  via-fuchsia-500/[0.025]
                  to-rose-500/[0.06]

                  transition-opacity
                  duration-500

                  pointer-events-none
                "
              />


              {/* SHINE */}

              <motion.div
                initial={{
                  x: "-120%",
                }}
                whileHover={{
                  x: "120%",
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
                  via-white/[0.05]
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
                  flex-col
                  sm:flex-row

                  sm:items-center
                  sm:justify-between

                  gap-5
                "
              >

                {/* LEFT */}

                <div className="flex items-center gap-4">

                  <motion.div
                    whileHover={{
                      rotate: 8,
                      scale: 1.1,
                    }}
                    className="
                      w-16
                      h-16
                      shrink-0

                      rounded-[20px]

                      bg-pink-500/[0.08]

                      border
                      border-pink-500/20

                      flex
                      items-center
                      justify-center

                      group-hover:bg-pink-500/[0.14]

                      group-hover:shadow-[0_0_35px_rgba(236,72,153,.18)]

                      transition-all
                      duration-300
                    "
                  >

                    <Package
                      className="
                        w-7
                        h-7

                        text-pink-400

                        drop-shadow-[0_0_9px_rgba(244,114,182,.6)]
                      "
                    />

                  </motion.div>


                  <div>

                    <h3 className="
                      text-xl
                      sm:text-lg
                      font-black
                      text-white
                    ">
                      {item.student}
                    </h3>

                    <p className="
                      text-sm
                      text-zinc-500
                      mt-1
                    ">
                      {item.resourceType === "Gear"
                        ? item.gear
                        : item.court}
                    </p>

                  </div>

                </div>


                {/* RIGHT */}

                <div className="
                  flex
                  items-center
                  justify-between
                  sm:justify-end
                  gap-5
                ">

                  <div className="text-right">

                    <div className="
                      flex
                      items-center
                      justify-end
                      gap-2
                    ">

                      {/* Pending stays amber */}

                      <motion.span
                        animate={{
                          scale: [1, 1.35, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="
                          w-2
                          h-2
                          rounded-full
                          bg-amber-400
                          shadow-[0_0_10px_rgba(251,191,36,.7)]
                        "
                      />

                      <span className="
                        text-amber-400
                        text-[11px]
                        font-black
                        tracking-[0.15em]
                      ">
                        PENDING
                      </span>

                    </div>

                    <p className="
                      text-xs
                      text-zinc-600
                      mt-2
                    ">
                      {item.borrowTime}
                    </p>

                  </div>


                  <motion.div
                    animate={{
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="
                      w-10
                      h-10

                      rounded-xl

                      bg-zinc-800/60

                      border
                      border-zinc-800

                      flex
                      items-center
                      justify-center

                      text-pink-400

                      group-hover:bg-pink-500/10
                      group-hover:border-pink-500/25

                      transition-all
                    "
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>

                </div>

              </div>


              {/* BOTTOM */}

              <div
                className="
                  relative
                  z-10

                  mt-5
                  pt-4

                  border-t
                  border-zinc-800/70

                  flex
                  items-center
                  justify-between
                "
              >

                <span className="
                  text-[11px]
                  uppercase
                  tracking-wider
                  text-zinc-600
                ">
                  Return request submitted
                </span>

                <span className="
                  text-[11px]
                  font-black
                  uppercase
                  tracking-wider

                  text-pink-400

                  opacity-60
                  group-hover:opacity-100

                  transition-opacity
                ">
                  Review →
                </span>

              </div>

            </motion.button>

          ))

        )}

      </div>

    </motion.div>

  </div>
)}

{/* ================= RETURN DETAILS ================= */}

{showReturnDetails && selectedReturn && (

  <div
    className="
      fixed
      inset-0
      z-[250]

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
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-[5%]
          right-[8%]

          w-[440px]
          h-[440px]

          rounded-full

          bg-pink-500/[0.09]

          blur-[130px]
        "
      />

      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-[5%]
          left-[5%]

          w-[400px]
          h-[400px]

          rounded-full

          bg-fuchsia-500/[0.07]

          blur-[130px]
        "
      />

    </motion.div>


    {/* MODAL */}

    <motion.div
      initial={{
        opacity: 0,
        scale: 0.9,
        y: 45,
        rotateX: 6,
      }}

      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
      }}

      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}

      className="
        relative

        w-full
        max-w-[1000px]
        max-h-[92vh]

        overflow-y-auto

        rounded-[30px]
        sm:rounded-[38px]

        bg-gradient-to-br
        from-[#14090f]
        via-[#080808]
        to-[#0d080b]

        border
        border-pink-500/25

        shadow-[0_0_140px_rgba(236,72,153,.16)]

        scrollbar-thin
        scrollbar-thumb-pink-500/30
      "
    >

      {/* TOP BORDER LIGHT */}

      <motion.div
        animate={{
          opacity: [0.2, 0.55, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
        className="
          absolute
          top-0
          left-10
          right-10
          h-px

          bg-gradient-to-r
          from-transparent
          via-pink-400
          to-transparent
        "
      />


      {/* CLOSE */}

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
          setShowReturnDetails(false);
          setSelectedReturn(null);
        }}
        className="
          absolute
          top-5
          right-5
          z-30

          w-12
          h-12

          rounded-2xl

          bg-zinc-900/90

          border
          border-zinc-800

          text-zinc-500

          flex
          items-center
          justify-center

          hover:text-pink-300
          hover:bg-pink-500/10
          hover:border-pink-500/30

          transition-all
          duration-300
        "
      >
        <X className="w-5 h-5" />
      </motion.button>


      <div className="relative z-10 p-6 sm:p-10 lg:p-12">

        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.05,
          }}
          className="mb-9"
        >

          <div className="flex items-center gap-4 sm:gap-5">

            <motion.div
              animate={{
                y: [0, -3, 0],
                rotate: [0, -2, 2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="
                relative

                w-16
                h-16
                sm:w-[68px]
                sm:h-[68px]

                rounded-[22px]

                bg-gradient-to-br
                from-pink-500/20
                to-fuchsia-500/10

                border
                border-pink-500/25

                flex
                items-center
                justify-center

                shadow-[0_0_40px_rgba(236,72,153,.16)]
              "
            >

              <ClipboardCheck
                className="
                  w-8
                  h-8

                  text-pink-400

                  drop-shadow-[0_0_12px_rgba(244,114,182,.7)]
                "
              />

              <motion.span
                animate={{
                  opacity: [0.1, 0.45, 0.1],
                  scale: [1, 1.12, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
                className="
                  absolute
                  inset-0
                  rounded-[22px]
                  border
                  border-pink-400/25
                "
              />

            </motion.div>


            <div>

              <h2 className="
                text-3xl
                sm:text-4xl
                font-black

                bg-gradient-to-r
                from-white
                via-pink-100
                to-pink-400

                bg-clip-text
                text-transparent
              ">
                Return Details
              </h2>

              <p className="
                text-zinc-500
                text-sm
                sm:text-base
                mt-1
              ">
                Verify the equipment before completing the return
              </p>

            </div>

          </div>

        </motion.div>


        {/* INFORMATION GRID */}

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4
        ">

          {/* STUDENT */}

          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.08,
            }}
            className="
              group

              rounded-[26px]

              bg-pink-500/[0.025]

              border
              border-zinc-800

              p-6
              sm:p-7

              hover:border-pink-500/30
              hover:bg-pink-500/[0.045]

              transition-all
              duration-300
            "
          >

            <p className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-zinc-600
              font-black
            ">
              Student
            </p>

            <h3 className="
              text-2xl
              sm:text-[26px]
              font-black
              text-white
              mt-2
            ">
              {selectedReturn.student}
            </h3>

            <span className="
              inline-flex
              mt-3

              px-3
              py-1

              rounded-full

              bg-pink-500/10

              border
              border-pink-500/20

              text-pink-400

              text-[10px]
              font-black
              tracking-wider
            ">
              ACTIVE
            </span>

          </motion.div>


          {/* BORROWED ITEM */}

          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.12,
            }}
            className="
              group

              rounded-[26px]

              bg-fuchsia-500/[0.025]

              border
              border-zinc-800

              p-6
              sm:p-7

              hover:border-fuchsia-500/30

              transition-all
              duration-300
            "
          >

            <p className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-zinc-600
              font-black
            ">
              Borrowed Equipment
            </p>

            <h3 className="
              text-2xl
              sm:text-[26px]
              font-black
              text-white
              mt-2
            ">
              {selectedReturn.resourceType === "Gear"
                ? selectedReturn.gear
                : selectedReturn.court}
            </h3>

            <p className="
              text-zinc-500
              text-sm
              mt-2
            ">
              {selectedReturn.resourceType}
            </p>

          </motion.div>


          {/* BORROW TIME */}

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
              delay: 0.16,
            }}
            className="
              rounded-[26px]

              bg-zinc-900/60

              border
              border-zinc-800

              p-6
              sm:p-7

              hover:border-pink-500/20

              transition-all
            "
          >

            <p className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-zinc-600
              font-black
            ">
              Borrowed At
            </p>

            <p className="
              text-lg
              sm:text-xl
              font-bold
              text-white
              mt-3
            ">
              {selectedReturn.borrowTime}
            </p>

          </motion.div>


          {/* REQUEST TIME */}

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
              rounded-[26px]

              bg-zinc-900/60

              border
              border-zinc-800

              p-6
              sm:p-7

              hover:border-pink-500/20

              transition-all
            "
          >

            <p className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-zinc-600
              font-black
            ">
              Return Requested
            </p>

            <p className="
              text-lg
              sm:text-xl
              font-bold
              text-white
              mt-3
            ">
              {selectedReturn.requestTime}
            </p>

          </motion.div>

        </div>


        {/* IDENTITY VERIFICATION */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
          className="mt-9"
        >

          <div className="
            flex
            items-end
            justify-between
            mb-4
          ">

            <div>

              <h3 className="
                text-xl
                sm:text-2xl
                font-black
                text-white
              ">
                Identity Verification
              </h3>

              <p className="
                text-zinc-600
                text-sm
                mt-1
              ">
                Verify the student's uploaded identification
              </p>

            </div>

          </div>


          {/* ID PREVIEW */}

          <div
            className="
              relative

              h-[300px]
              sm:h-[340px]

              rounded-[28px]

              overflow-hidden

              bg-gradient-to-br
              from-[#130a0f]
              to-black

              border
              border-pink-500/15

              flex
              items-center
              justify-center

              group

              shadow-[inset_0_0_60px_rgba(236,72,153,.025)]
            "
          >

            {/* GRID */}

            <div
              className="
                absolute
                inset-0

                opacity-[0.04]

                bg-[linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)]
                bg-[size:30px_30px]

                pointer-events-none
              "
            />

            {selectedReturn.idCard ? (

              <img
                src={selectedReturn.idCard}
                alt="Uploaded ID card"
                className="
                  relative
                  z-10

                  max-h-[255px]
                  sm:max-h-[285px]

                  max-w-[90%]

                  object-contain

                  rounded-xl

                  cursor-zoom-in

                  shadow-[0_20px_60px_rgba(0,0,0,.6)]

                  transition-all
                  duration-500

                  group-hover:scale-[1.03]
                "
              />

            ) : (

              <div className="
                text-center
                relative
                z-10
              ">

                <div className="
                  text-5xl
                  mb-3
                ">
                  🪪
                </div>

                <p className="text-zinc-600">
                  No ID card uploaded
                </p>

              </div>

            )}

          </div>


          {/* VIEW FULL ID */}

          <motion.button
            type="button"
            whileHover={{
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => setShowIdCard(true)}
            className="
              group

              relative
              overflow-hidden

              mt-4

              w-full
              h-16

              rounded-2xl

              bg-pink-500/[0.035]

              border
              border-pink-500/15

              text-white
              font-bold

              hover:border-pink-500/40
              hover:bg-pink-500/[0.07]

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
                duration-700

                bg-gradient-to-r
                from-transparent
                via-pink-300/[0.08]
                to-transparent
              "
            />

            <span className="
              relative
              z-10

              flex
              items-center
              justify-center
              gap-2
            ">
              🔍 View Full Size ID

              <ChevronRight
                className="
                  w-4
                  h-4

                  text-pink-400

                  group-hover:translate-x-1

                  transition-transform
                "
              />
            </span>

          </motion.button>

        </motion.div>


        {/* CONDITION */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          className="mt-9"
        >

          <div className="mb-4">

            <h3 className="
              text-xl
              sm:text-2xl
              font-black
              text-white
            ">
              Return Condition
            </h3>

            <p className="
              text-zinc-600
              text-sm
              mt-1
            ">
              Select the condition of the returned equipment
            </p>

          </div>


          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
          ">

            {/* GOOD */}

            <motion.button
              type="button"

              whileHover={{
                scale: 1.025,
                y: -3,
              }}

              whileTap={{
                scale: 0.97,
              }}

              onClick={async () => {

                if (!selectedReturn) return;

                try {

                  const res = await fetch(
                    `http://localhost:5000/return-requests/${selectedReturn.id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        status: "Approved",
                      }),
                    }
                  );

                  const updated = await res.json();

                  setReturnRequests((prev) =>
                    prev.map((r) =>
                      r.id === updated.id ? updated : r
                    )
                  );

                } catch (error) {

                  console.error(
                    "Failed to approve return:",
                    error
                  );

                }

                setShowReturnDetails(false);
                setSelectedReturn(null);

              }}

              className="
                group
                relative
                overflow-hidden

                h-16
                sm:h-[68px]

                rounded-2xl

                bg-gradient-to-r
                from-pink-500
                via-pink-500
                to-rose-400

                text-white

                font-black
                text-base

                shadow-[0_10px_35px_rgba(236,72,153,.15)]

                hover:shadow-[0_15px_50px_rgba(236,72,153,.30)]

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
                  via-white/30
                  to-transparent
                "
              />

              <span className="
                relative
                z-10
                flex
                items-center
                justify-center
                gap-2
              ">
                <span className="text-lg">✓</span>
                Good Condition
              </span>

            </motion.button>


            {/* BROKEN */}

            <motion.button
              type="button"

              whileHover={{
                scale: 1.025,
                y: -3,
              }}

              whileTap={{
                scale: 0.97,
              }}

              onClick={async () => {

                if (!selectedReturn) return;

                try {

                  const res = await fetch(
                    `http://localhost:5000/return-requests/${selectedReturn.id}`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        status: "Broken",
                      }),
                    }
                  );

                  const updated = await res.json();

                  setReturnRequests((prev) =>
                    prev.map((r) =>
                      r.id === updated.id ? updated : r
                    )
                  );

                } catch (error) {

                  console.error(
                    "Failed to update return:",
                    error
                  );

                }

                setShowReturnDetails(false);
                setSelectedReturn(null);

              }}

              className="
                group
                relative
                overflow-hidden

                h-16
                sm:h-[68px]

                rounded-2xl

                bg-gradient-to-r
                from-red-500
                to-rose-500

                text-white

                font-black
                text-base

                shadow-[0_10px_35px_rgba(239,68,68,.10)]

                hover:shadow-[0_15px_45px_rgba(239,68,68,.25)]

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
                  via-white/20
                  to-transparent
                "
              />

              <span className="
                relative
                z-10

                flex
                items-center
                justify-center
                gap-2
              ">
                <span className="text-lg">×</span>
                Broken / Damaged
              </span>

            </motion.button>

          </div>

        </motion.div>

      </div>

    </motion.div>

  </div>
)}

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
              No Live Bookings
            </p>

            <p
              className="
                mt-2

                text-sm

                text-zinc-600
              "
            >
              There are currently no active bookings.
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
                          IN PROGRESS
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
                  IN PROGRESS
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

                    {item.type === "resource" ? (

                      <MapPin
                        className="
                          w-5
                          h-5

                          text-emerald-400
                        "
                      />

                    ) : (

                      <Package
                        className="
                          w-5
                          h-5

                          text-emerald-400
                        "
                      />

                    )}

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
              {(
                selectedLiveBooking.slotSystem ??
                selectedLiveBooking.isSlotSystem ??
                selectedLiveBooking.slotBased ??
                false
              )
                ? "Slot Based"
                : "Direct Booking"}
            </p>

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
              Booking currently in progress
            </p>

            <p
              className="
                text-[10px]

                text-zinc-600

                mt-0.5
              "
            >
              This booking is actively using the selected resource.
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
    <h3 className="font-black text-xl">
      Requests (0)
    </h3>
    <p className="text-zinc-500 text-sm mt-2">
      Pending approvals
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
{showLiveBookings && (

<div className="
fixed inset-0
z-[200]
bg-black/80
backdrop-blur-xl
flex
items-center
justify-center
">

<div className="
bg-zinc-950
border border-zinc-800
rounded-[32px]
p-10
w-[600px]
">

<button
onClick={() => setShowLiveBookings(false)}
className="
float-right
text-2xl
"
>
✕
</button>


<h2 className="text-4xl font-black">
Live Bookings
</h2>

<p className="text-zinc-500 mt-3">
Current equipment and court reservations
</p>


</div>

</div>

)}

























































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

No announcements yet

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

👁 Audience : {item.audience}

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
    await fetch(`http://localhost:5000/notices/${item.id}`, { method: 'DELETE' });
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

<label
className="
block
mb-4
font-bold
text-orange-300
"
>

Visible To

</label>

<div className="grid grid-cols-2 gap-5">

{[
{
title:"Everyone",
icon:"🌍",
desc:"Students, Staff & Admin"
},
{
title:"Admin & Staff",
icon:"🛡",
desc:"Only Admin and Staff"
}
].map((option)=>(

<button

key={option.title}

type="button"

onClick={()=>
setAnnouncementAudience(option.title)
}

className={`
group
relative

overflow-hidden

rounded-[26px]

border

p-6

text-left

transition-all
duration-300

${
announcementAudience===option.title

?

"border-orange-500 bg-orange-500/10 shadow-[0_0_35px_rgba(249,115,22,.25)] scale-[1.02]"

:

"border-zinc-800 bg-zinc-900/70 hover:border-orange-500/30 hover:-translate-y-1"

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

<h3
className="
text-xl
font-black
"
>

{option.title}

</h3>

<p
className="
mt-2
text-zinc-500
text-sm
leading-6
"
>

{option.desc}

</p>

</div>

</button>

))}

</div>

</div>

{/* Expiry */}

<div>

<label
className="
block
mb-3
font-bold
text-orange-300
"
>

Expiry

</label>

<input

type="date"

value={announcementExpiry}

onChange={(e)=>
setAnnouncementExpiry(e.target.value)
}

className="
w-full
h-16

rounded-[22px]

bg-zinc-900

border
border-zinc-800

px-6

outline-none

transition-all

focus:border-orange-500
focus:shadow-[0_0_30px_rgba(249,115,22,.18)]
"
/>

</div>

{/* Publish Button */}

<button

onClick={async () => {
  try {
    if (!announcementMessage.trim()) return;
    const res = await fetch('http://localhost:5000/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: announcementMessage, audience: announcementAudience, title: 'Announcement', expiry: announcementExpiry }),
    });
    const created = await res.json();
    setAnnouncements((prev) => [created, ...prev]);
    setAnnouncementMessage('');
    setAnnouncementAudience('Everyone');
    setAnnouncementExpiry('');
    setShowCreateAnnouncement(false);
  } catch (err) {
    console.error('Failed to create announcement', err);
    // fallback to local state
    setAnnouncements((prev) => [
      {
        id: Date.now(),
        title: 'Announcement',
        message: announcementMessage,
        audience: announcementAudience,
        expiry: announcementExpiry,
        createdAt: 'Just now',
      },
      ...prev,
    ]);
    setAnnouncementMessage('');
    setAnnouncementAudience('Everyone');
    setAnnouncementExpiry('');
    setShowCreateAnnouncement(false);
  }
}}

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

Publish Announcement

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











{showRequests && (

<div className="
fixed inset-0
z-[200]
bg-black/80
backdrop-blur-xl
flex
items-center
justify-center
">

<div
className="
relative

w-[900px]
h-[88vh]

overflow-hidden

rounded-[36px]

bg-gradient-to-br
from-zinc-950
via-black
to-zinc-950

border
border-orange-500/20

shadow-[0_0_70px_rgba(249,115,22,.18)]
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

onClick={()=>setShowRequests(false)}

className="
absolute
top-6
right-6

z-30

w-14
h-14

rounded-2xl

flex
items-center
justify-center

bg-zinc-900

border
border-zinc-800

hover:bg-red-500/20
hover:border-red-500/30
hover:rotate-90

transition-all
duration-300
"

>

✕

</button>

<div className="relative z-20 p-8">

<div className="flex justify-between items-start">

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

Anonymous Requests

</h2>

<p className="text-zinc-500 mt-2">

Requests visible to Staff & Admin

</p>

</div>

<div className="flex items-center gap-3">

<select

className="
h-12

rounded-xl

bg-zinc-900

border
border-zinc-800

px-4

outline-none

focus:border-orange-500
"

>

<option>Today's Requests</option>
<option>Yesterday</option>
<option>2 Days Ago</option>
<option>Last Week</option>

</select>

<button

onClick={()=>setShowCreateRequest(true)}

className="
group

relative

overflow-hidden

h-12

px-7

rounded-2xl

font-black

bg-gradient-to-r
from-yellow-400
via-orange-500
to-orange-600

text-black

hover:scale-105

transition-all
duration-300

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

＋ New Request

</span>

</button>

</div>

</div>

</div>

<div
className="
px-8

pb-8

overflow-y-auto

h-[70vh]

space-y-5
"
>

{requests.map((request,index)=>(

<motion.div

key={request.id}

initial={{
opacity:0,
y:30
}}

animate={{
opacity:1,
y:0
}}

transition={{
delay:index*0.06
}}

className="
group

relative

overflow-hidden

rounded-[32px]

border
border-orange-500/15

bg-gradient-to-br
from-zinc-900
to-zinc-950

p-7

hover:border-orange-500/35

hover:-translate-y-1

transition-all
duration-300

shadow-[0_0_30px_rgba(249,115,22,.08)]
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

<div className="relative">

<div className="flex justify-between">

<div className="flex gap-5">

<div
className="
w-14
h-14

rounded-2xl

flex
items-center
justify-center

bg-orange-500/10

border
border-orange-500/20

text-3xl
"
>

🎓

</div>

<div>

<h3
className="
text-2xl
font-black
"
>

Anonymous Staff

</h3>

<p
className="
text-zinc-500
text-sm
mt-1
"
>

Identity Hidden

</p>

</div>

</div>

<div
className="
flex
items-center
gap-3
"
>

{request.viewed ? (

<div
className="
px-4
py-2

rounded-full

bg-emerald-500/15

text-emerald-400

font-bold
text-sm
"
>

Seen

</div>

):(

<div
className="
px-4
py-2

rounded-full

bg-orange-500/15

text-orange-300

font-bold
text-sm

animate-pulse
"
>

New

</div>

)}

</div>

</div>

<p
className="
mt-8

text-zinc-300

leading-8

text-[17px]
"
>

{request.message}

</p>

<div
className="
mt-8

flex
justify-between
items-center
"
>

<div className="flex gap-3">

<div
className="
px-4
py-2

rounded-full

bg-zinc-800

text-zinc-400

text-sm
"
>

📅 {request.date}

</div>

<div
className="
px-4
py-2

rounded-full

bg-zinc-800

text-zinc-400

text-sm
"
>

🕒 {request.time}

</div>

</div>

<button

className="
w-12
h-12

rounded-xl

bg-red-500/10

border
border-red-500/20

hover:bg-red-500

hover:text-white

transition-all
"

>

🗑

</button>

</div>

</div>

</motion.div>

))}

</div>
</div>

</div>

)}
{/* ================= CREATE REQUEST ================= */}

{showCreateRequest && (

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

initial={{
opacity:0,
scale:.9,
y:40
}}

animate={{
opacity:1,
scale:1,
y:0
}}

exit={{
opacity:0,
scale:.9
}}

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

shadow-[0_0_80px_rgba(249,115,22,.22)]
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
setShowCreateRequest(false);
setRequestMessage("");
}}

className="
absolute
top-6
right-6

z-20

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
z-10

p-10

max-h-[85vh]

overflow-y-auto
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

New Anonymous Request

</h2>

<p
className="
mt-2
mb-8

text-zinc-500
"

>

Your identity will remain hidden from everyone.

</p>

<label
className="
block

mb-4

font-bold

text-orange-300
"

>

Message

</label>

<textarea

value={requestMessage}

onChange={(e)=>setRequestMessage(e.target.value)}

rows={10}

placeholder="Write your request, suggestion or thought..."

className="
w-full

rounded-[28px]

bg-zinc-900/80

border
border-zinc-800

p-6

resize-none

outline-none

transition-all
duration-300

focus:border-orange-500
focus:shadow-[0_0_35px_rgba(249,115,22,.22)]
"
/>

<div
className="
flex
justify-between

mt-3
"
>

<p
className="
text-zinc-600
text-sm
"
>

Anonymous • Staff Board

</p>

<p
className="
text-zinc-500
text-sm
"
>

{requestMessage.length}/1000

</p>

</div>

{/* Send Button */}

<button

onClick={async () => {
  try {
    if (!requestMessage.trim()) return;
    const body = {
      message: requestMessage,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      viewed: false,
    };
    const res = await fetch('http://localhost:5000/anonymous-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const created = await res.json();
    setRequests((prev) => [created, ...prev]);
    setRequestMessage('');
    setShowCreateRequest(false);
  } catch (err) {
    console.error('Failed to post anonymous request', err);
    setRequests((prev) => [
      {
        id: Date.now(),
        message: requestMessage,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        viewed: false,
      },
      ...prev,
    ]);
    setRequestMessage('');
    setShowCreateRequest(false);
  }
}}

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

Send Request

</span>

</button>

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

<button
onClick={async()=>{
setShowManageSport(false);
setSelectedSport(null);
}}
className="
absolute
top-6
right-6

w-12
h-12

rounded-xl

border
border-zinc-800

hover:border-red-500

transition

text-2xl
"
>
✕
</button>

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
<span className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
Active
</span>

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

<p className="text-zinc-500">
Total {selectedSport.resourceType || "Court"}s
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

<p className="text-zinc-500">
Total Gears
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

<p className="text-zinc-500">

Dynamic Booking

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

{maintenanceEnabled ? "ON" : "OFF"}

</p>
<p className="uppercase text-sm tracking-wider mt-3">

Maintenance

</p>

<p className="text-zinc-500">

{maintenanceEnabled

? "Maintenance Active"

: "No Active"}

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
onClick={() => setShowMaintenancePopup(true)}
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

)};





































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
"
>

<motion.div
initial={{
scale:.95,
y:20,
opacity:0
}}
animate={{
scale:1,
y:0,
opacity:1
}}
exit={{
scale:.95,
y:20,
opacity:0
}}
transition={{
type:"spring",
stiffness:180,
damping:18
}}
className="
w-[1080px]
h-[760px]
rounded-[36px]
border
border-orange-500/20
bg-zinc-950
shadow-[0_0_90px_rgba(249,115,22,.18)]
overflow-hidden
flex
"
>

{/* LEFT */}

<div className="flex-1 p-8 overflow-y-auto">

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

<div className="flex items-center gap-4">

<div
className="
px-4
py-2
rounded-full
bg-orange-500/10
border
border-orange-500/20
text-orange-400
text-sm
font-semibold
"
>

● Scheduled

</div>

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

<div>

<div className="flex items-center justify-between">

<div>

<p className="text-xl font-bold">
Maintenance Scope
</p>

<p className="text-zinc-500 text-sm mt-1">
Choose where maintenance should apply.
</p>

</div>

<select
className="
h-12
rounded-2xl
bg-zinc-900
border
border-zinc-800
px-4
outline-none
text-orange-300
"
>

<option>Running</option>

<option>Scheduled</option>

<option>Completed</option>

</select>

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

className="
flex-1
h-12
rounded-xl
bg-orange-500
text-black
font-bold
shadow-[0_0_25px_rgba(249,115,22,.35)]
"

>

Specific Resources

</motion.button>

<button

className="
flex-1
h-12
rounded-xl
text-zinc-400
hover:text-white
transition
"

>

Entire Sport

</button>

</div>

</div>

{/* Search */}

<div className="mt-8">

<div className="flex justify-between items-center">

<p className="font-bold text-xl">

Select Resources

</p>

<div
className="
w-[280px]
h-12
rounded-2xl
bg-zinc-900
border
border-zinc-800
flex
items-center
px-4
"
>

<input

placeholder="Search resources..."

className="
flex-1
bg-transparent
outline-none
text-sm
"

/>

<MagnifyingGlassIcon
className="w-5 h-5 text-zinc-500"
/>

</div>

</div>

<div
className="
mt-6
space-y-3
max-h-[260px]
overflow-y-auto
pr-2
"
>

{selectedSport?.resourceUnits?.map((resource:any)=>{

const checked =
selectedMaintenanceResources.includes(resource.id);

return(

<motion.div

key={resource.id}

layout

whileHover={{
y:-3,
scale:1.01
}}

whileTap={{
scale:.98
}}

className={`
rounded-2xl
border
cursor-pointer
transition-all
duration-300
p-5
flex
justify-between
items-center

${
checked
?

"border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,.20)]"

:

"border-zinc-800 bg-zinc-900 hover:border-orange-500/30"

}
`}

onClick={()=>{

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

{resource.type}

</p>

</div>

</div>

<div>

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

</div>

</motion.div>

);

})}

</div>

</div>

{/* Schedule */}

<div className="mt-8">

<p className="text-xl font-bold">

Maintenance Schedule

</p>

<p className="text-zinc-500 text-sm mt-1">

Choose when maintenance will run.

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
        h-[140px]
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
            "

        >

            Save Maintenance

        </motion.button>

    </div>

    {/* Small Schedule Button */}

    <div className="flex justify-center mt-7">

        <motion.button

            whileHover={{
                scale:1.04,
                y:-2
            }}

            whileTap={{
                scale:.97
            }}

            className="
            px-7
            h-12
            rounded-full
            border
            border-orange-500/30
            bg-orange-500/5
            text-orange-300
            font-semibold
            hover:bg-orange-500/10
            transition-all
            shadow-[0_0_18px_rgba(249,115,22,.10)]
            "

        >

            ＋ Schedule Another Maintenance

        </motion.button>

    </div>

</div>

</div>

{/* RIGHT PANEL */}

<motion.div

initial={{ x:40, opacity:0 }}

animate={{ x:0, opacity:1 }}

transition={{ delay:.2 }}

className="
w-[360px]
rounded-[34px]
border
border-orange-500/15
bg-gradient-to-b
from-zinc-950
to-black
p-6
shadow-[0_0_40px_rgba(249,115,22,.10)]
"

>

<div className="flex justify-between items-center">

<div>

<h2 className="text-2xl font-black">

Active Maintenance

</h2>

<p className="text-zinc-500 text-sm mt-1">

Currently scheduled maintenance

</p>

</div>

<div
className="
w-9
h-9
rounded-full
bg-orange-500/10
flex
items-center
justify-center
text-orange-400
font-bold
"
>

{selectedSport?.resourceUnits?.filter(
(r:any)=>r.status==="maintenance"
).length}

</div>

</div>

<div
className="
mt-6
space-y-5
max-h-[610px]
overflow-y-auto
pr-2
"
>

{selectedSport?.resourceUnits
?.filter((r:any)=>r.status==="maintenance")
.map((resource:any,index:number)=>(

<motion.div

key={resource.id}

initial={{
opacity:0,
y:25
}}

animate={{
opacity:1,
y:0
}}

transition={{
delay:index*.08
}}

whileHover={{
y:-4
}}

className="
rounded-3xl
border
border-orange-500/15
bg-zinc-900
p-5
"

>

<div className="flex justify-between items-center">

<span
className="
rounded-full
bg-orange-500/10
px-4
py-1
text-xs
font-bold
text-orange-300
"
>

Running

</span>

<span
className="
rounded-full
bg-emerald-500/10
px-3
py-1
text-xs
font-semibold
text-emerald-300
"
>

Live

</span>

</div>

<div className="mt-5">

<h3 className="font-bold text-lg">

{resource.name}

</h3>

<p className="text-zinc-500 text-sm mt-2">

{resource.maintenanceMessage ||

"No maintenance message."

}

</p>

</div>

<div className="mt-6 flex gap-3">

<motion.button

whileHover={{
scale:1.05
}}

whileTap={{
scale:.95
}}

className="
flex-1
h-11
rounded-xl
border
border-zinc-700
hover:border-orange-500
transition
"

>

Edit

</motion.button>

<motion.button

whileHover={{
scale:1.05
}}

whileTap={{
scale:.95
}}

className="
flex-1
h-11
rounded-xl
border
border-red-500/30
text-red-400
hover:bg-red-500/10
transition
"

>

Delete

</motion.button>

</div>

</motion.div>

))}

{selectedSport?.resourceUnits?.filter(
(r:any)=>r.status==="maintenance"
).length===0 && (

<div
className="
rounded-3xl
border
border-zinc-800
bg-zinc-900
p-10
text-center
"
>

<WrenchScrewdriverIcon
className="
mx-auto
w-12
h-12
text-zinc-600
"
/>

<p className="mt-5 text-zinc-500">

No active maintenance.

</p>

</div>

)}

</div>

<motion.button

whileHover={{
scale:1.02
}}

whileTap={{
scale:.98
}}

className="
mt-6
w-full
h-14
rounded-2xl
border
border-zinc-700
bg-zinc-900
hover:border-orange-500
transition
"

>

View All Notices →

</motion.button>

</motion.div>

</motion.div>

)
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
)};

    </main>


  );
}


