export type UserTab = "users" | "activity-log";

export type UserRecord = {
  id: string;
  name: string;
  lastActive: string;
  role: string;
  isCurrentUser?: boolean;
};

export type UserActivityRecord = {
  id: string;
  user: string;
  activity: string;
  timestamp: string;
};