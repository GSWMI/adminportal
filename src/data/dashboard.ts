import type { StatCardItem } from "../types/dashboard";

export const emptyStats: StatCardItem[] = [
  { title: "Tickets created", value: 0 },
  { title: "Active tickets", value: 0 },
  { title: "Inactive tickets", value: 0 },
];

export const filledStats: StatCardItem[] = [
  { title: "Tickets created", value: 1 },
  { title: "Active tickets", value: 1 },
  { title: "Inactive tickets", value: 0 },
];