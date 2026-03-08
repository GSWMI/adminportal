import { ArrowUpDown, ExternalLink, MoreVertical } from "lucide-react";
import type { TransactionItem } from "../../types/dashboard";

type TransactionsTableProps = {
  transactions: TransactionItem[];
};

function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-end px-5 py-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 text-[16px] font-semibold text-[#1E497E] shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
        >
          View all
          <ExternalLink size={18} />
        </button>
      </div>

      <table className="w-full min-w-[760px] border-t border-[#EAECF0]">
        <thead>
          <tr className="h-[44px] text-left">
            <th className="px-5 text-[14px] font-medium text-[#6B7280]">
              <input type="checkbox" className="h-5 w-5 rounded border-[#D0D5DD]" />
            </th>
            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                ID <ArrowUpDown size={14} />
              </div>
            </th>
            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Date <ArrowUpDown size={14} />
              </div>
            </th>
            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Status <ArrowUpDown size={14} />
              </div>
            </th>
            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Amount <ArrowUpDown size={14} />
              </div>
            </th>
            <th className="px-2 text-[14px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-1">
                Attendee <ArrowUpDown size={14} />
              </div>
            </th>
            <th className="px-5" />
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-t border-[#EAECF0] align-top"
            >
              <td className="px-5 py-5">
                <input type="checkbox" className="h-5 w-5 rounded border-[#D0D5DD]" />
              </td>

              <td className="px-2 py-5 text-[16px] font-semibold text-[#1F2430]">
                #{transaction.id}
              </td>

              <td className="px-2 py-5 text-[16px] text-[#5D6470]">
                {transaction.date}
              </td>

              <td className="px-2 py-5">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#D0D5DD] bg-white px-2 py-1 text-[14px] text-[#5D6470]">
                  <span className="h-2 w-2 rounded-full bg-[#12B76A]" />
                  {transaction.status}
                </span>
              </td>

              <td className="px-2 py-5 text-[16px] text-[#5D6470]">
                {transaction.amount}
              </td>

              <td className="px-2 py-5">
                <p className="text-[16px] font-medium text-[#1F2430]">
                  {transaction.attendeeName}
                </p>
                <p className="text-[16px] text-[#5D6470]">
                  {transaction.attendeeEmail}
                </p>
              </td>

              <td className="px-5 py-5 text-right">
                <button type="button" className="text-[#98A2B3]">
                  <MoreVertical size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsTable;