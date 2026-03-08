export type StatCardItem = {
  title: string;
  value: number;
};

export type QuickActionItem = {
  id: string;
  label: string;
};

export type TransactionStatus = "Paid" | "Pending" | "Failed";

export type TransactionItem = {
  id: string;
  date: string;
  status: TransactionStatus;
  amount: string;
  attendeeName: string;
  attendeeEmail: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  time: string;
};

export type SidebarItem = {
  id: string;
  label: string;
  active?: boolean;
};