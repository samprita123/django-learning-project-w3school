import { crmLeads, hotelRegistry, serviceCatalog } from "@/features/core/data/catalog";
import type { AppUser } from "@/types/auth";
import type { ActivityFeedEntry, GuestProfile, Reservation } from "@/types/pms";

export type SearchResult = {
  id: string;
  type: "Guest" | "Reservation" | "Task" | "Lead" | "Hotel" | "Service" | "Activity" | "User";
  label: string;
  ref: string;
  route: string;
};

export function buildSearchIndex(params: {
  guests: GuestProfile[];
  reservations: Reservation[];
  activityFeed: ActivityFeedEntry[];
  users: AppUser[];
}): SearchResult[] {
  const fromGuests: SearchResult[] = params.guests.map((g) => ({
    id: `guest-${g.name}`,
    type: "Guest",
    label: g.name,
    ref: g.email || g.country,
    route: "/guests",
  }));

  const fromReservations: SearchResult[] = params.reservations.map((r) => ({
    id: `reservation-${r.id}`,
    type: "Reservation",
    label: `${r.id} · ${r.type}`,
    ref: r.guest,
    route: "/reservations",
  }));

  const fromLeads: SearchResult[] = crmLeads.map((lead) => ({
    id: `lead-${lead.id}`,
    type: "Lead",
    label: lead.name,
    ref: lead.id,
    route: "/leads",
  }));

  const fromHotels: SearchResult[] = hotelRegistry.map((hotel) => ({
    id: `hotel-${hotel.id}`,
    type: "Hotel",
    label: hotel.name,
    ref: `${hotel.city} · ${hotel.id}`,
    route: "/hotels",
  }));

  const fromServices: SearchResult[] = serviceCatalog.map((service) => ({
    id: `service-${service.id}`,
    type: "Service",
    label: service.name,
    ref: `${service.category} · ${service.id}`,
    route: "/services",
  }));

  const fromActivity: SearchResult[] = params.activityFeed.slice(0, 8).map((a, idx) => ({
    id: `activity-${idx}`,
    type: "Activity",
    label: a.text,
    ref: a.time,
    route: "/activity-timeline",
  }));

  const fromUsers: SearchResult[] = params.users.map((u) => ({
    id: `user-${u.id}`,
    type: "User",
    label: u.name,
    ref: u.email,
    route: "/staff",
  }));

  return [
    ...fromGuests,
    ...fromReservations,
    ...fromLeads,
    ...fromHotels,
    ...fromServices,
    ...fromActivity,
    ...fromUsers,
  ];
}
