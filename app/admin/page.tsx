"use client";

import { API_BASE_URL } from "@/lib/config";
import { authFetch } from "@/lib/auth";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import AnonymousRequestsModal from "@/components/suggestions/AnonymousRequestsModal";
import DamagedGearModal from "@/components/staff/DamagedGearModal";
import TeamReservationBadge from "@/components/ui/TeamReservationBadge";
import { useSuggestionUnread } from "@/lib/suggestions";
import ResourceManagerPopup from "@/components/ResourceManagerPopup";
import { AnimatePresence } from "framer-motion";
// import motion from "framer-motion";
import {
  ClockIcon,
  WrenchScrewdriverIcon,
  BuildingOffice2Icon,
  UsersIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

type ResourceItem = { id: string; name: string };

export default function AdminSportsPage() {
  const [sports, setSports] = useState<any[]>([]);
  const [bookings, setBookings] = useState([]);
  const [dashStats, setDashStats] = useState<{
    sports: number;
    activeSports: number;
    staff: number;
    students: number;
    resources: number;
    bookings: number;
    activeBookings?: number;
    todaysBookings?: number;
    gearIssued?: number;
    damagedGear?: number;
    freeResources?: number;
  } | null>(null);
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
  const [showRequests, setShowRequests] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementAudience, setAnnouncementAudience] = useState("everyone");
  const [announcementType, setAnnouncementType] = useState("announcement");
  const [announcementSportId, setAnnouncementSportId] = useState("");
  const [announcementExpiry, setAnnouncementExpiry] = useState("");
  const [announcementError, setAnnouncementError] = useState("");
  const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);
  const [loadErrors, setLoadErrors] = useState<Record<string, string | undefined>>({});

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffList, setStaffList] = useState<{ id: number; name: string; email: string; rollNo: string | null }[]>([]);
  const [staffListError, setStaffListError] = useState("");
  const [removingStaffId, setRemovingStaffId] = useState<number | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffId, setStaffId] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffError, setStaffError] = useState("");
  const [staffSubmitting, setStaffSubmitting] = useState(false);
  const [staffCreatedMessage, setStaffCreatedMessage] = useState("");
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [showDamagedGear, setShowDamagedGear] = useState(false);
  const unreadRequests = useSuggestionUnread();
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

