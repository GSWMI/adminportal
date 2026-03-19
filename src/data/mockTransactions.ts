export type TransactionStatus = 'Pending' | 'Successful' | 'Cancelled' | 'Failed'

export interface Transaction {
  id: string
  transactionId: string
  dateTime: string
  gateway: string
  totalAmountPaid: number
  status: TransactionStatus
  paymentReference: string
  paymentMethod: string
  attendee: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  ticket: {
    eventName: string
    ticketType: string
  }
  paymentSummary: {
    mealTicket?: number
    accommodationTicket?: number
    transportTicket?: number
    totalAmountPaid: number
  }
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    transactionId: 'TXN-PS-20250116-000234',
    dateTime: '16 Jan 2025, 10:42 AM',
    gateway: 'Paystack',
    totalAmountPaid: 65000,
    status: 'Pending',
    paymentReference: 'PS_ref_8FJ39DK',
    paymentMethod: 'Card',
    attendee: { firstName: 'Sienna', lastName: 'Hewitt', email: 'hi@siennahewitt.com', phone: '+2348168701083' },
    ticket: { eventName: 'GSWMI June Retreat 2026', ticketType: 'Meal' },
    paymentSummary: { mealTicket: 65000, totalAmountPaid: 65000 },
  },
  {
    id: '2',
    transactionId: 'TXN-PS-20250116-000235',
    dateTime: '16 Jan 2025, 11:00 AM',
    gateway: 'Paystack',
    totalAmountPaid: 65000,
    status: 'Pending',
    paymentReference: 'PS_ref_9KL12MN',
    paymentMethod: 'Card',
    attendee: { firstName: 'Ammar', lastName: 'Foley', email: 'ammarfoley@gmail.com', phone: '+2348100000001' },
    ticket: { eventName: 'GSWMI June Retreat 2026', ticketType: 'Meal' },
    paymentSummary: { mealTicket: 65000, totalAmountPaid: 65000 },
  },
  {
    id: '3',
    transactionId: 'TXN-PS-20250116-000236',
    dateTime: '16 Jan 2025, 11:15 AM',
    gateway: 'Paystack',
    totalAmountPaid: 65000,
    status: 'Successful',
    paymentReference: 'PS_ref_2PQ45RS',
    paymentMethod: 'Card',
    attendee: { firstName: 'Pippa', lastName: 'Wilkinson', email: 'pippa@pippaw.com', phone: '+2348100000002' },
    ticket: { eventName: 'GSWMI June Retreat 2026', ticketType: 'Meal' },
    paymentSummary: { mealTicket: 65000, totalAmountPaid: 65000 },
  },
  {
    id: '4',
    transactionId: 'TXN-FW-20250116-000237',
    dateTime: '16 Jan 2025, 12:00 PM',
    gateway: 'Flutterwave',
    totalAmountPaid: 65000,
    status: 'Cancelled',
    paymentReference: 'FW_ref_3TU67VW',
    paymentMethod: 'Card',
    attendee: { firstName: 'Olly', lastName: 'Schroeder', email: 'olly_s@icloud.com', phone: '+2348100000003' },
    ticket: { eventName: 'GSWMI June Retreat 2026', ticketType: 'Meal' },
    paymentSummary: { mealTicket: 65000, totalAmountPaid: 65000 },
  },
  {
    id: '5',
    transactionId: 'TXN-FW-20250116-000238',
    dateTime: '16 Jan 2025, 12:30 PM',
    gateway: 'Flutterwave',
    totalAmountPaid: 65000,
    status: 'Cancelled',
    paymentReference: 'FW_ref_4XY89ZA',
    paymentMethod: 'Card',
    attendee: { firstName: 'Mathilde', lastName: 'Lewis', email: 'mathilde@hey.com', phone: '+2348100000004' },
    ticket: { eventName: 'GSWMI June Retreat 2026', ticketType: 'Meal' },
    paymentSummary: { mealTicket: 65000, totalAmountPaid: 65000 },
  },
  {
    id: '6',
    transactionId: 'TXN-FW-20250116-000239',
    dateTime: '16 Jan 2025, 1:00 PM',
    gateway: 'Flutterwave',
    totalAmountPaid: 65000,
    status: 'Successful',
    paymentReference: 'FW_ref_5BC01DE',
    paymentMethod: 'Card',
    attendee: { firstName: 'Julius', lastName: 'Vaughan', email: 'juliusvaughan@gmail.com', phone: '+2348100000005' },
    ticket: { eventName: 'GSWMI June Retreat 2026', ticketType: 'Meal' },
    paymentSummary: { mealTicket: 65000, totalAmountPaid: 65000 },
  },
  {
    id: '7',
    transactionId: 'TXN-PS-20250116-000240',
    dateTime: '16 Jan 2025, 1:30 PM',
    gateway: 'Paystack',
    totalAmountPaid: 65000,
    status: 'Successful',
    paymentReference: 'PS_ref_6FG23HI',
    paymentMethod: 'Card',
    attendee: { firstName: 'Zaid', lastName: 'Schwartz', email: 'zaid@zaidstudio.com', phone: '+2348100000006' },
    ticket: { eventName: 'GSWMI June Retreat 2026', ticketType: 'Meal' },
    paymentSummary: { mealTicket: 65000, totalAmountPaid: 65000 },
  },
  {
    id: '8',
    transactionId: 'TXN-PS-20250116-000241',
    dateTime: '16 Jan 2025, 2:00 PM',
    gateway: 'Paystack',
    totalAmountPaid: 65000,
    status: 'Successful',
    paymentReference: 'PS_ref_7JK45LM',
    paymentMethod: 'Card',
    attendee: { firstName: 'Zaid', lastName: 'Schwartz', email: 'zaid@zaidstudio.com', phone: '+2348100000006' },
    ticket: { eventName: 'GSWMI June Retreat 2026', ticketType: 'Meal' },
    paymentSummary: { mealTicket: 65000, totalAmountPaid: 65000 },
  },
  {
    id: '9',
    transactionId: 'TXN-PS-20250116-000242',
    dateTime: '16 Jan 2025, 2:30 PM',
    gateway: 'Paystack',
    totalAmountPaid: 65000,
    status: 'Successful',
    paymentReference: 'PS_ref_8NO67PQ',
    paymentMethod: 'Card',
    attendee: { firstName: 'Zaid', lastName: 'Schwartz', email: 'zaid@zaidstudio.com', phone: '+2348100000006' },
    ticket: { eventName: 'GSWMI June Retreat 2026', ticketType: 'Meal' },
    paymentSummary: { mealTicket: 65000, totalAmountPaid: 65000 },
  },
  {
    id: '10',
    transactionId: 'TXN-PS-20250116-000243',
    dateTime: '16 Jan 2025, 3:00 PM',
    gateway: 'Paystack',
    totalAmountPaid: 65000,
    status: 'Failed',
    paymentReference: 'PS_ref_9RS89TU',
    paymentMethod: 'Card',
    attendee: { firstName: 'Zaid', lastName: 'Schwartz', email: 'zaid@zaidstudio.com', phone: '+2348100000006' },
    ticket: { eventName: 'GSWMI June Retreat 2026', ticketType: 'Meal' },
    paymentSummary: { mealTicket: 65000, totalAmountPaid: 65000 },
  },
]