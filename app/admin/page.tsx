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

export default function AdminSportsPage() {
  const [sports, setSports] = useState<any[]>([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSport, setShowCreateSport] =
  useState(false);
  
  const [sportName, setSportName] =
  useState("");

const [hasSlotSystem, setHasSlotSystem] =
  useState(false);

const [slotDurationMinutes, setSlotDurationMinutes] =
  useState(30);

const [slotCapacity, setSlotCapacity] =
  useState(1);

  const [resourceType, setResourceType] =
  useState("Court");
  const [customResourceType, setCustomResourceType] =
useState("");
const [totalCourts, setTotalCourts] =
  useState(0);

const [showDurationModal, setShowDurationModal] =
  useState(false);

  const [showCapacityModal, setShowCapacityModal] =
  useState(false);
const [reservationStartTime,setReservationStartTime]=useState("");

const [reservationDuration,setReservationDuration]=useState(120);

const [selectedReservationResources,setSelectedReservationResources]=useState<number[]>([]);
const [showResourceTypeModal, setShowResourceTypeModal] =
  useState(false);
const [showEditResourceTypeModal, setShowEditResourceTypeModal] =
  useState(false);

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
const [sportCreated, setSportCreated] =
  useState(false);
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
 const createSport = async () => {

  if (!sportName.trim()) {
    alert("Please enter sport name");
    return;
  }

  if (!quantitySelected || totalCourts <= 0) {
    alert("Please select quantity");
    return;
  }

  if (
    resourceType === "Custom" &&
    !customResourceType.trim()
  ) {
    alert("Please enter custom resource type");
    return;
  }

  try {

    const response = await fetch(
      "http://localhost:5000/sports",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
    name: sportName,
    hasSlotSystem,
    slotDurationMinutes,
    slotCapacity,
    resourceType:
        resourceType === "Custom"
            ? customResourceType
            : resourceType,
    totalCourts,
}),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create sport");
    }

    await fetchSports();

    resetCreateSport();

  } catch (error) {
    console.log(error);
  }

};