const [advanceBookingDays,setAdvanceBookingDays]=useState(7);  
const fetchSports = async () => {
    try {
      const response = await authFetch(
        `${API_BASE_URL}/sports`
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

    const response = await authFetch(
      `${API_BASE_URL}/sports`,
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
    resourceUnits,
}),
      }
    );

    if (!response.ok) {
    console.log(await response.text());
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
    authFetch(`${API_BASE_URL}/dashboard/stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDashStats(data))
      .catch(() => setDashStats(null));

    authFetch(`${API_BASE_URL}/notices`)
      .then(async (res) => {
        if (!res.ok) {
          setLoadErrors((prev) => ({ ...prev, notices: "Could not load announcements." }));
          return;
        }
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      })
      .catch(() => setLoadErrors((prev) => ({ ...prev, notices: "Could not reach the server." })));
  }, []);

  const loadStaffList = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/staff`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStaffListError(data?.message || "Could not load staff accounts.");
        return;
      }
      setStaffList(Array.isArray(data) ? data : []);
      setStaffListError("");
    } catch {
      setStaffListError("Could not reach the server.");
    }
  };

  const refreshDashStats = () => {
    authFetch(`${API_BASE_URL}/dashboard/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setDashStats(d))
      .catch(() => {});
  };

  const removeStaff = async (member: { id: number; name: string }) => {
    if (removingStaffId) return;
    if (!window.confirm(`Remove ${member.name}? They will be signed out and can no longer log in.`)) return;

    setRemovingStaffId(member.id);
    try {
      const res = await authFetch(`${API_BASE_URL}/staff/${member.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStaffListError(data?.message || "Could not remove the staff account.");
        return;
      }
      setStaffList((prev) => prev.filter((s) => s.id !== member.id));
      setStaffListError("");
      refreshDashStats();
    } catch {
      setStaffListError("Could not reach the server.");
    } finally {
      setRemovingStaffId(null);
    }
  };

  const resetAddStaff = () => {
    setShowAddStaff(false);
    setStaffName("");
    setStaffEmail("");
    setStaffPhone("");
    setStaffId("");
    setStaffPassword("");
    setShowStaffPassword(false);
    setStaffError("");
  };

  const createStaff = async () => {
    if (staffSubmitting) return;

    const name = staffName.trim();
    const email = staffEmail.trim();

    if (!name) return setStaffError("Please enter the staff member's name.");
    if (!email) return setStaffError("Please enter an email address.");
    if (staffPassword.length < 8) return setStaffError("Password must be at least 8 characters.");

    setStaffError("");
    setStaffSubmitting(true);

    try {
      const res = await authFetch(`${API_BASE_URL}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: staffPhone.trim(),
          staffId: staffId.trim(),
          password: staffPassword,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStaffError(data?.message || "Could not create the staff account.");
        return;
      }

      resetAddStaff();
      setStaffCreatedMessage(`Staff account created for ${name}`);
      setTimeout(() => setStaffCreatedMessage(""), 3500);

      refreshDashStats();
    } catch (err) {
      console.error("CREATE STAFF ERROR:", err);
      setStaffError("Could not reach the server. Check that the backend is running and try again.");
    } finally {
      setStaffSubmitting(false);
    }
  };

const deleteSport = async (id: string) => {

  const confirmed = window.confirm(
    "Delete this sport? Its slots, gear, resources and booking history will be deleted too. This cannot be undone."
  );

  if (!confirmed) return;

  try {

    const response = await authFetch(
  `${API_BASE_URL}/sports/${id}`,
  {
    method: "DELETE",
  }
);

if (!response.ok) {
  const data = await response.json().catch(() => null);
  window.alert(data?.message || "Could not delete the sport.");
  return;
}

await fetchSports();

  } catch (error) {
    console.error("DELETE SPORT ERROR:", error);
    window.alert("Could not reach the server. Check that the backend is running and try again.");
  }

};
const updateSport = async(updatedSport:any)=>{

try{

const response = await authFetch(

`${API_BASE_URL}/sports/${updatedSport.id}`,

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
      const response = await authFetch(`${API_BASE_URL}/team-reservations`, {
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
    const response = await authFetch(`${API_BASE_URL}/sports`);
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
    const response = await authFetch(`${API_BASE_URL}/sports/${sportId}/maintenance-windows`);
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
    const response = await authFetch(`${API_BASE_URL}/sports/${selectedSport.id}/maintenance-windows`, {
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
    const response = await authFetch(`${API_BASE_URL}/sports/${selectedSport.id}/maintenance-windows/${windowId}/end`, {
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
  <span className="text-emerald-400 font-bold text-4xl" title="Sports not in maintenance">
    {dashStats ? dashStats.activeSports : "—"}
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

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <p className="text-4xl mb-2">👥</p>
            <h3 className="font-black text-xl">
              Staff
            </h3>
            <p className="text-violet-400 font-bold text-3xl mt-3">
              {dashStats ? dashStats.staff : "—"}
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
              {dashStats ? dashStats.students : "—"}
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
              {dashStats ? dashStats.resources : "—"}
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
              {dashStats ? dashStats.bookings : "—"}
            </p>
            <p className="text-zinc-400">
              Bookings
            </p>
          </div>

        </div>

        {/* LIVE ANALYTICS */}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Active bookings", hint: "Booked or waiting for return", value: dashStats?.activeBookings, color: "text-emerald-400" },
            { label: "Gear issued", hint: "Items with students now", value: dashStats?.gearIssued, color: "text-sky-400" },
            { label: "Damaged gear", hint: "Out of stock until repaired", value: dashStats?.damagedGear, color: "text-red-400" },
            { label: "Free resources", hint: "Courts/tables free right now", value: dashStats?.freeResources, color: "text-violet-400" },
            { label: "Today's usage", hint: "Bookings made today", value: dashStats?.todaysBookings, color: "text-amber-400" },
          ].map((card) => (
            <div key={card.label} className="bg-zinc-900/70 rounded-3xl p-5 border border-zinc-800">
              <p className="text-zinc-400 text-sm font-semibold">{card.label}</p>
              <p className={`${card.color} font-black text-3xl mt-2`}>{card.value ?? "—"}</p>
              <p className="text-zinc-500 text-xs mt-1">{card.hint}</p>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">

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

  <button
    onClick={() => { setShowAddStaff(true); loadStaffList(); }}
    className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-sky-500 transition-all hover:-translate-y-1"
  >
    <div className="text-4xl mb-4">👥</div>
    <h3 className="font-black text-xl">Add Staff</h3>
    <p className="text-zinc-500 text-sm mt-2">
      Manage staff accounts
    </p>
  </button>

  <button
    onClick={() => setShowDamagedGear(true)}
    className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-red-500 transition-all hover:-translate-y-1"
  >
    <div className="text-4xl mb-4">🛠️</div>
    <h3 className="font-black text-xl">Damaged Gear</h3>
    <p className="text-zinc-500 text-sm mt-2">
      View &amp; clear damage records
    </p>
  </button>

  <button
    onClick={() => setShowAnnouncement(true)}
    className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-yellow-500 transition-all hover:-translate-y-1"
  >
    <div className="text-4xl mb-4">📢</div>
    <h3 className="font-black text-xl">Announcement</h3>
    <p className="text-zinc-500 text-sm mt-2">
      Publish important notices
    </p>
  </button>

  <button
    onClick={() => setShowRequests(true)}
    className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 hover:border-purple-500 transition-all hover:-translate-y-1"
  >
    <div className="text-4xl mb-4">🔔</div>
    <h3 className="font-black text-xl flex items-center justify-center gap-2">
      Requests ({unreadRequests})
      {unreadRequests > 0 && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-400" />
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
                      <TeamReservationBadge summary={sport.teamReservation} />
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

🕒 {new Date(item.createdAt).toLocaleString()}
{item.expiresAt ? ` · expires ${new Date(item.expiresAt).toLocaleString()}` : ""}
{item.sport?.name ? ` · ${item.sport.name}` : ""}

</div>

</div>

</div>

<div className="pl-8">

<button

onClick={async () => {
  if (!window.confirm(`Delete "${item.title}"? Everyone will stop seeing it.`)) return;
  try {
    const res = await authFetch(`${API_BASE_URL}/notices/${item.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.message || 'Could not delete the announcement.');
      return;
    }
    setAnnouncements((prev) => prev.filter((a) => a.id !== item.id));
  } catch (err) {
    console.error('Failed to delete announcement', err);
    alert('Could not reach the server. Check that the backend is running and try again.');
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
setAnnouncementAudience("everyone");
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
    const res = await authFetch(`${API_BASE_URL}/notices`, {
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

{/* ================= ADD STAFF ================= */}
{showAddStaff && (
<div className="fixed inset-0 z-[260] bg-black/85 backdrop-blur-xl flex items-center justify-center p-6">
<motion.div initial={{opacity:0,scale:.92,y:30}} animate={{opacity:1,scale:1,y:0}} transition={{duration:.3,ease:[0.16,1,0.3,1]}} className="relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-[36px] bg-gradient-to-br from-zinc-950 via-black to-zinc-950 border border-sky-500/20 shadow-[0_0_80px_rgba(56,189,248,.18)] p-10">
<button type="button" onClick={resetAddStaff} className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-red-500/15 hover:border-red-500/40 hover:rotate-90 transition-all duration-300">✕</button>
<h2 className="text-4xl font-black bg-gradient-to-r from-sky-300 via-cyan-300 to-sky-500 bg-clip-text text-transparent">Add Staff</h2>
<p className="text-zinc-500 mt-2 mb-8">Create a staff account. They can sign in with the email or staff ID.</p>
<div className="space-y-5">
<div>
<label className="block mb-3 font-bold text-sky-300">Full Name</label>
<input type="text" name="new-staff-name" autoComplete="off" value={staffName} onChange={(e)=>setStaffName(e.target.value)} placeholder="e.g. Rahul Sharma" className="w-full h-14 rounded-[20px] bg-zinc-900/80 border border-zinc-800 px-5 outline-none transition-all duration-300 focus:border-sky-500 focus:shadow-[0_0_30px_rgba(56,189,248,.18)]" />
</div>
<div>
<label className="block mb-3 font-bold text-sky-300">Email</label>
<input type="email" name="new-staff-email" autoComplete="off" value={staffEmail} onChange={(e)=>setStaffEmail(e.target.value)} placeholder="e.g. rahul.sharma@xyzuniversity.ac.in" className="w-full h-14 rounded-[20px] bg-zinc-900/80 border border-zinc-800 px-5 outline-none transition-all duration-300 focus:border-sky-500 focus:shadow-[0_0_30px_rgba(56,189,248,.18)]" />
</div>
<div>
<label className="block mb-3 font-bold text-sky-300">Phone (optional)</label>
<input type="tel" name="new-staff-phone" autoComplete="off" inputMode="numeric" maxLength={10} value={staffPhone} onChange={(e)=>setStaffPhone(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 9876543210" className="w-full h-14 rounded-[20px] bg-zinc-900/80 border border-zinc-800 px-5 outline-none transition-all duration-300 focus:border-sky-500 focus:shadow-[0_0_30px_rgba(56,189,248,.18)]" />
</div>
<div>
<label className="block mb-3 font-bold text-sky-300">Staff ID (optional)</label>
<input type="text" name="new-staff-id" autoComplete="off" value={staffId} onChange={(e)=>setStaffId(e.target.value)} placeholder="e.g. STF-1024 (they can log in with this too)" className="w-full h-14 rounded-[20px] bg-zinc-900/80 border border-zinc-800 px-5 outline-none transition-all duration-300 focus:border-sky-500 focus:shadow-[0_0_30px_rgba(56,189,248,.18)]" />
</div>
<div>
<label className="block mb-3 font-bold text-sky-300">Password</label>
<div className="relative">
<input type={showStaffPassword ? "text" : "password"} name="new-staff-password" autoComplete="new-password" value={staffPassword} onChange={(e)=>setStaffPassword(e.target.value)} placeholder="e.g. Court#2026 (at least 8 characters)" className="w-full h-14 rounded-[20px] bg-zinc-900/80 border border-zinc-800 pl-5 pr-14 outline-none transition-all duration-300 focus:border-sky-500 focus:shadow-[0_0_30px_rgba(56,189,248,.18)]" />
<button type="button" onClick={()=>setShowStaffPassword((prev)=>!prev)} aria-label={showStaffPassword ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">{showStaffPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
</div>
<p className="mt-2 text-sm text-zinc-500">Share this password with the staff member. They use it with their email or staff ID to log in.</p>
</div>
</div>
{staffError && (<div role="alert" className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-300">{staffError}</div>)}
<button type="button" onClick={createStaff} disabled={staffSubmitting} className="mt-8 w-full h-16 rounded-[24px] bg-gradient-to-r from-sky-400 to-cyan-400 text-black font-black text-xl shadow-[0_0_40px_rgba(56,189,248,.35)] hover:scale-[1.02] active:scale-[.98] transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100">{staffSubmitting ? "Creating..." : "Create Staff Account"}</button>
<div className="mt-10 border-t border-zinc-800 pt-8">
<h3 className="text-xl font-black text-sky-300">Current staff</h3>
{staffListError && (<p role="alert" className="mt-3 text-sm font-semibold text-red-300">{staffListError}</p>)}
{staffList.length === 0 && !staffListError && (<p className="mt-3 text-sm text-zinc-500">No staff accounts yet.</p>)}
<ul className="mt-4 space-y-3">
{staffList.map((member) => (
<li key={member.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-4">
<div className="min-w-0">
<p className="font-bold truncate">{member.name}</p>
<p className="text-sm text-zinc-500 truncate">{member.email}{member.rollNo ? ` · ${member.rollNo}` : ""}</p>
</div>
<button type="button" onClick={() => removeStaff(member)} disabled={removingStaffId !== null} className="shrink-0 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/20 transition-colors disabled:opacity-50">{removingStaffId === member.id ? "Removing..." : "Remove"}</button>
</li>
))}
</ul>
</div>
</motion.div>
</div>
)}
{staffCreatedMessage && (<div className="fixed bottom-8 right-8 z-[300] rounded-2xl border border-emerald-500/30 bg-zinc-950 px-6 py-4 font-bold text-emerald-300 shadow-[0_0_40px_rgba(16,185,129,.25)]">{staffCreatedMessage}</div>)}

      <AnonymousRequestsModal open={showRequests} onClose={() => setShowRequests(false)} />
      <DamagedGearModal open={showDamagedGear} onClose={() => setShowDamagedGear(false)} role="admin" />
    </main>


  );
}





