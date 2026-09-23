export type UserRole = "student" | "staff" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  rollNo?: string | null;
  phone?: string | null;
  idCardPhoto?: string | null;
}

export interface ResourceUnit {
  id: number;
  sportId: number;
  name: string;
  type: string;
  status: string;
  maintenanceMessage?: string | null;
}

export interface Gear {
  id: number;
  name: string;
  description?: string | null;
  sportId: number;
  totalQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
}

export interface Slot {
  id: number;
  sportId: number;
  startTime: string;
  endTime: string;
  slotType: string;
  isActive: boolean;
  bookedById?: number | null;
  maxCapacity: number;
  bookedCount: number;

  isBooked?: boolean;
  bookedBy?: {
    id: number;
    name: string;
    rollNo?: string | null;
  } | null;

  isTeamReserved?: boolean;
  teamName?: string | null;
}

export interface Sport {
  id: number;
  name: string;

  hasSlotSystem: boolean;
  slotDurationMinutes: number;

  totalCourts: number;
  availableCourts: number;

  maintenance: boolean;
  maintenanceMessage?: string | null;

  hasDynamicBooking: boolean;
  hasTeamSlots: boolean;

  resourceType: string;

  gears?: Gear[];
  resourceUnits?: ResourceUnit[];
  resources?: ResourceUnit[];
  slots?: Slot[];

  bookings?: Booking[];
  totalBookings?: number;
  totalStudents?: number;
}

export interface Booking {
  id: number;
  userId: number;
  sportId: number;

  slotId?: number | null;

  bookingType: string;

  gearsBooked?: GearBookingItem[] | null;
  resourcesBooked?: unknown[] | null;

  active: boolean;
  status: string;

  bookedAt: string;

  startTime?: string | null;
  endTime?: string | null;

  cancelledAt?: string | null;
  notes?: string | null;

  returnRequestedAt?: string | null;
  returnedAt?: string | null;

  sport?: Sport;
  slot?: Slot;
  user?: User;
}

export interface GearBookingItem {
  gearId: number;
  quantity: number;
}

export interface Notice {
  id: number;
  title: string;
  message: string;
  type: string;
  sportId?: number | null;
  createdAt: string;
  sport?: {
    name: string;
  } | null;
}

export interface TeamReservation {
  id: number;
  teamName: string;
  purpose?: string | null;

  sportId: number;

  startDateTime: string;
  endDateTime: string;

  durationMinutes: number;

  reservationMessage?: string | null;

  bookedById?: number | null;

  sport?: Sport;

  resourcesUnit?: {
    id: number;
    resourceUnit: ResourceUnit;
  }[];
}

export interface IssuedGear {
  id: number;
  userId: number;
  gearId: number;

  quantityIssued: number;

  issueDate: string;
  expectedReturnDate?: string | null;
  returnDate?: string | null;

  status: string;

  condition?: string | null;
  issueNotes?: string | null;

  gear?: Gear & {
    sport?: {
      name: string;
    };
  };

  user?: User;
}

export interface StudentHistoryResponse {
  student: User;

  bookings: Booking[];

  issuedGears: IssuedGear[];
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  rollNo?: string | null;
}