const resetCreateSport = () => {
  setShowCreateSport(false);
  setSportName("");
  setHasSlotSystem(false);
  setSlotDurationMinutes(30);
  setSlotCapacity(1);
  setResourceType("Court");
  setCustomResourceType("");
  setTotalCourts(0);
  setShowDurationModal(false);
  setShowCapacityModal(false);
  setShowResourceTypeModal(false);
  setShowQuantityModal(false);
  setTempValue("");
  setShowRenameModal(false);
  setSelectedResourceIndex(null);
  setNewResourceName("");
  setResourceUnits([]);
  setShowSuccessToast(true);
  setTimeout(() => setShowSuccessToast(false), 2000);
};

  useEffect(() => {
    fetchSports();
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
                Admin 👤
              </p>
            </div>

          </div>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
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

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <p className="text-4xl mb-2">👥</p>
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

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <p className="text-4xl mb-2">🎓</p>
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

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
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

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
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

        {/* QUICK ACTIONS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

<button
  onClick={() => setShowCreateSport(true)}
  className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-emerald-500 transition-all hover:-translate-y-1"
>
    <div className="text-4xl mb-4">➕</div>
    <h3 className="font-black text-xl">Create Sport</h3>
    <p className="text-zinc-500 text-sm mt-2">
      Add new sports dynamically
    </p>
  </button>

  <button className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-sky-500 transition-all hover:-translate-y-1">
    <div className="text-4xl mb-4">👥</div>
    <h3 className="font-black text-xl">Add Staff</h3>
    <p className="text-zinc-500 text-sm mt-2">
      Manage staff accounts
    </p>
  </button>

  <button className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-yellow-500 transition-all hover:-translate-y-1">
    <div className="text-4xl mb-4">📢</div>
    <h3 className="font-black text-xl">Announcement</h3>
    <p className="text-zinc-500 text-sm mt-2">
      Publish important notices
    </p>
  </button>

  <button className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-purple-500 transition-all hover:-translate-y-1">
    <div className="text-4xl mb-4">🔔</div>
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
        {sports
          .filter((sport) =>
            sport.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((sport) => (
            <div
              key={`sj;earch-${sport.id}`}
              className="py-4 border-b border-zinc-800"
            >
              <p className="font-semibold text-white">{sport.name}</p>
              <p className="text-sm text-zinc-500">
                {sport.resourceType || "Court"}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-4xl font-black mb-8">
          Sports
        </h2>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {sports.map((sport) => (
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
      {showCreateSport && (
        <div className="
fixed inset-0
z-50
bg-black/80
backdrop-blur-xl
flex
items-center
justify-center
p-6
">

<div
className="
relative
w-full
max-w-2xl
overflow-hidden
bg-gradient-to-br
from-zinc-900
to-black
border
border-zinc-800
rounded-[40px]
p-10
max-h-[90vh]
overflow-y-auto
"
>

<div className="relative mb-10">

  <button
    onClick={() => setShowCreateSport(false)}
    className="
    absolute
    top-0
    right-0
    text-3xl
    text-zinc-400
    hover:text-white
    transition
    "
  >
    ✕
  </button>

  <h2 className="text-5xl font-black">
    Create Sport
  </h2>

  <p className="text-zinc-500 mt-2 text-lg">
    Configure sport settings and resources
  </p>

</div>

     <div
className="
mb-8
animate-[fadeUp_.4s_ease]
"
>

<label className="
block
text-xl
font-bold
mb-4
">
Sport Name
</label>

<input
value={sportName}
onChange={(e)=>
setSportName(e.target.value)
}
placeholder="Enter name"
className="
w-full
bg-black
border
border-zinc-800
rounded-[24px]
p-6
text-xl
focus:border-emerald-500
outline-none
transition-all
"
/>

</div> 
<div
className="
mb-10
animate-[fadeUp_.5s_ease]
"
style={{
animationDelay:"100ms"
}}
>

<h3 className="
text-xl
font-bold
mb-6
">
Dynamic Booking
</h3>

<div
onClick={() =>
setHasSlotSystem(!hasSlotSystem)
}
className="
cursor-pointer
select-none
"
>

<div className="
flex
items-center
justify-center
gap-6
">

<span
className={
!hasSlotSystem
? "font-bold text-white"
: "text-zinc-500"
}
>
OFF
</span>

<div className="
relative
w-72
h-2
bg-zinc-800
rounded-full
">

<div
className={`
absolute
top-1/2
-translate-y-1/2
w-7
h-7
rounded-full
bg-gradient-to-br
from-emerald-300
to-emerald-500
shadow-[0_0_50px_rgba(16,185,129,1)]
transition-all
duration-500
${
hasSlotSystem
? "left-[88%]"
: "left-0"
}
`}
/>

</div>

<span
className={
hasSlotSystem
? "font-bold text-emerald-400"
: "text-zinc-500"
}
>
ON
</span>

</div>

<p className="
text-center
text-zinc-400 leading-6
text-sm
mt-4
">
6-hour dynamic booking window
</p>

</div>

</div>
{hasSlotSystem && (
<>
  <div
    onClick={() => setShowDurationModal(true)}
    className="
    mb-6
    bg-black
    border
    border-zinc-800
    rounded-[24px]
    p-6
    cursor-pointer
    hover:border-emerald-500
    transition-all
    "
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-zinc-500">
          Slot Duration
        </p>

        <h3 className="text-3xl font-black">
          {slotDurationMinutes} Minutes
        </h3>
      </div>

      <span className="text-3xl">
        ▼
      </span>
    </div>
  </div>

  <div
    onClick={() => setShowCapacityModal(true)}
    className="
    mb-6
    bg-black
    border
    border-zinc-800
    rounded-[24px]
    p-6
    cursor-pointer
    hover:border-emerald-500
    transition-all
    "
  >
    <p className="text-zinc-500">
      Slot Capacity
    </p>

    <h3 className="text-3xl font-black">
      {slotCapacity}
    </h3>
  </div>
</>
)}
<div className="mb-10">

<div className="
flex
justify-between
items-center
mb-4
">

<div className="mb-4">

  <h3 className="text-xl font-bold">
    Resources
  </h3>

  <p className="text-zinc-500 text-sm mt-1">
    Select the resource type and quantity
    for this sport.
  </p>

</div>


</div>
<div
className="
bg-black
border
border-zinc-800
rounded-[24px]

px-6
py-5

flex
items-center
justify-between
"
>

  {/* RESOURCE TYPE */}

  <button
    onClick={() =>
      setShowResourceTypeModal(true)
    }
    className="
    group

    px-6
    py-3

    rounded-full

    bg-zinc-950

    border
    border-emerald-500/30

    text-emerald-400

    hover:border-emerald-400
    hover:shadow-[0_0_25px_rgba(16,185,129,.25)]

    transition-all
    duration-300
    "
  >

    <div className="flex items-center gap-3">

      <span className="text-lg">
        {getResourceIcon()}
      </span>

      <div className="text-left">

        <p className="text-[10px] uppercase text-zinc-500">
          Resource Type
        </p>

        <p className="font-bold">
          {resourceType || "Select Type"}
        </p>

      </div>

      <span>▼</span>

    </div>

  </button>

  {/* QUANTITY */}

  <button
    onClick={() => {

      if (!resourceType) {
        alert("Select Resource Type first");
        return;
      }

      setShowQuantityModal(true);

    }}
    className="
    group

    relative
    overflow-hidden

    px-7
    py-3

    rounded-full

    bg-gradient-to-r
    from-cyan-500/15
    to-sky-500/15

    border
    border-cyan-400/30

    text-cyan-300

    font-bold

    hover:border-cyan-300
    hover:shadow-[0_0_35px_rgba(34,211,238,.35)]
    hover:scale-[1.03]

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
      from-transparent
      via-cyan-400/10
      to-transparent

      animate-pulse
      "
    />

    <div className="relative flex items-center gap-2">

      <span>📦</span>

      <span>
        {quantitySelected
          ? `Quantity: ${totalCourts}`
          : "Select Quantity"}
      </span>

      <span>▼</span>

    </div>

  </button>

</div>

{quantitySelected && totalCourts > 0 && (

<div
  className="
  bg-black
  border
  border-zinc-800
  rounded-[24px]
  p-6
  mb-8
  "
>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {resourceUnits.map((resource, index) => (

  <div
    key={resource.id}
    onClick={() => {
      setSelectedResourceIndex(index);
      setNewResourceName(resource.name);
      setShowRenameModal(true);
    }}
        className="

group

cursor-pointer

bg-zinc-950

border

border-transparent

rounded-2xl

px-4

py-3

hover:border-emerald-500/30

hover:bg-zinc-900

hover:translate-x-2

hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]

transition-all

duration-300

"

>

        <div className="flex items-center gap-4">

          <span className="text-5xl ">
            {getResourceIcon()}
          </span>

          <span className="font-semibold text-lg">
            {resource.name}
          </span>

        </div>

      </div>
    
      ))}

  </div>

</div>

)}
</div>

<div className="mt-8">
  
  <button
    onClick={createSport}
    className="
    w-full
    h-20
    rounded-[28px]
    font-black
    text-2xl
    bg-gradient-to-r
    from-emerald-500
    to-emerald-400
    hover:from-emerald-400
    hover:to-emerald-300
    hover:scale-[1.02]
    active:scale-[0.99]
    transition-all
    duration-300
    shadow-[0_0_60px_rgba(16,185,129,0.45)]
    "
  >
    Create Sport
  </button>
  
</div>

</div>

<div
className="
absolute
inset-0
rounded-[40px]
bg-gradient-to-br
from-emerald-500/5
via-transparent
to-cyan-500/5
pointer-events-none
"
/>
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

    await createResources({
      sportId: selectedSport.id,
      resourceType: baseName,
      quantity: qty,
    });

    await fetchSports();

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
