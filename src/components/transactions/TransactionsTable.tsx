import { ArrowUpDown } from "lucide-react";
import ActionMenu from "../common/ActionMenu";
import StatusBadge from "../common/StatusBadge";
import type { TransactionRecord } from "../../types/transactions";

type TransactionsTableProps = {
  records: TransactionRecord[];
};

function TransactionsTable({ records }: TransactionsTableProps) {
  const getStatusTone = (status: TransactionRecord["status"]) => {
    switch (status) {
      case "Pending":
        return "gray";
      case "Successful":
        return "green";
      case "Cancelled":
        return "orange";
      case "Failed":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-250">
        <thead>
          <tr className="h-11 border-b border-[#EAECF0] text-left">
            <th className="px-5 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Attendee <ArrowUpDown size={14} />
              </div>
            </th>

            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Date <ArrowUpDown size={14} />
              </div>
            </th>

            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Ticket type <ArrowUpDown size={14} />
              </div>
            </th>

            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Gateway <ArrowUpDown size={14} />
              </div>
            </th>

            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Total amount paid <ArrowUpDown size={14} />
              </div>
            </th>

            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Status <ArrowUpDown size={14} />
              </div>
            </th>

            <th className="px-5" />
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-[#EAECF0] align-top">
              <td className="px-5 py-5">
                <p className="text-[16px] font-semibold text-[#1F2430]">
                  {record.attendeeName}
                </p>
                <p className="mt-1 text-[16px] text-[#5D6470]">
                  {record.attendeeEmail}
                </p>
              </td>

              <td className="px-2 py-5 text-[16px] text-[#5D6470]">
                {record.date}
              </td>

              <td className="px-2 py-5">
                <StatusBadge label={record.ticketType} tone="blue" />
              </td>

              <td className="px-2 py-5">
                <span className="inline-flex rounded-full border border-[#D0D5DD] bg-white px-3 py-1 text-[14px] font-medium text-[#4B5563]">
                  {record.gateway}
                </span>
              </td>

              <td className="px-2 py-5 text-[16px] text-[#5D6470]">
                {record.totalAmountPaid}
              </td>

              <td className="px-2 py-5">
                <StatusBadge
                  label={record.status}
                  tone={getStatusTone(record.status)}
                />
              </td>

              <td className="px-5 py-5 text-right">
                <ActionMenu
                  items={[
                    {
                      label: "View details",
                      onClick: () => {
                        console.log("View transaction:", record.id);
                      },
                    },
                    {
                      label: "Download receipt",
                      onClick: () => {
                        console.log("Download receipt:", record.id);
                      },
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsTable;