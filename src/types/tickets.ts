export type TicketTab = "upcoming" | "past";

export type TicketEvent = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string;
};