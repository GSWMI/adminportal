import type { UserActivityRecord, UserRecord } from "../types/users";

export const userRecords: UserRecord[] = [
  {
    id: "1",
    name: "Lesi Lion",
    lastActive: "16 Jan 2025",
    role: "This is you",
    isCurrentUser: true,
  },
  {
    id: "2",
    name: "Zia Zia",
    lastActive: "16 Jan 2025",
    role: "Admin",
  },
  {
    id: "3",
    name: "Ola Ola",
    lastActive: "16 Jan 2025",
    role: "Subadmin",
  },
];

export const userActivityRecords: UserActivityRecord[] = [
  {
    id: "1",
    user: "Lesi Lion",
    activity: "New user added",
    timestamp: "16 Jan 2025, 10:30AM",
  },
  {
    id: "2",
    user: "Lesi Lion",
    activity: "New user added",
    timestamp: "16 Jan 2025, 10:30AM",
  },
  {
    id: "3",
    user: "Lesi Lion",
    activity: "New user added",
    timestamp: "16 Jan 2025, 10:30AM",
  },
  {
    id: "4",
    user: "Zia Zia",
    activity: "New ticket created",
    timestamp: "16 Jan 2025, 10:30AM",
  },
  {
    id: "5",
    user: "Zia Zia",
    activity: "New ticket created",
    timestamp: "16 Jan 2025, 10:30AM",
  },
  {
    id: "6",
    user: "Zia Zia",
    activity: "New ticket created",
    timestamp: "16 Jan 2025, 10:30AM",
  },
  {
    id: "7",
    user: "Ola Ola",
    activity: "New user added",
    timestamp: "16 Jan 2025, 10:30AM",
  },
  {
    id: "8",
    user: "Ola Ola",
    activity: "New user added",
    timestamp: "16 Jan 2025, 10:30AM",
  },
  {
    id: "9",
    user: "Ola Ola",
    activity: "New user added",
    timestamp: "16 Jan 2025, 10:30AM",
  },
  {
    id: "10",
    user: "Ola Ola",
    activity: "New user added",
    timestamp: "16 Jan 2025, 10:30AM",
  },
];