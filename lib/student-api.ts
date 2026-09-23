import { api } from "./api";

import {
  Booking,
  Gear,
  IssuedGear,
  Notice,
  Slot,
  Sport,
  StudentHistoryResponse,
} from "@/types";

export const studentApi = {
  getSports() {
    return api.get<Sport[]>("/sports");
  },

  getSport(sportId: number) {
    return api.get<Sport>(`/sports/${sportId}`);
  },

  getAvailableSlots(sportId: number) {
    return api.get<Slot[]>(
      `/sports/${sportId}/available-slots`
    );
  },

  getSportGears(sportId: number) {
    return api.get<Gear[]>(
      `/sports/${sportId}/gears`
    );
  },

  getNotices(sportId?: number) {
    const query =
      sportId !== undefined
        ? `?sportId=${sportId}`
        : "";

    return api.get<Notice[]>(
      `/notices${query}`
    );
  },

  getMyBookings(userId: number) {
    return api.get<Booking[]>(
      `/users/${userId}/bookings`
    );
  },

  getMyHistory(userId: number) {
    return api.get<StudentHistoryResponse>(
      `/students/${userId}/history`
    );
  },

  bookSlot(data: {
    userId: number;
    sportId: number;
    slotId: number;
    gearsBooked?: {
      gearId: number;
      quantity: number;
    }[];
    notes?: string;
  }) {
    return api.post<{
      message: string;
      booking: Booking;
    }>("/bookings/slot", data);
  },

  bookGear(data: {
    userId: number;
    sportId: number;
    gearsBooked: {
      gearId: number;
      quantity: number;
    }[];
    notes?: string;
  }) {
    return api.post<{
      message: string;
      booking: Booking;
    }>("/bookings/gear", data);
  },

  cancelBooking(bookingId: number) {
    return api.post<{
      message: string;
      booking: Booking;
    }>(
      `/bookings/${bookingId}/cancel`
    );
  },

  requestReturn(bookingId: number) {
    return api.put<Booking>(
      `/return-request/${bookingId}`
    );
  },

  getIssuedGear(userId: number) {
    return api.get<IssuedGear[]>(
      `/issued-gears?userId=${userId}`
    );
  },
};