export type TransactionStatus =
  | "Pending"
  | "Successful"
  | "Cancelled"
  | "Failed";

export type GatewayType = "Paystack" | "Flutterwave";

export type TicketType = "Meal";

export type TransactionRecord = {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  date: string;
  ticketType: TicketType;
  gateway: GatewayType;
  totalAmountPaid: string;
  status: TransactionStatus;
};